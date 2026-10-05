import {
  Grn,
  Indent,
  Material,
  MaterialCategory,
  PurchaseOrder,
  QcInspection,
  User,
} from "../db/models/index.js";
import { addPendingReceipt, adjustSiteStock, confirmPendingReceipt } from "./inventory.js";
import { getInwardRecord } from "./inward.js";

/**
 * GRN workflow, after the quality check:
 *
 *   QC finished → GRN created (pending Site Engineer)
 *     → Site Engineer approves (pending Project Manager)
 *     → Project Manager approves — the final check that authorises stock
 *       posting: accepted quantity is posted to the site and the purchase
 *       order's delivered quantity moves (pending store confirmation)
 *     → Store Manager confirms receipt — the stock becomes available to use.
 *
 * Every step is a compare-and-set on the GRN's `stage`, so a step can only be
 * taken once and only in order.
 */

const OPEN_QC = ["pending-inspection", "under-inspection"];

export class GrnStageError extends Error {
  constructor(message) {
    super(message);
    this.name = "GrnStageError";
  }
}

export async function approvalEntry(userId, action, remarks) {
  const user = userId ? await User.findById(userId, { role: 1 }).lean() : null;
  return {
    approverId: userId ?? "system",
    role: user?.role ?? "system",
    action,
    remarks,
    at: new Date(),
  };
}

/**
 * Moves a record (a GRN by default, or any model with the same `stage` /
 * `approvals` fields — replacement deliveries use it too) from one stage to
 * the next; throws if it is at neither `from` nor `to`. Returns:
 *   - `{ status: "claimed", record }` — this call made the transition; the
 *     caller should run the step's side effects (posting/confirming stock).
 *   - `{ status: "already-done", record }` — the record is already at `to`
 *     (e.g. a duplicate click after the first request succeeded); the
 *     caller should treat this as success without repeating side effects,
 *     since they already ran once.
 *   - `{ status: "not-found" }` — no such record.
 */
export async function transition(id, from, to, entry, Model = Grn) {
  const claimed = await Model.findOneAndUpdate(
    { _id: id, stage: from },
    { stage: to, $push: { approvals: entry } },
  ).lean();
  if (claimed) return { status: "claimed", record: claimed };
  const existing = await Model.findById(id, { stage: 1 }).lean();
  if (!existing) return { status: "not-found" };
  if (existing.stage === to) return { status: "already-done", record: existing };
  throw new GrnStageError(
    `This is not waiting for that step (it is ${existing.stage ?? "already received"})`,
  );
}

/** Puts a record back at `from` and drops the approval entry the failed step added. */
export function revert(id, from, Model = Grn) {
  return Model.updateOne({ _id: id }, { stage: from, $pop: { approvals: 1 } });
}

async function acceptedLines(grnId) {
  const rows = await QcInspection.find(
    { inwardId: grnId, acceptedQuantity: { $gt: 0 } },
    { materialCode: 1, materialName: 1, unit: 1, acceptedQuantity: 1 },
  ).lean();
  const byCode = new Map();
  for (const row of rows) {
    const current = byCode.get(row.materialCode) ?? {
      materialCode: row.materialCode,
      materialName: row.materialName,
      unit: row.unit,
      quantity: 0,
    };
    current.quantity += Number(row.acceptedQuantity);
    byCode.set(row.materialCode, current);
  }
  return [...byCode.values()];
}

export async function categoryName(materialCode) {
  const material = await Material.findOne({ code: materialCode }, { categoryId: 1 }).lean();
  const category = material
    ? await MaterialCategory.findById(material.categoryId, { name: 1 }).lean()
    : null;
  return category?.name ?? "Uncategorised";
}

/**
 * Called when a QC line is inspected. Once every line has a verdict the GRN is
 * "created": if anything was accepted it goes to the Site Engineer for
 * approval, otherwise there is nothing to post and it is closed.
 */
export async function advanceGrnAfterQc(grnId, inspectorId) {
  const grn = await Grn.findById(grnId, { stage: 1 }).lean();
  if (!grn || (grn.stage && grn.stage !== "awaiting-qc")) return;
  const lines = await QcInspection.find(
    { inwardId: grnId },
    { status: 1, acceptedQuantity: 1 },
  ).lean();
  if (lines.length === 0 || lines.some((line) => OPEN_QC.includes(line.status))) return;

  const accepted = lines.reduce((total, line) => total + Number(line.acceptedQuantity), 0);
  if (accepted > 0) {
    await Grn.updateOne(
      { _id: grnId, stage: { $in: [null, "awaiting-qc"] } },
      {
        stage: "pending-engineer-approval",
        $push: {
          approvals: await approvalEntry(
            inspectorId,
            "grn-created",
            `Quality check passed — ${accepted} accepted. GRN raised for approval.`,
          ),
        },
      },
    );
  } else {
    await Grn.updateOne(
      { _id: grnId, stage: { $in: [null, "awaiting-qc"] } },
      { stage: "closed" },
    );
  }
}

export async function approveGrnAsSiteEngineer(grnId, { userId, remarks }) {
  const entry = await approvalEntry(userId, "site-engineer-approved", remarks);
  const result = await transition(
    grnId,
    "pending-engineer-approval",
    "pending-manager-approval",
    entry,
  );
  return result.status === "not-found" ? null : getInwardRecord(grnId);
}

/**
 * Rolls accepted quantity onto the sourcing PO's delivered quantity/status and
 * records the price actually paid as the material's current price.
 */
async function rollUpPoDelivery(grn, materialCode, acceptedQuantity) {
  const order = await PurchaseOrder.findById(grn.purchaseOrderId);
  if (!order) return;
  const line = order.items.find((item) => item.materialCode === materialCode);
  if (!line) return;
  line.receivedQuantity = Number(line.receivedQuantity) + acceptedQuantity;
  await Material.updateOne({ code: materialCode }, { lastPurchasePrice: Number(line.unitPrice) });

  const fullyDelivered = order.items.every(
    (item) => Number(item.receivedQuantity) >= Number(item.orderedQuantity) - 1e-6,
  );
  const anyDelivered = order.items.some((item) => Number(item.receivedQuantity) > 0);
  const deliveryEligible = new Set(["released", "partially-delivered", "fully-delivered"]);
  if (deliveryEligible.has(order.status)) {
    if (fullyDelivered) order.status = "fully-delivered";
    else if (anyDelivered) order.status = "partially-delivered";
  }
  await order.save();
}

/**
 * Project Manager's final check. Authorises the stock posting: the accepted
 * quantity is posted to the site (held as awaiting store confirmation) and the
 * PO's delivered quantity moves.
 */
export async function approveGrnAsProjectManager(grnId, { userId, remarks }) {
  const entry = await approvalEntry(userId, "project-manager-approved", remarks);
  const result = await transition(
    grnId,
    "pending-manager-approval",
    "pending-store-confirmation",
    entry,
  );
  if (result.status === "not-found") return null;
  // Already posted by an earlier call (e.g. a duplicate click) — don't post twice.
  if (result.status === "already-done") return getInwardRecord(grnId);
  const claimed = result.record;

  const posted = [];
  try {
    for (const line of await acceptedLines(grnId)) {
      await addPendingReceipt({
        projectId: claimed.projectId,
        materialCode: line.materialCode,
        materialName: line.materialName,
        category: await categoryName(line.materialCode),
        unit: line.unit,
        quantity: line.quantity,
      });
      posted.push(line);
      await rollUpPoDelivery(claimed, line.materialCode, line.quantity);
    }
  } catch (error) {
    // Undo what was posted and reopen the step, rather than leave a half-posted GRN.
    for (const line of posted) {
      await addPendingReceipt({
        projectId: claimed.projectId,
        materialCode: line.materialCode,
        materialName: line.materialName,
        category: "Uncategorised",
        unit: line.unit,
        quantity: -line.quantity,
      });
    }
    await revert(grnId, "pending-manager-approval");
    throw error;
  }
  return getInwardRecord(grnId);
}

/** Store Manager confirms the posted stock has been received — it becomes available to use. */
export async function confirmGrnReceipt(grnId, { userId, remarks }) {
  const entry = await approvalEntry(userId, "store-confirmed", remarks);
  const result = await transition(grnId, "pending-store-confirmation", "received", entry);
  if (result.status === "not-found") return null;
  // Already confirmed by an earlier call (e.g. a duplicate click) — don't post twice.
  if (result.status === "already-done") return getInwardRecord(grnId);
  const claimed = result.record;

  const confirmed = [];
  try {
    for (const line of await acceptedLines(grnId)) {
      // May be less than `line.quantity` if some of it was already drawn
      // into available stock by an issue made before this confirmation ran.
      const confirmedQuantity = await confirmPendingReceipt({
        projectId: claimed.projectId,
        materialCode: line.materialCode,
        materialName: line.materialName,
        category: await categoryName(line.materialCode),
        unit: line.unit,
        quantity: line.quantity,
        referenceId: grnId,
      });
      confirmed.push({ ...line, confirmedQuantity });
    }
  } catch (error) {
    for (const line of confirmed) {
      await adjustSiteStock({
        projectId: claimed.projectId,
        materialCode: line.materialCode,
        materialName: line.materialName,
        category: "Uncategorised",
        unit: line.unit,
        delta: -line.confirmedQuantity,
        movementType: "goods-inward",
        referenceId: grnId,
      });
      await addPendingReceipt({
        projectId: claimed.projectId,
        materialCode: line.materialCode,
        materialName: line.materialName,
        category: "Uncategorised",
        unit: line.unit,
        quantity: line.confirmedQuantity,
      });
    }
    await revert(grnId, "pending-store-confirmation");
    throw error;
  }
  await completeSourceIndentIfFulfilled(claimed.purchaseOrderId);
  return getInwardRecord(grnId);
}

/**
 * Once material is actually confirmed into store, the indent that started
 * this chain is done — but only once every purchase order raised against it
 * (not just this one) has nothing more outstanding. `fully-delivered` is set
 * earlier, at Project Manager GRN-approval time (see `rollUpPoDelivery`);
 * this only *acts* on it once the Store Manager has physically confirmed
 * receipt, matching what "item added to store" means for the requester.
 */
async function completeSourceIndentIfFulfilled(purchaseOrderId) {
  const order = await PurchaseOrder.findById(purchaseOrderId, {
    sourceIndentId: 1,
  }).lean();
  if (!order?.sourceIndentId) return;
  const siblingOrders = await PurchaseOrder.find(
    { sourceIndentId: order.sourceIndentId, status: { $nin: ["cancelled", "rejected"] } },
    { status: 1 },
  ).lean();
  const allDelivered =
    siblingOrders.length > 0 &&
    siblingOrders.every((row) => row.status === "fully-delivered" || row.status === "closed");
  if (!allDelivered) return;
  await Indent.updateOne(
    { _id: order.sourceIndentId, status: { $ne: "completed" } },
    { status: "completed" },
  );
}

/** An approver turns the GRN down at their step. Nothing has been posted yet, so nothing is undone. */
export async function rejectGrn(grnId, { userId, remarks }) {
  const existing = await Grn.findById(grnId, { stage: 1 }).lean();
  if (!existing) return null;
  const from = existing.stage;
  if (from !== "pending-engineer-approval" && from !== "pending-manager-approval") {
    throw new GrnStageError("Only a GRN waiting for approval can be rejected");
  }
  const entry = await approvalEntry(userId, "rejected", remarks);
  await transition(grnId, from, "rejected", entry);
  return getInwardRecord(grnId);
}

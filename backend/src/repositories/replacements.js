import { Replacement, User } from "../db/models/index.js";
import { roundMoney, unitPricesByCode } from "./material-pricing.js";

const EPSILON = 1e-6;

export class ReplacementQuantityError extends Error {
  constructor(message) {
    super(message);
    this.name = "ReplacementQuantityError";
  }
}
export class ReplacementNotAllowedError extends Error {
  constructor(message) {
    super(message);
    this.name = "ReplacementNotAllowedError";
  }
}

/**
 * How many units a "replace" settlement covers. Settlements logged before
 * quantities were tracked have none stored, so they cover the whole
 * rejected/damaged quantity.
 */
export function expectedReplacementQuantity(row, settledQuantity) {
  const agreed = Number(row.resolutionQuantity ?? 0);
  return agreed > EPSILON ? agreed : settledQuantity;
}

/** awaiting-replacement → partially-replaced → replaced, for a "replace" settlement. */
export function replacementProgress(receivedQuantity, expectedQuantity) {
  if (receivedQuantity >= expectedQuantity - EPSILON) return "replaced";
  return receivedQuantity > EPSILON ? "partially-replaced" : "awaiting-replacement";
}

/** Legacy deliveries (no stage) were posted to stock at once, so they read as received. */
export function replacementStage(row) {
  return row.stage ?? "received";
}

function mapReplacement(row, userNames) {
  return {
    id: row._id,
    sourceType: row.sourceType,
    sourceId: row.sourceId,
    projectId: row.projectId,
    stage: replacementStage(row),
    approvals: (row.approvals ?? []).map((entry) => ({
      action: entry.action,
      approverId: entry.approverId,
      approver: userNames.get(entry.approverId) ?? entry.approverId,
      role: entry.role,
      remarks: entry.remarks ?? "",
      at: new Date(entry.at).toISOString(),
    })),
    quantity: Number(row.quantity),
    unitPrice: Number(row.unitPrice),
    value: Number(row.value),
    remarks: row.remarks,
    receivedById: row.receivedById,
    receivedByName: userNames.get(row.receivedById) ?? row.receivedById,
    receivedAt: row.receivedAt.toISOString(),
  };
}

/** Replacement deliveries for a set of QC/return records, keyed by source id (oldest first). */
export async function replacementsBySource(sourceType, sourceIds) {
  const bySource = new Map();
  if (sourceIds.length === 0) return bySource;
  const rows = await Replacement.find({ sourceType, sourceId: { $in: sourceIds } })
    .sort({ receivedAt: 1 })
    .lean();
  const userNames = await namesFor(rows);
  for (const row of rows) {
    const list = bySource.get(row.sourceId) ?? [];
    list.push(mapReplacement(row, userNames));
    bySource.set(row.sourceId, list);
  }
  return bySource;
}

async function namesFor(rows) {
  const userIds = [
    ...new Set(
      rows.flatMap((row) => [row.receivedById, ...(row.approvals ?? []).map((a) => a.approverId)]),
    ),
  ].filter(Boolean);
  const userRows = userIds.length
    ? await User.find({ _id: { $in: userIds } }, { name: 1 }).lean()
    : [];
  return new Map(userRows.map((row) => [row._id, row.name]));
}

/** One delivery, mapped like the entries in a resolution's `replacements`. */
export async function getReplacement(replacementId) {
  const row = await Replacement.findById(replacementId).lean();
  if (!row) return null;
  return mapReplacement(row, await namesFor([row]));
}

async function submittedEntry(userId) {
  const user = await User.findById(userId, { role: 1 }).lean();
  return {
    approverId: userId,
    role: user?.role ?? "system",
    action: "submitted",
    remarks: "Replacement delivery recorded — awaiting approval before it is added to stock.",
    at: new Date(),
  };
}

async function nextReplacementId() {
  const count = await Replacement.countDocuments();
  return `RPL-${String(count + 1).padStart(5, "0")}`;
}

/**
 * Records a delivery of replacement material under a new replacement id
 * (RPL-…). Nothing is added to stock yet: the delivery goes through the same
 * approval path as a GRN — Site Engineer, Project Manager (who posts the stock)
 * and Store Manager confirmation — see `replacement-workflow.js`. The RPL id
 * becomes the stock-ledger reference once it is confirmed.
 *
 * The delivery is first claimed against the parent's `replacedQuantity` in one
 * atomic update, so two simultaneous deliveries can never receive more than
 * was agreed. If anything after that fails, the claim and the record are
 * undone rather than leaving stock and the counter out of step.
 *
 * `Model` is the QC or Return model, `existing` its lean document, and
 * `expectedQuantity` the units the settlement covers.
 */
export async function receiveReplacement({
  Model,
  sourceType,
  existing,
  expectedQuantity,
  quantity,
  remarks,
  receivedById,
}) {
  const remaining = expectedQuantity - Number(existing.replacedQuantity ?? 0);
  if (!(remaining > EPSILON)) {
    throw new ReplacementNotAllowedError("The replacement has already been fully received");
  }
  if (!(quantity > 0)) {
    throw new ReplacementQuantityError("Enter the number of units received");
  }
  if (quantity > remaining + EPSILON) {
    throw new ReplacementQuantityError(
      `Only ${remaining} ${existing.unit} are still to be replaced`,
    );
  }

  const claimed = await Model.findOneAndUpdate(
    {
      _id: existing._id,
      $expr: {
        $lte: [
          { $add: [{ $ifNull: ["$replacedQuantity", 0] }, quantity] },
          expectedQuantity + EPSILON,
        ],
      },
    },
    { $inc: { replacedQuantity: quantity } },
  ).lean();
  if (!claimed) {
    throw new ReplacementQuantityError(
      "More units were just recorded against this replacement — reload and try again",
    );
  }
  const release = () =>
    Model.updateOne({ _id: existing._id }, { $inc: { replacedQuantity: -quantity } });

  const unitPrice =
    (await unitPricesByCode([existing.materialCode])).get(existing.materialCode) ?? 0;
  const replacement = {
    sourceType,
    sourceId: existing._id,
    projectId: existing.projectId,
    materialCode: existing.materialCode,
    materialName: existing.materialName,
    unit: existing.unit,
    quantity,
    unitPrice,
    value: roundMoney(quantity * unitPrice),
    remarks,
    receivedById,
    receivedAt: new Date(),
    stage: "pending-engineer-approval",
    approvals: [await submittedEntry(receivedById)],
  };

  let id;
  for (let attempt = 0; ; attempt += 1) {
    id = await nextReplacementId();
    try {
      await Replacement.create({ _id: id, ...replacement });
      break;
    } catch (error) {
      // Two deliveries picked the same number at once; take the next one.
      if (error?.code === 11000 && attempt < 4) continue;
      await release();
      throw error;
    }
  }

  return id;
}

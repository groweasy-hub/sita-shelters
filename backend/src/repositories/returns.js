import {
  DamagedStock,
  Grn,
  Material,
  MaterialCategory,
  Project,
  QcInspection,
  Return,
  User,
  Vendor,
} from "../db/models/index.js";
import { adjustSiteStock } from "./inventory.js";
import { completeRefund, mapRefund } from "./refunds.js";
import { roundMoney, unitPricesByCode } from "./material-pricing.js";
import {
  expectedReplacementQuantity,
  receiveReplacement,
  ReplacementNotAllowedError,
  ReplacementQuantityError,
  replacementProgress,
  replacementsBySource,
} from "./replacements.js";
import {
  applyIssueDelta,
  getMaterialIssueRow,
  outstandingQuantity,
} from "./material-issues.js";

const DAMAGED_STOCK_DEPARTMENTS = new Set([
  "civil",
  "electrical",
  "plumbing",
  "fire-safety",
  "finishing",
  "stores",
  "logistics",
]);

function mapReturn(row) {
  return {
    id: row._id,
    materialIssueId: row.materialIssueId,
    projectId: row.projectId,
    projectName: row.projectName,
    materialCode: row.materialCode,
    materialName: row.materialName,
    unit: row.unit,
    unitPrice: row.unitPrice ?? 0,
    returningQuantity: Number(row.returningQuantity),
    reason: row.reason,
    returnedById: row.returnedById,
    returnedByName: row.returnedByName ?? row.returnedById,
    returnedAt: row.returnedAt.toISOString(),
    inspection: {
      status: row.inspectionStatus,
      goodQuantity: Number(row.inspectionGoodQuantity),
      damagedQuantity: Number(row.inspectionDamagedQuantity),
      inspectedById: row.inspectionById,
      inspectedByName: row.inspectionById
        ? (row.inspectedByName ?? row.inspectionById)
        : null,
      inspectedAt: row.inspectionAt ? row.inspectionAt.toISOString() : null,
      remarks: row.inspectionRemarks,
    },
    resolution: row.resolutionType
      ? {
          type: row.resolutionType,
          amount: Number(row.resolutionAmount),
          // Units the settlement covers (a replacement is expected in full unless agreed otherwise).
          quantity:
            row.resolutionType === "replace"
              ? expectedReplacementQuantity(row, Number(row.inspectionDamagedQuantity))
              : Number(row.resolutionQuantity ?? 0),
          replacedQuantity: Number(row.replacedQuantity ?? 0),
          replacements: row.replacements ?? [],
          refund: row.resolutionType === "refund" ? mapRefund(row) : null,
          remarks: row.resolutionRemarks,
          resolvedById: row.resolvedById,
          resolvedByName: row.resolvedByName ?? row.resolvedById,
          resolvedAt: row.resolvedAt.toISOString(),
        }
      : null,
  };
}

async function withNames(rows) {
  const projectIds = [...new Set(rows.map((row) => row.projectId))];
  const userIds = [
    ...new Set(
      rows.flatMap((row) =>
        [row.returnedById, row.inspectionById, row.resolvedById, row.refundCompletedById].filter(
          Boolean,
        ),
      ),
    ),
  ];
  const [projectRows, userRows, prices, replacements] = await Promise.all([
    projectIds.length
      ? Project.find({ _id: { $in: projectIds } }, { name: 1 }).lean()
      : Promise.resolve([]),
    userIds.length
      ? User.find({ _id: { $in: userIds } }, { name: 1 }).lean()
      : Promise.resolve([]),
    unitPricesByCode(rows.map((row) => row.materialCode)),
    replacementsBySource("return", rows.map((row) => row._id)),
  ]);
  const projectNames = new Map(projectRows.map((row) => [row._id, row.name]));
  const userNames = new Map(userRows.map((row) => [row._id, row.name]));
  return rows.map((row) => ({
    ...row,
    projectName: projectNames.get(row.projectId) ?? row.projectId,
    unitPrice: prices.get(row.materialCode) ?? 0,
    replacements: replacements.get(row._id) ?? [],
    refundCompletedByName: row.refundCompletedById
      ? (userNames.get(row.refundCompletedById) ?? row.refundCompletedById)
      : null,
    returnedByName: userNames.get(row.returnedById) ?? row.returnedById,
    inspectedByName: row.inspectionById
      ? (userNames.get(row.inspectionById) ?? row.inspectionById)
      : null,
    resolvedByName: row.resolvedById
      ? (userNames.get(row.resolvedById) ?? row.resolvedById)
      : null,
  }));
}

export async function listAllReturns() {
  const rows = await Return.find().sort({ returnedAt: -1 }).lean();
  return (await withNames(rows)).map(mapReturn);
}

export async function getReturn(returnId) {
  const row = await Return.findById(returnId).lean();
  if (!row) return null;
  const [withName] = await withNames([row]);
  return mapReturn(withName);
}

async function nextId() {
  const count = await Return.countDocuments();
  return `RET-${String(count + 1).padStart(5, "0")}`;
}

export class UnknownMaterialIssueError extends Error {
  constructor(issueId) {
    super(`Unknown material issue: ${issueId}`);
    this.name = "UnknownMaterialIssueError";
  }
}
export class ExcessQuantityError extends Error {
  constructor(message) {
    super(message);
    this.name = "ExcessQuantityError";
  }
}

/** Logs the unused remainder of a material issue coming back to store, pending inspection. */
export async function createReturn({
  materialIssueId,
  returningQuantity,
  reason,
  returnedById,
}) {
  const issue = await getMaterialIssueRow(materialIssueId);
  if (!issue) {
    throw new UnknownMaterialIssueError(materialIssueId);
  }
  if (returningQuantity > outstandingQuantity(issue) + 1e-6) {
    throw new ExcessQuantityError(
      "Returning quantity cannot exceed the issue's outstanding quantity",
    );
  }

  const id = await nextId();
  await Return.create({
    _id: id,
    materialIssueId,
    projectId: issue.projectId,
    materialCode: issue.materialCode,
    materialName: issue.materialName,
    unit: issue.unit,
    returningQuantity,
    reason,
    returnedById,
    returnedAt: new Date(),
    inspectionStatus: "pending-inspection",
    inspectionGoodQuantity: 0,
    inspectionDamagedQuantity: 0,
    inspectionRemarks: "Awaiting quality inspector sign-off.",
  });

  await applyIssueDelta(materialIssueId, { returnedDelta: returningQuantity });

  return getReturn(id);
}

/**
 * Records the good/damaged split for a pending return. Good quantity goes
 * back into site stock; damaged quantity is written off into damaged stock.
 * Neither touches the parent issue's totals again — `returningQuantity` was
 * already booked against it when the return was logged.
 */
export async function inspectReturn(
  returnId,
  { goodQuantity, damagedQuantity, inspectedById, remarks },
) {
  const existing = await Return.findById(returnId).lean();
  if (!existing) return null;

  const status = damagedQuantity > 0 ? "damaged" : "good";
  await Return.updateOne(
    { _id: returnId },
    {
      inspectionStatus: status,
      inspectionGoodQuantity: goodQuantity,
      inspectionDamagedQuantity: damagedQuantity,
      inspectionById: inspectedById,
      inspectionAt: new Date(),
      inspectionRemarks: remarks,
    },
  );

  const material = await Material.findOne(
    { code: existing.materialCode },
    { categoryId: 1, lastPurchasePrice: 1 },
  ).lean();
  const category = material
    ? await MaterialCategory.findById(material.categoryId, { name: 1 }).lean()
    : null;

  if (goodQuantity > 0) {
    await adjustSiteStock({
      projectId: existing.projectId,
      materialCode: existing.materialCode,
      materialName: existing.materialName,
      category: category?.name ?? "Uncategorised",
      unit: existing.unit,
      delta: goodQuantity,
      movementType: "return",
      referenceId: returnId,
    });
  }
  if (damagedQuantity > 0) {
    const department = DAMAGED_STOCK_DEPARTMENTS.has(material?.categoryId)
      ? material.categoryId
      : "stores";
    await DamagedStock.create({
      _id: crypto.randomUUID(),
      type: "damage",
      projectId: existing.projectId,
      materialCode: existing.materialCode,
      materialName: existing.materialName,
      unit: existing.unit,
      quantity: damagedQuantity,
      financialValue: damagedQuantity * Number(material?.lastPurchasePrice ?? 0),
      reason: "site-handling",
      department,
      date: new Date(),
      sourceType: "return-inspection",
      sourceId: returnId,
      remarks,
    });
  }

  return getReturn(returnId);
}

export class ReturnNothingToResolveError extends Error {
  constructor(message) {
    super(message);
    this.name = "ReturnNothingToResolveError";
  }
}
export { ReplacementNotAllowedError, ReplacementQuantityError };
export { RefundNotAllowedError } from "./refunds.js";

/**
 * Settles the damaged part of an inspected return for a quantity (never more
 * than was found damaged). The value is worked out here — quantity × the
 * material's current unit price — rather than typed in, so it can't be
 * entered wrong. Choosing "replace" only records what is to be replaced; site
 * stock is not touched until the replacement arrives and is recorded with
 * `receiveReturnReplacement`. A refund only records the amount. Settled once
 * — the record is claimed atomically so a double-submit can't settle it twice.
 */
export async function resolveReturn(
  returnId,
  { resolvedById, type, quantity, remarks },
) {
  const existing = await Return.findById(returnId).lean();
  if (!existing) return null;
  const damagedQuantity = Number(existing.inspectionDamagedQuantity);
  if (!(damagedQuantity > 0)) {
    throw new ReturnNothingToResolveError("There is no damaged quantity to resolve on this return");
  }
  if (existing.resolutionType) {
    throw new ReturnNothingToResolveError("This return has already been resolved");
  }
  if (!(quantity > 0)) {
    throw new ReplacementQuantityError(
      `Enter the quantity being ${type === "replace" ? "replaced" : "refunded"}`,
    );
  }
  if (quantity > damagedQuantity + 1e-6) {
    throw new ReplacementQuantityError(
      `Quantity cannot exceed the damaged ${damagedQuantity} ${existing.unit}`,
    );
  }
  const unitPrice = (await unitPricesByCode([existing.materialCode])).get(existing.materialCode) ?? 0;

  const claimed = await Return.findOneAndUpdate(
    { _id: returnId, resolutionType: null },
    {
      resolutionType: type,
      resolutionAmount: roundMoney(quantity * unitPrice),
      resolutionQuantity: quantity,
      resolutionRemarks: remarks,
      resolvedById,
      resolvedAt: new Date(),
    },
  ).lean();
  if (!claimed) {
    throw new ReturnNothingToResolveError("This return has already been resolved");
  }
  return getReturn(returnId);
}

/**
 * Records replacement material that has now arrived for the damaged part of a
 * return — all of it or only part. The units are added to site stock under a
 * new replacement id (RPL-…). Can be called again for the balance.
 */
export async function receiveReturnReplacement(
  returnId,
  { receivedById, quantity, remarks },
) {
  const existing = await Return.findById(returnId).lean();
  if (!existing) return null;
  if (existing.resolutionType !== "replace") {
    throw new ReplacementNotAllowedError(
      "Log the replacement as the resolution before recording the delivery",
    );
  }
  await receiveReplacement({
    Model: Return,
    sourceType: "return",
    existing,
    expectedQuantity: expectedReplacementQuantity(existing, Number(existing.inspectionDamagedQuantity)),
    quantity,
    remarks,
    receivedById,
  });
  return getReturn(returnId);
}

/** Marks the refund for a damaged return as received. */
export async function completeReturnRefund(
  returnId,
  { completedById, reference, remarks },
) {
  const existing = await Return.findById(returnId).lean();
  if (!existing) return null;
  await completeRefund({ Model: Return, existing, completedById, reference, remarks });
  return getReturn(returnId);
}

/**
 * Rejected goods-inward quantity going back to the vendor, with its
 * replace/refund settlement. These live on QC inspection records — the
 * Returns page reads them here so vendor returns and replacements sit next
 * to the site's own returns instead of only on the Quality Control page.
 */
function vendorReturnStatus(row) {
  if (!row.resolutionType) return "awaiting-resolution";
  if (row.resolutionType === "refund") return row.refundCompletedAt ? "refunded" : "refund-pending";
  return replacementProgress(
    Number(row.replacedQuantity ?? 0),
    expectedReplacementQuantity(row, Number(row.rejectedQuantity)),
  );
}

export async function listVendorReturns() {
  const rows = await QcInspection.find({ rejectedQuantity: { $gt: 0 } })
    .sort({ inspectedAt: -1 })
    .lean();

  const projectIds = [...new Set(rows.map((row) => row.projectId))];
  const inwardIds = [...new Set(rows.map((row) => row.inwardId))];
  const userIds = [
    ...new Set(rows.flatMap((row) => [row.resolvedById, row.refundCompletedById]).filter(Boolean)),
  ];
  const [projectRows, userRows, grnRows, replacements] = await Promise.all([
    projectIds.length ? Project.find({ _id: { $in: projectIds } }, { name: 1 }).lean() : [],
    userIds.length ? User.find({ _id: { $in: userIds } }, { name: 1 }).lean() : [],
    inwardIds.length
      ? Grn.find(
          { _id: { $in: inwardIds } },
          { grnNumber: 1, vendorId: 1, purchaseOrderId: 1 },
        ).lean()
      : [],
    replacementsBySource("qc", rows.map((row) => row._id)),
  ]);
  const vendorIds = [...new Set(grnRows.map((grn) => grn.vendorId))];
  const vendorRows = vendorIds.length
    ? await Vendor.find({ _id: { $in: vendorIds } }, { name: 1 }).lean()
    : [];
  const projectNames = new Map(projectRows.map((row) => [row._id, row.name]));
  const userNames = new Map(userRows.map((row) => [row._id, row.name]));
  const grns = new Map(grnRows.map((row) => [row._id, row]));
  const vendorNames = new Map(vendorRows.map((row) => [row._id, row.name]));

  return rows.map((row) => {
    const grn = grns.get(row.inwardId);
    return {
      id: row._id,
      inwardId: row.inwardId,
      grnNumber: grn?.grnNumber ?? row.inwardId,
      purchaseOrderId: grn?.purchaseOrderId ?? null,
      vendorId: grn?.vendorId ?? null,
      vendorName: grn ? (vendorNames.get(grn.vendorId) ?? grn.vendorId) : null,
      projectId: row.projectId,
      projectName: projectNames.get(row.projectId) ?? row.projectId,
      materialCode: row.materialCode,
      materialName: row.materialName,
      unit: row.unit,
      receivedQuantity: Number(row.receivedQuantity),
      rejectedQuantity: Number(row.rejectedQuantity),
      rejectedAt: (row.inspectedAt ?? new Date(0)).toISOString(),
      remarks: row.remarks,
      status: vendorReturnStatus(row),
      resolution: row.resolutionType
        ? {
            type: row.resolutionType,
            amount: Number(row.resolutionAmount),
            quantity:
              row.resolutionType === "replace"
                ? expectedReplacementQuantity(row, Number(row.rejectedQuantity))
                : Number(row.resolutionQuantity ?? 0),
            replacedQuantity: Number(row.replacedQuantity ?? 0),
            replacements: replacements.get(row._id) ?? [],
            refund:
              row.resolutionType === "refund"
                ? mapRefund({
                    ...row,
                    refundCompletedByName: row.refundCompletedById
                      ? (userNames.get(row.refundCompletedById) ?? row.refundCompletedById)
                      : null,
                  })
                : null,
            remarks: row.resolutionRemarks,
            resolvedById: row.resolvedById,
            resolvedByName: userNames.get(row.resolvedById) ?? row.resolvedById,
            resolvedAt: row.resolvedAt.toISOString(),
          }
        : null,
    };
  });
}

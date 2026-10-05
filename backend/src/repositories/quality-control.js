import {
  Grn,
  Project,
  QcInspection,
  User,
} from "../db/models/index.js";
import { advanceGrnAfterQc } from "./grn-workflow.js";
import { completeRefund, mapRefund } from "./refunds.js";
import { roundMoney, unitPricesByCode } from "./material-pricing.js";
import {
  expectedReplacementQuantity,
  receiveReplacement,
  ReplacementNotAllowedError,
  replacementsBySource,
} from "./replacements.js";

function mapInspection(row) {
  return {
    id: row._id,
    inwardId: row.inwardId,
    projectId: row.projectId,
    projectName: row.projectName,
    materialCode: row.materialCode,
    materialName: row.materialName,
    unit: row.unit,
    receivedQuantity: Number(row.receivedQuantity),
    acceptedQuantity: Number(row.acceptedQuantity),
    rejectedQuantity: Number(row.rejectedQuantity),
    unitPrice: row.unitPrice ?? 0,
    inspectorId: row.inspectorId,
    inspectorName: row.inspectorName ?? null,
    inspectorRole: row.inspectorRole ?? null,
    status: row.status,
    remarks: row.remarks,
    checklist: (row.checklist ?? []).map((item) => ({
      key: item.key,
      label: item.label,
      result: item.result,
    })),
    inspectedAt: row.inspectedAt ? row.inspectedAt.toISOString() : null,
    resolution: row.resolutionType
      ? {
          type: row.resolutionType,
          amount: Number(row.resolutionAmount),
          // Units the settlement covers (a replacement is expected in full unless agreed otherwise).
          quantity:
            row.resolutionType === "replace"
              ? expectedReplacementQuantity(row, Number(row.rejectedQuantity))
              : Number(row.resolutionQuantity ?? 0),
          replacedQuantity: Number(row.replacedQuantity ?? 0),
          replacements: row.replacements ?? [],
          refund: row.resolutionType === "refund" ? mapRefund(row) : null,
          remarks: row.resolutionRemarks,
          resolvedById: row.resolvedById,
          resolvedByName: row.resolvedByName ?? null,
          resolvedAt: row.resolvedAt.toISOString(),
        }
      : null,
  };
}

/** Adds the project and people names the UI shows in place of raw ids. */
async function withProjectNames(rows) {
  const projectIds = [...new Set(rows.map((row) => row.projectId))];
  const userIds = [
    ...new Set(
      rows
        .flatMap((row) => [row.inspectorId, row.resolvedById, row.refundCompletedById])
        .filter(Boolean),
    ),
  ];
  const [projectRows, userRows, prices, replacements] = await Promise.all([
    projectIds.length ? Project.find({ _id: { $in: projectIds } }, { name: 1 }).lean() : [],
    userIds.length ? User.find({ _id: { $in: userIds } }, { name: 1, role: 1 }).lean() : [],
    unitPricesByCode(rows.map((row) => row.materialCode)),
    replacementsBySource("qc", rows.map((row) => row._id)),
  ]);
  const names = new Map(projectRows.map((row) => [row._id, row.name]));
  const users = new Map(userRows.map((row) => [row._id, row]));
  return rows.map((row) => ({
    ...row,
    projectName: names.get(row.projectId) ?? row.projectId,
    unitPrice: prices.get(row.materialCode) ?? 0,
    replacements: replacements.get(row._id) ?? [],
    inspectorName: users.get(row.inspectorId)?.name ?? null,
    inspectorRole: users.get(row.inspectorId)?.role ?? null,
    resolvedByName: users.get(row.resolvedById)?.name ?? null,
    refundCompletedByName: users.get(row.refundCompletedById)?.name ?? null,
  }));
}

export async function listAllQualityControlInspections() {
  const rows = await QcInspection.find().sort({ inspectedAt: -1 }).lean();
  return (await withProjectNames(rows)).map(mapInspection);
}

export async function getQualityControlInspection(qcId) {
  const row = await QcInspection.findById(qcId).lean();
  if (!row) return null;
  const [withName] = await withProjectNames([row]);
  return mapInspection(withName);
}

export async function listQualityControlInspectionsByInward(inwardId) {
  const rows = await QcInspection.find({ inwardId }).lean();
  return (await withProjectNames(rows)).map(mapInspection);
}

/**
 * Recomputes the parent GRN's aggregate QC status from its QC lines. Accepted
 * quantity is not posted here — once every line has a verdict the GRN goes to
 * approval (see `grn-workflow.js`), and stock is posted only after the Project
 * Manager approves it.
 */
async function recomputeGrnStatus(inwardId) {
  const grn = await Grn.findById(inwardId, { status: 1 }).lean();
  if (!grn) return;
  const lines = await QcInspection.find({ inwardId }, { status: 1 }).lean();
  const statuses = new Set(lines.map((line) => line.status));
  let grnStatus;
  if (statuses.has("pending-inspection") || statuses.has("under-inspection")) {
    grnStatus = statuses.size === 1 ? "pending-qc" : "under-inspection";
  } else if (statuses.size === 1 && statuses.has("accepted")) {
    grnStatus = "accepted";
  } else if (statuses.size === 1 && statuses.has("rejected")) {
    grnStatus = "rejected";
  } else {
    grnStatus = "partially-accepted";
  }
  if (grnStatus !== grn.status) {
    await Grn.updateOne({ _id: inwardId }, { status: grnStatus });
  }
}

export class QcAlreadyInspectedError extends Error {
  constructor(qcId) {
    super(`${qcId} has already been inspected`);
    this.name = "QcAlreadyInspectedError";
  }
}

export class QcReplacementQuantityError extends Error {
  constructor(message) {
    super(message);
    this.name = "QcReplacementQuantityError";
  }
}

export class QcQuantityMismatchError extends Error {
  constructor(receivedQuantity, unit) {
    super(`Accepted and rejected quantities must add up to the received ${receivedQuantity} ${unit}`);
    this.name = "QcQuantityMismatchError";
  }
}

export class QcNothingToResolveError extends Error {
  constructor(message) {
    super(message);
    this.name = "QcNothingToResolveError";
  }
}

/**
 * Records the inspector's verdict. Passing material here does not make it
 * usable: once every line of the delivery has a verdict, the GRN is raised and
 * goes through Site Engineer and Project Manager approval before its stock is
 * posted. A record can only be inspected once, and accepted + rejected must
 * account for everything received.
 */
export async function inspectQualityControlRecord(
  qcId,
  { inspectorId, acceptedQuantity, rejectedQuantity, remarks, checklist = [] },
) {
  const existing = await QcInspection.findById(qcId).lean();
  if (!existing) return null;

  if (Math.abs(acceptedQuantity + rejectedQuantity - Number(existing.receivedQuantity)) > 1e-6) {
    throw new QcQuantityMismatchError(Number(existing.receivedQuantity), existing.unit);
  }

  // Claim the record atomically: only one request can move it out of "pending".
  const status = acceptedQuantity > 0 ? "accepted" : "rejected";
  const claimed = await QcInspection.findOneAndUpdate(
    { _id: qcId, status: { $in: ["pending-inspection", "under-inspection"] } },
    {
      acceptedQuantity,
      rejectedQuantity,
      inspectorId,
      remarks,
      checklist,
      status,
      inspectedAt: new Date(),
    },
  ).lean();
  if (!claimed) {
    throw new QcAlreadyInspectedError(qcId);
  }

  try {
    await recomputeGrnStatus(existing.inwardId);
    await advanceGrnAfterQc(existing.inwardId, inspectorId);
  } catch (error) {
    // Don't leave a record marked "inspected" whose GRN never moved on.
    await QcInspection.updateOne(
      { _id: qcId },
      {
        status: claimed.status,
        acceptedQuantity: claimed.acceptedQuantity,
        rejectedQuantity: claimed.rejectedQuantity,
        inspectorId: claimed.inspectorId,
        remarks: claimed.remarks,
        checklist: claimed.checklist ?? [],
        inspectedAt: claimed.inspectedAt,
      },
    );
    throw error;
  }

  return getQualityControlInspection(qcId);
}

/**
 * Settles a rejected delivery with the vendor for a quantity (never more than
 * was rejected). The value is worked out here — quantity × the material's
 * current unit price — rather than typed in, so it can't be entered wrong.
 * Choosing "replace" only records what the vendor has agreed to send; site
 * stock is not touched until the replacement arrives and is recorded with
 * `receiveQualityControlReplacement`. A refund only records the amount.
 * Settled once — the record is claimed atomically so a double-submit can't
 * settle it twice.
 */
export async function resolveQualityControlRecord(
  qcId,
  { resolvedById, type, quantity, remarks },
) {
  const existing = await QcInspection.findById(qcId).lean();
  if (!existing) return null;
  const rejectedQuantity = Number(existing.rejectedQuantity);
  if (!(rejectedQuantity > 0)) {
    throw new QcNothingToResolveError("There is no rejected quantity to settle with the vendor");
  }
  if (existing.resolutionType) {
    throw new QcNothingToResolveError("This rejection has already been settled");
  }
  if (!(quantity > 0)) {
    throw new QcReplacementQuantityError(
      `Enter the quantity the vendor is ${type === "replace" ? "replacing" : "refunding"}`,
    );
  }
  if (quantity > rejectedQuantity + 1e-6) {
    throw new QcReplacementQuantityError(
      `Quantity cannot exceed the rejected ${rejectedQuantity} ${existing.unit}`,
    );
  }
  const unitPrice = (await unitPricesByCode([existing.materialCode])).get(existing.materialCode) ?? 0;

  const claimed = await QcInspection.findOneAndUpdate(
    { _id: qcId, resolutionType: null },
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
    throw new QcNothingToResolveError("This rejection has already been settled");
  }
  return getQualityControlInspection(qcId);
}

/**
 * Records replacement material the vendor has now delivered for a rejected
 * quantity — all of it or only part. The units are added to site stock under
 * a new replacement id (RPL-…). Can be called again for the balance.
 */
export async function receiveQualityControlReplacement(
  qcId,
  { receivedById, quantity, remarks },
) {
  const existing = await QcInspection.findById(qcId).lean();
  if (!existing) return null;
  if (existing.resolutionType !== "replace") {
    throw new ReplacementNotAllowedError(
      "Log the vendor's replacement as the resolution before recording the delivery",
    );
  }
  await receiveReplacement({
    Model: QcInspection,
    sourceType: "qc",
    existing,
    expectedQuantity: expectedReplacementQuantity(existing, Number(existing.rejectedQuantity)),
    quantity,
    remarks,
    receivedById,
  });
  return getQualityControlInspection(qcId);
}

/** Marks the vendor's refund for a rejected delivery as received. */
export async function completeQualityControlRefund(
  qcId,
  { completedById, reference, remarks },
) {
  const existing = await QcInspection.findById(qcId).lean();
  if (!existing) return null;
  await completeRefund({ Model: QcInspection, existing, completedById, reference, remarks });
  return getQualityControlInspection(qcId);
}

import { Material, MaterialCategory, Project, StockTransfer } from "../db/models/index.js";
import { getUserById } from "./users.js";
import { adjustSiteStock } from "./inventory.js";

export class UnknownMaterialError extends Error {
  constructor(materialCode) {
    super(`Unknown material code: ${materialCode}`);
    this.name = "UnknownMaterialError";
  }
}
export class InvalidTransferTransitionError extends Error {
  constructor(from, action) {
    super(`Cannot ${action} a transfer that is currently "${from}"`);
    this.name = "InvalidTransferTransitionError";
  }
}
export class SameProjectTransferError extends Error {
  constructor() {
    super("Source and destination projects must differ");
    this.name = "SameProjectTransferError";
  }
}

function mapTransfer(row, projectNames, userNames) {
  return {
    id: row._id,
    sourceProjectId: row.sourceProjectId,
    sourceProjectName: projectNames.get(row.sourceProjectId) ?? row.sourceProjectId,
    destinationProjectId: row.destinationProjectId,
    destinationProjectName:
      projectNames.get(row.destinationProjectId) ?? row.destinationProjectId,
    materialCode: row.materialCode,
    materialName: row.materialName,
    unit: row.unit,
    quantity: Number(row.quantity),
    status: row.status,
    requestedById: row.requestedById,
    requestedByName: userNames.get(row.requestedById) ?? row.requestedById,
    approvedById: row.approvedById,
    approvedByName: row.approvedById
      ? (userNames.get(row.approvedById) ?? row.approvedById)
      : null,
    requestedAt: row.requestedAt.toISOString(),
    dispatchedAt: row.dispatchedAt ? row.dispatchedAt.toISOString() : null,
    receivedAt: row.receivedAt ? row.receivedAt.toISOString() : null,
    vehicleNumber: row.vehicleNumber,
    remarks: row.remarks,
    rejectionReason: row.rejectionReason,
  };
}

async function withNames(rows) {
  const projectIds = [
    ...new Set(rows.flatMap((row) => [row.sourceProjectId, row.destinationProjectId])),
  ];
  const userIds = [
    ...new Set(rows.flatMap((row) => [row.requestedById, row.approvedById].filter(Boolean))),
  ];
  const projectRows = projectIds.length
    ? await Project.find({ _id: { $in: projectIds } }, { name: 1 }).lean()
    : [];
  const projectNames = new Map(projectRows.map((row) => [row._id, row.name]));
  const userNames = new Map(
    (await Promise.all(userIds.map((id) => getUserById(id))))
      .filter(Boolean)
      .map((user) => [user.id, user.name]),
  );
  return { projectNames, userNames };
}

export async function listAllStockTransfers() {
  const rows = await StockTransfer.find().sort({ requestedAt: -1 }).lean();
  const { projectNames, userNames } = await withNames(rows);
  return rows.map((row) => mapTransfer(row, projectNames, userNames));
}

export async function getStockTransfer(transferId) {
  const row = await StockTransfer.findById(transferId).lean();
  if (!row) return null;
  const { projectNames, userNames } = await withNames([row]);
  return mapTransfer(row, projectNames, userNames);
}

async function nextTransferId() {
  const count = await StockTransfer.countDocuments();
  return `TRF-${String(count + 1).padStart(5, "0")}`;
}

export async function createStockTransfer({
  sourceProjectId,
  destinationProjectId,
  materialCode,
  quantity,
  remarks,
  requestedById,
}) {
  if (sourceProjectId === destinationProjectId) {
    throw new SameProjectTransferError();
  }
  const material = await Material.findOne({ code: materialCode }, { name: 1, unit: 1 }).lean();
  if (!material) {
    throw new UnknownMaterialError(materialCode);
  }

  const id = await nextTransferId();
  await StockTransfer.create({
    _id: id,
    sourceProjectId,
    destinationProjectId,
    materialCode,
    materialName: material.name,
    unit: material.unit,
    quantity,
    status: "requested",
    requestedById,
    requestedAt: new Date(),
    remarks: remarks || null,
  });
  return getStockTransfer(id);
}

async function requireStatus(transferId, allowed, action) {
  const row = await StockTransfer.findById(transferId).lean();
  if (!row) return null;
  if (!allowed.includes(row.status)) {
    throw new InvalidTransferTransitionError(row.status, action);
  }
  return row;
}

export async function approveStockTransfer(transferId, approvedById) {
  const row = await requireStatus(transferId, ["requested"], "approve");
  if (!row) return null;
  await StockTransfer.updateOne({ _id: transferId }, { status: "approved", approvedById });
  return getStockTransfer(transferId);
}

export async function rejectStockTransfer(transferId, { approvedById, rejectionReason }) {
  const row = await requireStatus(transferId, ["requested", "approved"], "reject");
  if (!row) return null;
  await StockTransfer.updateOne(
    { _id: transferId },
    { status: "rejected", approvedById, rejectionReason },
  );
  return getStockTransfer(transferId);
}

export async function markTransferReadyForDispatch(transferId) {
  const row = await requireStatus(transferId, ["approved"], "mark ready for dispatch");
  if (!row) return null;
  await StockTransfer.updateOne({ _id: transferId }, { status: "ready-for-dispatch" });
  return getStockTransfer(transferId);
}

async function categoryNameForMaterial(materialCode) {
  const material = await Material.findOne({ code: materialCode }, { categoryId: 1 }).lean();
  if (!material) return "Uncategorised";
  const category = await MaterialCategory.findById(material.categoryId, { name: 1 }).lean();
  return category?.name ?? "Uncategorised";
}

/** Dispatching deducts the source site's stock — material is no longer available there. */
export async function dispatchStockTransfer(transferId, { vehicleNumber }) {
  const row = await requireStatus(transferId, ["ready-for-dispatch"], "dispatch");
  if (!row) return null;
  const category = await categoryNameForMaterial(row.materialCode);
  await adjustSiteStock({
    projectId: row.sourceProjectId,
    materialCode: row.materialCode,
    materialName: row.materialName,
    category,
    unit: row.unit,
    delta: -Number(row.quantity),
    movementType: "transfer-out",
    referenceId: transferId,
  });
  await StockTransfer.updateOne(
    { _id: transferId },
    { status: "dispatched", dispatchedAt: new Date(), vehicleNumber },
  );
  return getStockTransfer(transferId);
}

export async function markTransferInTransit(transferId) {
  const row = await requireStatus(transferId, ["dispatched"], "mark in transit");
  if (!row) return null;
  await StockTransfer.updateOne({ _id: transferId }, { status: "in-transit" });
  return getStockTransfer(transferId);
}

/** Receiving credits the destination site's stock — the transfer's actual endpoint. */
export async function receiveStockTransfer(transferId) {
  const row = await requireStatus(transferId, ["dispatched", "in-transit"], "receive");
  if (!row) return null;
  const category = await categoryNameForMaterial(row.materialCode);
  await adjustSiteStock({
    projectId: row.destinationProjectId,
    materialCode: row.materialCode,
    materialName: row.materialName,
    category,
    unit: row.unit,
    delta: Number(row.quantity),
    movementType: "transfer-in",
    referenceId: transferId,
  });
  await StockTransfer.updateOne({ _id: transferId }, { status: "received", receivedAt: new Date() });
  return getStockTransfer(transferId);
}

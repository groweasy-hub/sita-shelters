import { Grn, Material, Project, PurchaseOrder, QcInspection, User } from "../db/models/index.js";

/**
 * Where a GRN is in its workflow. GRNs from before the workflow existed carry
 * no stage: while QC is still open they are awaiting it, and otherwise their
 * accepted stock was already posted, so they read as received.
 */
export function effectiveStage(row) {
  if (row.stage) return row.stage;
  return ["pending-qc", "under-inspection"].includes(row.status) ? "awaiting-qc" : "received";
}

function mapInward(row) {
  return {
    id: row._id,
    purchaseOrderId: row.purchaseOrderId,
    vendorId: row.vendorId,
    projectId: row.projectId,
    projectName: row.projectName,
    vehicleNumber: row.vehicleNumber,
    driverName: row.driverName,
    transporterName: row.transporterName,
    invoiceNumber: row.invoiceNumber,
    deliveryChallanNumber: row.deliveryChallanNumber,
    receivedAt: row.receivedAt.toISOString(),
    status: row.status,
    stage: effectiveStage(row),
    recordedById: row.recordedById,
    lines: row.lines.map((line) => ({
      materialCode: line.materialCode,
      materialName: line.materialName,
      unit: line.unit,
      orderedQuantity: Number(line.orderedQuantity),
      receivedQuantity: Number(line.receivedQuantity),
      damagedQuantity: Number(line.damagedQuantity),
      missingQuantity: Number(line.missingQuantity),
      // What quality control passed / rejected for this line (0 until inspected).
      acceptedQuantity: row.qcByMaterial?.get(line.materialCode)?.accepted ?? 0,
      rejectedQuantity: row.qcByMaterial?.get(line.materialCode)?.rejected ?? 0,
    })),
    approvals: (row.approvals ?? []).map((entry) => ({
      action: entry.action,
      approverId: entry.approverId,
      approver: row.userNames?.get(entry.approverId) ?? entry.approverId,
      role: entry.role,
      remarks: entry.remarks ?? "",
      at: new Date(entry.at).toISOString(),
    })),
  };
}

async function withProjectNames(rows) {
  const projectIds = [...new Set(rows.map((row) => row.projectId))];
  const grnIds = rows.map((row) => row._id);
  const userIds = [
    ...new Set(rows.flatMap((row) => (row.approvals ?? []).map((entry) => entry.approverId))),
  ];
  const [projectRows, qcRows, userRows] = await Promise.all([
    projectIds.length ? Project.find({ _id: { $in: projectIds } }, { name: 1 }).lean() : [],
    grnIds.length
      ? QcInspection.find(
          { inwardId: { $in: grnIds } },
          { inwardId: 1, materialCode: 1, acceptedQuantity: 1, rejectedQuantity: 1 },
        ).lean()
      : [],
    userIds.length ? User.find({ _id: { $in: userIds } }, { name: 1 }).lean() : [],
  ]);
  const names = new Map(projectRows.map((row) => [row._id, row.name]));
  const userNames = new Map(userRows.map((row) => [row._id, row.name]));
  const qcByGrn = new Map();
  for (const qc of qcRows) {
    const byMaterial = qcByGrn.get(qc.inwardId) ?? new Map();
    const current = byMaterial.get(qc.materialCode) ?? { accepted: 0, rejected: 0 };
    current.accepted += Number(qc.acceptedQuantity);
    current.rejected += Number(qc.rejectedQuantity);
    byMaterial.set(qc.materialCode, current);
    qcByGrn.set(qc.inwardId, byMaterial);
  }
  return rows.map((row) => ({
    ...row,
    projectName: names.get(row.projectId) ?? row.projectId,
    qcByMaterial: qcByGrn.get(row._id),
    userNames,
  }));
}

export async function listAllInwardRecords() {
  const rows = await Grn.find().sort({ receivedAt: -1 }).lean();
  return (await withProjectNames(rows)).map(mapInward);
}

export async function getInwardRecord(inwardId) {
  const row = await Grn.findById(inwardId).lean();
  if (!row) return null;
  const [withName] = await withProjectNames([row]);
  return mapInward(withName);
}

export async function listInwardRecordsByPurchaseOrder(purchaseOrderId) {
  const rows = await Grn.find({ purchaseOrderId }).lean();
  return (await withProjectNames(rows)).map(mapInward);
}

async function nextId() {
  const count = await Grn.countDocuments();
  return `GRN-${String(count + 1).padStart(5, "0")}`;
}

export class UnknownPurchaseOrderError extends Error {
  constructor(poId) {
    super(`Unknown purchase order: ${poId}`);
    this.name = "UnknownPurchaseOrderError";
  }
}

export async function createInwardRecord({
  purchaseOrderId,
  vehicleNumber,
  driverName,
  transporterName,
  invoiceNumber,
  deliveryChallanNumber,
  receivedAt,
  lines,
  recordedById,
}) {
  const order = await PurchaseOrder.findById(purchaseOrderId, {
    vendorId: 1,
    projectId: 1,
  }).lean();
  if (!order) {
    throw new UnknownPurchaseOrderError(purchaseOrderId);
  }

  const materialRows = await Material.find(
    { code: { $in: lines.map((line) => line.materialCode) } },
    { code: 1, name: 1, unit: 1 },
  ).lean();
  const materialByCode = new Map(materialRows.map((row) => [row.code, row]));

  const id = await nextId();
  const grnLines = lines.map((line) => {
    const material = materialByCode.get(line.materialCode);
    return {
      materialCode: line.materialCode,
      materialName: material?.name ?? line.materialCode,
      unit: material?.unit ?? "",
      orderedQuantity: line.orderedQuantity,
      receivedQuantity: line.receivedQuantity,
      damagedQuantity: line.damagedQuantity,
      missingQuantity: line.missingQuantity,
    };
  });

  await Grn.create({
    _id: id,
    grnNumber: id,
    purchaseOrderId,
    vendorId: order.vendorId,
    projectId: order.projectId,
    vehicleNumber,
    driverName,
    transporterName,
    invoiceNumber,
    deliveryChallanNumber,
    receivedAt: new Date(receivedAt),
    status: "pending-qc",
    stage: "awaiting-qc",
    recordedById: recordedById ?? null,
    lines: grnLines,
  });

  // One QC inspection per received line, queued for the site engineer.
  const qcCount = await QcInspection.countDocuments();
  await QcInspection.insertMany(
    grnLines.map((line, index) => ({
      _id: `QC-${String(qcCount + index + 1).padStart(5, "0")}`,
      inwardId: id,
      projectId: order.projectId,
      materialCode: line.materialCode,
      materialName: line.materialName,
      unit: line.unit,
      receivedQuantity: line.receivedQuantity,
      status: "pending-inspection",
      remarks: "Awaiting inspection queue.",
    })),
  );

  return getInwardRecord(id);
}

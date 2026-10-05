import {
  Indent,
  Material,
  ProcurementRequest,
  Project,
  PurchaseOrder,
  SupplierQuotation,
} from "../db/models/index.js";

/* ---------------------------------------------------------------- helpers */

async function projectNamesByIds(projectIds) {
  if (projectIds.length === 0) {
    return new Map();
  }
  const rows = await Project.find(
    { _id: { $in: [...new Set(projectIds)] } },
    { name: 1 },
  ).lean();
  return new Map(rows.map((row) => [row._id, row.name]));
}

/* ------------------------------------------------------ procurement requests */

function mapPurchaseRequest(row) {
  return {
    id: row._id,
    sourceIndentId: row.sourceIndentId,
    projectId: row.projectId,
    projectName: row.projectName,
    materials: row.materials.map((m) => ({
      materialCode: m.materialCode,
      materialName: m.materialName,
      unit: m.unit,
      requiredQuantity: Number(m.requiredQuantity),
    })),
    requiredDeliveryDate: row.requiredDeliveryDate,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listAllPurchaseRequests() {
  const rows = await ProcurementRequest.find().sort({ createdAt: -1 }).lean();
  const projectNames = await projectNamesByIds(rows.map((row) => row.projectId));
  return rows.map((row) =>
    mapPurchaseRequest({
      ...row,
      projectName: projectNames.get(row.projectId) ?? row.projectId,
    }),
  );
}

export async function getPurchaseRequest(requestId) {
  const row = await ProcurementRequest.findById(requestId).lean();
  if (!row) {
    return null;
  }
  const project = await Project.findById(row.projectId, { name: 1 }).lean();
  return mapPurchaseRequest({
    ...row,
    projectName: project?.name ?? row.projectId,
  });
}

async function nextId(model, prefix) {
  const count = await model.countDocuments();
  return `${prefix}-${String(count + 1).padStart(5, "0")}`;
}

/** Creates a procurement request from an indent's lines — the "send to procurement" step. */
export async function createPurchaseRequestFromIndent(indentRow, indentLines) {
  const id = await nextId(ProcurementRequest, "PR");
  await ProcurementRequest.create({
    _id: id,
    requestNumber: id,
    sourceIndentId: indentRow._id,
    projectId: indentRow.projectId,
    requiredDeliveryDate: indentRow.requiredDate,
    status: "approved",
    materials: indentLines.map((line) => ({
      materialCode: line.materialCode,
      materialName: line.materialName,
      unit: line.unit,
      requiredQuantity: line.requestedQuantity,
    })),
  });
  return getPurchaseRequest(id);
}

/* ------------------------------------------------------------- indents (approve) */

export async function approveIndentAndSendToProcurement(indentId, approvedById) {
  const indentRow = await Indent.findById(indentId).lean();
  if (!indentRow) {
    return null;
  }

  await Indent.updateOne(
    { _id: indentId },
    {
      status: "approved",
      hasProcurementRequest: true,
      approvedById: approvedById ?? null,
      approvedAt: new Date(),
    },
  );

  await createPurchaseRequestFromIndent(indentRow, indentRow.lines);
  return indentId;
}

/* ------------------------------------------------------------------ quotations */

function mapQuotation(row) {
  return {
    id: row._id,
    purchaseRequestId: row.purchaseRequestId,
    vendorId: row.vendorId,
    materialCode: row.materialCode,
    quotationNumber: row.quotationNumber,
    quotationDate: row.quotationDate,
    validUntil: row.validUntil ?? null,
    unitPrice: Number(row.unitPrice),
    moq: Number(row.moq),
    discountPercent: Number(row.discountPercent),
    taxPercent: Number(row.taxPercent),
    taxIncluded: Boolean(row.taxIncluded),
    deliveryDays: row.deliveryDays ?? null,
    paymentTerms: row.paymentTerms,
    deliveryTerms: row.deliveryTerms,
    remarks: row.remarks,
    documentName: null,
    qualityRating: row.qualityRating,
    status: row.status,
  };
}

export async function listAllQuotations() {
  const rows = await SupplierQuotation.find().sort({ createdAt: -1 }).lean();
  return rows.map(mapQuotation);
}

export async function getQuotation(quotationId) {
  const row = await SupplierQuotation.findById(quotationId).lean();
  return row ? mapQuotation(row) : null;
}

export async function createQuotation(input) {
  const id = await nextId(SupplierQuotation, "QT");
  await SupplierQuotation.create({
    _id: id,
    purchaseRequestId: input.purchaseRequestId,
    vendorId: input.vendorId,
    materialCode: input.materialCode,
    quotationNumber: input.quotationNumber,
    quotationDate: input.quotationDate,
    validUntil: input.validUntil ?? null,
    unitPrice: input.unitPrice,
    moq: input.moq,
    discountPercent: input.discountPercent,
    taxPercent: input.taxPercent,
    taxIncluded: input.taxIncluded ?? false,
    deliveryDays: input.deliveryDays ?? null,
    paymentTerms: input.paymentTerms,
    deliveryTerms: input.deliveryTerms,
    remarks: input.remarks,
    qualityRating: input.qualityRating,
    status: "under-review",
  });
  return getQuotation(id);
}

export async function selectQuotationLine(quotationId) {
  const target = await getQuotation(quotationId);
  if (!target) {
    return null;
  }
  await SupplierQuotation.updateOne({ _id: quotationId }, { status: "selected" });
  await SupplierQuotation.updateMany(
    {
      purchaseRequestId: target.purchaseRequestId,
      materialCode: target.materialCode,
      _id: { $ne: quotationId },
      status: { $ne: "expired" },
    },
    { status: "rejected" },
  );
  return getQuotation(quotationId);
}

export async function deselectQuotationLine(quotationId) {
  const target = await getQuotation(quotationId);
  if (!target) {
    return null;
  }
  await SupplierQuotation.updateOne({ _id: quotationId }, { status: "under-review" });
  return getQuotation(quotationId);
}

/* -------------------------------------------------------------- purchase orders */

function mapPurchaseOrder(row) {
  return {
    id: row._id,
    vendorId: row.vendorId,
    projectId: row.projectId,
    projectName: row.projectName,
    sourceIndentId: row.sourceIndentId,
    quotationLineIds: row.quotationLineIds ?? [],
    status: row.status,
    items: row.items.map((item) => ({
      materialCode: item.materialCode,
      materialName: item.materialName,
      unit: item.unit,
      orderedQuantity: Number(item.orderedQuantity),
      unitPrice: Number(item.unitPrice),
      taxPercent: Number(item.taxPercent),
    })),
    deliverySchedule: row.deliverySchedule.map((entry) => ({
      id: entry._id,
      plannedDate: entry.plannedDate,
      quantity: Number(entry.quantity),
      status: entry.status,
    })),
    approvals: row.approvals.map((entry) => ({
      approver: entry.approver,
      role: entry.role,
      action: entry.action,
      remarks: entry.remarks,
      at: entry.at.toISOString(),
    })),
    releasedAt: row.releasedAt ? row.releasedAt.toISOString() : null,
    termsNote: row.termsNote ?? "",
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listAllPurchaseOrders() {
  const rows = await PurchaseOrder.find().sort({ createdAt: -1 }).lean();
  const projectNames = await projectNamesByIds(rows.map((row) => row.projectId));
  return rows.map((row) =>
    mapPurchaseOrder({
      ...row,
      projectName: projectNames.get(row.projectId) ?? row.projectId,
    }),
  );
}

export async function getPurchaseOrder(poId) {
  const row = await PurchaseOrder.findById(poId).lean();
  if (!row) {
    return null;
  }
  const project = await Project.findById(row.projectId, { name: 1 }).lean();
  return mapPurchaseOrder({ ...row, projectName: project?.name ?? row.projectId });
}

export class UnknownMaterialError extends Error {
  constructor(materialCode) {
    super(`Unknown material code: ${materialCode}`);
    this.name = "UnknownMaterialError";
    this.materialCode = materialCode;
  }
}

export async function createPurchaseOrder({
  vendorId,
  projectId,
  sourceIndentId,
  termsNote,
  items,
  approver,
  role,
}) {
  const materialRows = await Material.find(
    { code: { $in: items.map((item) => item.materialCode) } },
    { code: 1, name: 1, unit: 1 },
  ).lean();
  const materialByCode = new Map(materialRows.map((row) => [row.code, row]));
  for (const item of items) {
    if (!materialByCode.has(item.materialCode)) {
      throw new UnknownMaterialError(item.materialCode);
    }
  }

  const id = await nextId(PurchaseOrder, "PO");
  const quotationLineIds = items.map((item) => item.quotationLineId).filter(Boolean);
  await PurchaseOrder.create({
    _id: id,
    poNumber: id,
    vendorId,
    projectId,
    sourceIndentId: sourceIndentId ?? null,
    quotationLineIds,
    status: "pending-approval",
    termsNote: termsNote || null,
    items: items.map((item) => ({
      materialCode: item.materialCode,
      materialName: materialByCode.get(item.materialCode).name,
      unit: materialByCode.get(item.materialCode).unit,
      orderedQuantity: item.orderedQuantity,
      unitPrice: item.unitPrice,
      taxPercent: item.taxPercent,
      receivedQuantity: 0,
    })),
    approvals: [{ approver, role, action: "submitted", remarks: "" }],
  });
  return getPurchaseOrder(id);
}

async function recordPoApproval(poId, { approver, role, action, remarks = "" }) {
  await PurchaseOrder.updateOne(
    { _id: poId },
    { $push: { approvals: { approver, role, action, remarks, at: new Date() } } },
  );
}

export async function approvePurchaseOrder(poId, actor) {
  const existing = await getPurchaseOrder(poId);
  if (!existing) return null;
  await PurchaseOrder.updateOne({ _id: poId }, { status: "approved" });
  await recordPoApproval(poId, { ...actor, action: "approved" });
  return getPurchaseOrder(poId);
}

export async function rejectPurchaseOrder(poId, actor) {
  const existing = await getPurchaseOrder(poId);
  if (!existing) return null;
  await PurchaseOrder.updateOne({ _id: poId }, { status: "rejected" });
  await recordPoApproval(poId, { ...actor, action: "rejected" });
  return getPurchaseOrder(poId);
}

export async function sendBackPurchaseOrder(poId, actor) {
  const existing = await getPurchaseOrder(poId);
  if (!existing) return null;
  await PurchaseOrder.updateOne({ _id: poId }, { status: "draft" });
  await recordPoApproval(poId, { ...actor, action: "sent-back" });
  return getPurchaseOrder(poId);
}

export async function releasePurchaseOrder(poId, actor) {
  const existing = await getPurchaseOrder(poId);
  if (!existing) return null;
  await PurchaseOrder.updateOne(
    { _id: poId },
    { status: "released", releasedAt: new Date() },
  );
  await recordPoApproval(poId, { ...actor, action: "released" });
  return getPurchaseOrder(poId);
}

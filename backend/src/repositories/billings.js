import {
  BillingAdjustment,
  Grn,
  Project,
  PurchaseOrder,
  Vendor,
} from "../db/models/index.js";
import { effectiveStage } from "./inward.js";

function money(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function calculateLine(line, poItem) {
  const quantity = Number(line.receivedQuantity);
  const unitPrice = Number(poItem?.unitPrice ?? 0);
  const taxPercent = Number(poItem?.taxPercent ?? 0);
  const taxableAmount = money(quantity * unitPrice);
  const taxAmount = money(taxableAmount * (taxPercent / 100));
  return {
    materialCode: line.materialCode,
    materialName: line.materialName,
    unit: line.unit,
    quantity,
    unitPrice,
    taxPercent,
    taxableAmount,
    taxAmount,
    totalAmount: money(taxableAmount + taxAmount),
  };
}

function projectAddress(project) {
  return [
    project?.addressLine1,
    project?.addressLine2,
    project?.landmark,
    project?.city,
    project?.state,
    project?.postalCode,
    project?.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function chargeLine(label, amount, taxPercent) {
  const taxableAmount = money(amount);
  const taxAmount = money(taxableAmount * (Number(taxPercent) / 100));
  return {
    materialCode: label.toUpperCase().replaceAll(" ", "-"),
    materialName: label,
    unit: "job",
    quantity: taxableAmount > 0 ? 1 : 0,
    unitPrice: taxableAmount,
    taxPercent: Number(taxPercent),
    taxableAmount,
    taxAmount,
    totalAmount: money(taxableAmount + taxAmount),
    lineType: "charge",
    hsnCode: "995419",
  };
}

function defaultAdjustment(invoiceId) {
  return {
    invoiceId,
    transportationFee: 0,
    labourCharges: 0,
    otherCharges: 0,
    taxPercent: 18,
  };
}

function calculateTotals(lines) {
  const taxableAmount = money(
    lines.reduce((sum, line) => sum + line.taxableAmount, 0),
  );
  const taxAmount = money(lines.reduce((sum, line) => sum + line.taxAmount, 0));
  return {
    taxableAmount,
    taxAmount,
    totalAmount: money(taxableAmount + taxAmount),
  };
}

function hasBillableReceivedMaterial(grn) {
  const stage = effectiveStage(grn);
  return (
    !["rejected", "closed"].includes(stage) &&
    grn.status !== "rejected" &&
    grn.lines.some((line) => Number(line.receivedQuantity) > 0)
  );
}

function hasInvoiceablePurchaseOrderMaterial(order) {
  return (
    !["draft", "rejected", "cancelled"].includes(order.status) &&
    order.items.some((line) => Number(line.receivedQuantity || line.orderedQuantity) > 0)
  );
}

function resolveAdjustment(adjustmentsByInvoice, invoiceId) {
  return adjustmentsByInvoice.get(invoiceId) ?? defaultAdjustment(invoiceId);
}

function buildInvoice({
  id,
  invoiceNumber,
  invoiceDate,
  purchaseOrder,
  deliveryChallanNumber,
  project,
  vendor,
  vehicleNumber,
  transporterName,
  status,
  stage,
  materialLines,
  adjustment,
}) {
  const chargeLines = [
    chargeLine(
      "Transportation fee",
      adjustment.transportationFee,
      adjustment.taxPercent,
    ),
    chargeLine("Labour charges", adjustment.labourCharges, adjustment.taxPercent),
    chargeLine("Other charges", adjustment.otherCharges, adjustment.taxPercent),
  ].filter((line) => line.taxableAmount > 0);
  const lines = [...materialLines, ...chargeLines];
  const totals = calculateTotals(lines);
  const materialAmount = money(
    materialLines.reduce((sum, line) => sum + line.taxableAmount, 0),
  );
  const chargesAmount = money(
    chargeLines.reduce((sum, line) => sum + line.taxableAmount, 0),
  );
  return {
    id,
    invoiceNumber,
    invoiceDate: invoiceDate.toISOString(),
    purchaseOrderId: purchaseOrder._id,
    purchaseOrderNumber: purchaseOrder.poNumber ?? purchaseOrder._id,
    deliveryChallanNumber,
    projectId: purchaseOrder.projectId,
    projectName: project?.name ?? purchaseOrder.projectId,
    projectAddress: projectAddress(project),
    vendorId: purchaseOrder.vendorId,
    vendorName: vendor?.name ?? purchaseOrder.vendorId,
    vendorGstNumber: vendor?.gstNumber ?? "",
    vendorAddress: vendor?.address ?? "",
    vehicleNumber,
    transporterName,
    status,
    stage,
    termsNote: purchaseOrder.termsNote ?? "",
    transportationFee: Number(adjustment.transportationFee),
    labourCharges: Number(adjustment.labourCharges),
    otherCharges: Number(adjustment.otherCharges),
    chargeTaxPercent: Number(adjustment.taxPercent),
    materialAmount,
    chargesAmount,
    ...totals,
    lines,
  };
}

export async function listBillingInvoices() {
  const grns = await Grn.find().sort({ receivedAt: -1 }).lean();
  const receivedGrns = grns.filter(hasBillableReceivedMaterial);
  const grnPurchaseOrderIds = new Set(receivedGrns.map((row) => row.purchaseOrderId));
  const receivedPurchaseOrders = (
    await PurchaseOrder.find(
      {},
      {
        vendorId: 1,
        projectId: 1,
        poNumber: 1,
        status: 1,
        items: 1,
        termsNote: 1,
        releasedAt: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    ).lean()
  ).filter(
    (order) =>
      !grnPurchaseOrderIds.has(order._id) && hasInvoiceablePurchaseOrderMaterial(order),
  );
  const invoiceIds = [
    ...receivedGrns.map((row) => row._id),
    ...receivedPurchaseOrders.map((row) => row._id),
  ];
  const purchaseOrderIds = [
    ...receivedGrns.map((row) => row.purchaseOrderId),
    ...receivedPurchaseOrders.map((row) => row._id),
  ];
  const projectIds = [
    ...receivedGrns.map((row) => row.projectId),
    ...receivedPurchaseOrders.map((row) => row.projectId),
  ];
  const vendorIds = [
    ...receivedGrns.map((row) => row.vendorId),
    ...receivedPurchaseOrders.map((row) => row.vendorId),
  ];
  const [purchaseOrders, projects, vendors, adjustments] = await Promise.all([
    PurchaseOrder.find(
      { _id: { $in: [...new Set(purchaseOrderIds)] } },
      { vendorId: 1, projectId: 1, poNumber: 1, items: 1, termsNote: 1 },
    ).lean(),
    Project.find(
      { _id: { $in: [...new Set(projectIds)] } },
      {
        name: 1,
        addressLine1: 1,
        addressLine2: 1,
        landmark: 1,
        city: 1,
        state: 1,
        postalCode: 1,
        country: 1,
      },
    ).lean(),
    Vendor.find(
      { _id: { $in: [...new Set(vendorIds)] } },
      { name: 1, gstNumber: 1, address: 1 },
    ).lean(),
    BillingAdjustment.find({
      invoiceId: { $in: invoiceIds },
    }).lean(),
  ]);
  const ordersById = new Map(purchaseOrders.map((row) => [row._id, row]));
  const projectsById = new Map(projects.map((row) => [row._id, row]));
  const vendorsById = new Map(vendors.map((row) => [row._id, row]));
  const adjustmentsByInvoice = new Map(
    adjustments.map((row) => [row.invoiceId, row]),
  );

  const grnInvoices = receivedGrns.map((grn) => {
    const order = ordersById.get(grn.purchaseOrderId);
    const poItemsByMaterial = new Map(
      (order?.items ?? []).map((item) => [item.materialCode, item]),
    );
    const materialLines = grn.lines
      .filter((line) => Number(line.receivedQuantity) > 0)
      .map((line) => ({
        ...calculateLine(line, poItemsByMaterial.get(line.materialCode)),
        lineType: "material",
        hsnCode: "995419",
      }));
    return buildInvoice({
      id: grn._id,
      invoiceNumber: grn.invoiceNumber,
      invoiceDate: grn.receivedAt,
      purchaseOrder: order ?? {
        _id: grn.purchaseOrderId,
        poNumber: grn.purchaseOrderId,
        projectId: grn.projectId,
        vendorId: grn.vendorId,
      },
      deliveryChallanNumber: grn.deliveryChallanNumber,
      project: projectsById.get(grn.projectId),
      vendor: vendorsById.get(grn.vendorId),
      vehicleNumber: grn.vehicleNumber,
      transporterName: grn.transporterName,
      status: grn.status,
      stage: effectiveStage(grn),
      materialLines,
      adjustment: resolveAdjustment(adjustmentsByInvoice, grn._id),
    });
  });

  const poInvoices = receivedPurchaseOrders.map((order) => {
    const materialLines = order.items
      .filter((line) => Number(line.receivedQuantity || line.orderedQuantity) > 0)
      .map((line) => ({
        ...calculateLine(
          {
            ...line,
            receivedQuantity: Number(line.receivedQuantity || line.orderedQuantity),
          },
          line,
        ),
        lineType: "material",
        hsnCode: "995419",
      }));
    return buildInvoice({
      id: order._id,
      invoiceNumber: `PI/${order.poNumber ?? order._id}`,
      invoiceDate: order.releasedAt ?? order.updatedAt ?? order.createdAt ?? new Date(),
      purchaseOrder: order,
      deliveryChallanNumber: "Pending GRN",
      project: projectsById.get(order.projectId),
      vendor: vendorsById.get(order.vendorId),
      vehicleNumber: "Pending GRN",
      transporterName: "Pending GRN",
      status: order.status,
      stage: Number(
        order.items.reduce((sum, line) => sum + Number(line.receivedQuantity), 0),
      )
        ? "received"
        : "purchase-order",
      materialLines,
      adjustment: resolveAdjustment(adjustmentsByInvoice, order._id),
    });
  });

  return [...grnInvoices, ...poInvoices].sort(
    (left, right) => new Date(right.invoiceDate) - new Date(left.invoiceDate),
  );
}

export async function updateBillingCharges(invoiceId, input, updatedById) {
  const existing =
    (await Grn.findById(invoiceId, { _id: 1 }).lean()) ??
    (await PurchaseOrder.findOne(
      {
        _id: invoiceId,
        "items.receivedQuantity": { $gt: 0 },
      },
      { _id: 1 },
    ).lean());
  if (!existing) {
    return null;
  }

  const adjustment = await BillingAdjustment.findOneAndUpdate(
    { invoiceId },
    {
      $setOnInsert: {
        _id: `BILL-${invoiceId}`,
      },
      $set: {
        invoiceId,
        transportationFee: money(input.transportationFee),
        labourCharges: money(input.labourCharges),
        otherCharges: money(input.otherCharges),
        taxPercent: money(input.taxPercent),
        updatedById: updatedById ?? null,
      },
    },
    { new: true, upsert: true },
  ).lean();

  return adjustment;
}

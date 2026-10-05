import {
  DamagedStock,
  Grn,
  Material,
  MaterialCategory,
  Project,
  QcInspection,
  Replacement,
  Return,
  SiteStockBalance,
  StockLedgerEntry,
  Vendor,
} from "../db/models/index.js";
import { effectivePrice, latestOrderPrices } from "./material-pricing.js";

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Stock value, reorder level and low-stock status come from the live material
 * catalogue (its current price and reorder level), not from copies frozen
 * onto the stock row when it was first created — so editing a material, or
 * buying it at a new price, is reflected immediately.
 */
function mapBalance(row, material) {
  const availableQuantity = Number(row.availableQuantity);
  const pendingReceiptQuantity = Number(row.pendingReceiptQuantity ?? 0);
  const reorderLevel = Number(material?.reorderLevel ?? row.reorderLevel ?? 0);
  const unitPrice = Number(material?.lastPurchasePrice ?? 0);
  // Only "available" stock is re-judged; damaged / reserved / in-transit are deliberate states.
  const status =
    row.status === "available" && reorderLevel > 0 && availableQuantity < reorderLevel
      ? "low-stock"
      : row.status;
  return {
    id: row._id,
    // The catalogue entry, so a stock row can open the material's full details.
    materialId: material?._id ?? null,
    projectId: row.projectId,
    projectName: row.projectName,
    materialCode: row.materialCode,
    materialName: row.materialName,
    category: row.category,
    unit: row.unit,
    availableQuantity,
    reservedQuantity: Number(row.reservedQuantity),
    pendingReceiptQuantity,
    reorderLevel,
    unitPrice,
    // Includes stock posted but not yet confirmed by the Store Manager, so
    // the value shows up as soon as it's posted rather than waiting on
    // `inward:confirm-receipt` — availableQuantity alone would undercount it.
    stockValue: round2((availableQuantity + pendingReceiptQuantity) * unitPrice),
    status,
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function materialsByCode(codes) {
  const rows = codes.length
    ? await Material.find({ code: { $in: codes } }, { code: 1, reorderLevel: 1, lastPurchasePrice: 1 }).lean()
    : [];
  const byCode = new Map(rows.map((row) => [row.code, row]));
  // Valued at the catalogue price, or at what it was last ordered for if the catalogue has none.
  const unpriced = codes.filter((code) => !(Number(byCode.get(code)?.lastPurchasePrice) > 0));
  const orderPrices = await latestOrderPrices(unpriced);
  return new Map(
    codes.map((code) => {
      const row = byCode.get(code);
      return [code, { ...row, code, lastPurchasePrice: effectivePrice(row?.lastPurchasePrice, orderPrices.get(code)) }];
    }),
  );
}

async function withProjectNames(rows) {
  const projectIds = [...new Set(rows.map((row) => row.projectId))];
  const projectRows = projectIds.length
    ? await Project.find({ _id: { $in: projectIds } }, { name: 1 }).lean()
    : [];
  const names = new Map(projectRows.map((row) => [row._id, row.name]));
  return rows.map((row) => ({ ...row, projectName: names.get(row.projectId) ?? row.projectId }));
}

export async function listSiteStockBalances(projectId) {
  const rows = await SiteStockBalance.find(projectId ? { projectId } : {}).lean();
  const [named, materials] = await Promise.all([
    withProjectNames(rows),
    materialsByCode([...new Set(rows.map((row) => row.materialCode))]),
  ]);
  return named.map((row) => mapBalance(row, materials.get(row.materialCode)));
}

/**
 * Damaged stock is derived from what actually happened rather than kept as a
 * separate list to maintain: quantity rejected in a quality check at goods
 * inward, quantity found damaged when returned material is inspected, plus
 * any incident logged directly (weather, wastage, …). Valued at the material's
 * current price.
 */
export async function listDamagedStock(projectId) {
  const scope = projectId ? { projectId } : {};
  const [qcRows, returnRows, manualRows] = await Promise.all([
    QcInspection.find({ ...scope, rejectedQuantity: { $gt: 0 } }).lean(),
    Return.find({ ...scope, inspectionDamagedQuantity: { $gt: 0 } }).lean(),
    DamagedStock.find(scope).lean(),
  ]);

  const records = [
    ...qcRows.map((row) => ({
      id: `DMG-QC-${row._id}`,
      type: "damage",
      projectId: row.projectId,
      materialCode: row.materialCode,
      materialName: row.materialName,
      unit: row.unit,
      quantity: Number(row.rejectedQuantity),
      reason: "vendor-defect",
      department: "stores",
      date: row.inspectedAt ?? row.createdAt ?? new Date(0),
      sourceType: "qc-rejection",
      sourceId: row._id,
      remarks: row.remarks || "Rejected during goods-inward inspection.",
    })),
    ...returnRows.map((row) => ({
      id: `DMG-RET-${row._id}`,
      type: "damage",
      projectId: row.projectId,
      materialCode: row.materialCode,
      materialName: row.materialName,
      unit: row.unit,
      quantity: Number(row.inspectionDamagedQuantity),
      reason: "site-handling",
      department: "stores",
      date: row.inspectionAt ?? row.returnedAt,
      sourceType: "return-inspection",
      sourceId: row._id,
      remarks: row.inspectionRemarks || "Found damaged on return inspection.",
    })),
    ...manualRows.map((row) => ({
      id: row._id,
      type: row.type,
      projectId: row.projectId,
      materialCode: row.materialCode,
      materialName: row.materialName,
      unit: row.unit,
      quantity: Number(row.quantity),
      reason: row.reason,
      department: row.department,
      date: row.date,
      sourceType: row.sourceType,
      sourceId: row.sourceId,
      remarks: row.remarks,
      storedValue: Number(row.financialValue),
    })),
  ];

  const [named, materials] = await Promise.all([
    withProjectNames(records),
    materialsByCode([...new Set(records.map((record) => record.materialCode))]),
  ]);
  return named
    .map(({ storedValue, ...record }) => ({
      ...record,
      financialValue: round2(
        record.quantity * Number(materials.get(record.materialCode)?.lastPurchasePrice ?? 0) ||
          (storedValue ?? 0),
      ),
      date: new Date(record.date).toISOString(),
    }))
    .sort((first, second) => second.date.localeCompare(first.date));
}

function mapLedgerEntry(row) {
  return {
    id: row._id,
    projectId: row.projectId,
    projectName: row.projectName,
    materialCode: row.materialCode,
    materialName: row.materialName,
    unit: row.unit,
    movementType: row.movementType,
    movementLabel: MOVEMENT_LABELS[row.movementType] ?? row.movementType,
    quantity: Number(row.quantity),
    balanceAfter: Number(row.balanceAfter),
    referenceId: row.referenceId,
    vendorId: row.vendorId ?? null,
    vendorName: row.vendorName ?? null,
    remarks: MOVEMENT_REMARKS[row.movementType]?.(row) ?? "",
    date: row.date.toISOString(),
  };
}

const MOVEMENT_LABELS = {
  "goods-inward": "Goods Inward",
  issue: "Material Issue",
  consumption: "Consumption",
  return: "Material Return",
  replacement: "Replacement Received",
  "transfer-in": "Transfer In",
  "transfer-out": "Transfer Out",
  damage: "Damage Write-off",
};
const MOVEMENT_REMARKS = {
  "goods-inward": (row) => `Received at ${row.projectName}`,
  issue: () => "Issued for site work",
  consumption: () => "Consumed on site",
  return: () => "Returned to store",
  replacement: (row) => `Replacement ${row.referenceId} received for rejected/damaged stock`,
  "transfer-in": (row) => `Received at ${row.projectName}`,
  "transfer-out": () => "Transferred to another site",
  damage: () => "Written off as damaged",
};

/**
 * Who supplied the stock behind a movement: goods inward is referenced by its
 * GRN, and a replacement by its RPL id, which leads back through the QC
 * rejection it settles to the GRN. Movements with no vendor (issues,
 * consumption, transfers, site-return replacements) are left without one.
 */
async function withVendors(rows) {
  const replacementIds = rows
    .filter((row) => row.movementType === "replacement" && row.referenceId)
    .map((row) => row.referenceId);
  const replacements = replacementIds.length
    ? await Replacement.find(
        { _id: { $in: replacementIds }, sourceType: "qc" },
        { sourceId: 1 },
      ).lean()
    : [];
  const qcIdByReplacement = new Map(replacements.map((row) => [row._id, row.sourceId]));
  const qcRows = qcIdByReplacement.size
    ? await QcInspection.find(
        { _id: { $in: [...new Set(qcIdByReplacement.values())] } },
        { inwardId: 1 },
      ).lean()
    : [];
  const inwardByQc = new Map(qcRows.map((row) => [row._id, row.inwardId]));

  const grnIdFor = (row) => {
    if (row.movementType === "goods-inward") return row.referenceId;
    if (row.movementType === "replacement") {
      return inwardByQc.get(qcIdByReplacement.get(row.referenceId));
    }
    return null;
  };
  const grnIds = [...new Set(rows.map(grnIdFor).filter(Boolean))];
  const grns = grnIds.length
    ? await Grn.find({ _id: { $in: grnIds } }, { vendorId: 1 }).lean()
    : [];
  const vendorByGrn = new Map(grns.map((row) => [row._id, row.vendorId]));
  const vendorIds = [...new Set(vendorByGrn.values())];
  const vendors = vendorIds.length
    ? await Vendor.find({ _id: { $in: vendorIds } }, { name: 1 }).lean()
    : [];
  const vendorNames = new Map(vendors.map((row) => [row._id, row.name]));

  return rows.map((row) => {
    const vendorId = vendorByGrn.get(grnIdFor(row)) ?? null;
    return { ...row, vendorId, vendorName: vendorId ? (vendorNames.get(vendorId) ?? vendorId) : null };
  });
}

export async function listStockLedger(projectId) {
  const rows = await StockLedgerEntry.find(projectId ? { projectId } : {})
    .sort({ date: -1 })
    .lean();
  const named = await withProjectNames(rows);
  return (await withVendors(named)).map(mapLedgerEntry);
}

/**
 * Opening + Inward - Issued + Transfer = Current Stock, derived from the
 * ledger so the numbers reconcile. Mirrors the frontend's earlier
 * client-computed version, now backed by real movements.
 */
export async function getSiteStockRegister(projectId) {
  const balances = await listSiteStockBalances(projectId);
  const ledgerRows = await StockLedgerEntry.find(projectId ? { projectId } : {}).lean();

  const byKey = new Map();
  for (const row of ledgerRows) {
    const key = `${row.projectId}::${row.materialCode}`;
    const bucket = byKey.get(key) ?? { inward: 0, issued: 0, transferIn: 0, transferOut: 0 };
    const quantity = Math.abs(Number(row.quantity));
    switch (row.movementType) {
      case "goods-inward":
      case "return":
      case "replacement":
        bucket.inward += quantity;
        break;
      case "issue":
      case "consumption":
      case "damage":
        bucket.issued += quantity;
        break;
      case "transfer-in":
        bucket.transferIn += quantity;
        break;
      case "transfer-out":
        bucket.transferOut += quantity;
        break;
      default:
        break;
    }
    byKey.set(key, bucket);
  }

  return balances.map((balance) => {
    const key = `${balance.projectId}::${balance.materialCode}`;
    const bucket = byKey.get(key) ?? { inward: 0, issued: 0, transferIn: 0, transferOut: 0 };
    const transfer = bucket.transferIn - bucket.transferOut;
    const currentStock = balance.availableQuantity;
    const opening = currentStock - bucket.inward + bucket.issued - transfer;
    return {
      id: balance.id,
      materialId: balance.materialId,
      projectId: balance.projectId,
      projectName: balance.projectName,
      materialCode: balance.materialCode,
      materialName: balance.materialName,
      unit: balance.unit,
      opening: Math.round(opening * 100) / 100,
      inward: Math.round(bucket.inward * 100) / 100,
      issued: Math.round(bucket.issued * 100) / 100,
      transfer: Math.round(transfer * 100) / 100,
      currentStock,
      unitPrice: balance.unitPrice,
      stockValue: balance.stockValue,
    };
  });
}

export class InsufficientStockError extends Error {
  constructor(materialCode, projectId) {
    super(`Not enough available stock of ${materialCode} at ${projectId}`);
    this.name = "InsufficientStockError";
  }
}

/**
 * Upserts the balance and appends a ledger entry — the one place stock
 * actually moves. `delta` is signed: positive for anything coming in
 * (goods-inward, transfer-in, return), negative for anything going out
 * (issue, consumption, transfer-out, damage). Throws if a negative delta
 * would take available quantity below zero.
 */
export async function adjustSiteStock({
  projectId,
  materialCode,
  materialName,
  category,
  unit,
  delta,
  movementType,
  referenceId,
}) {
  const existing = await SiteStockBalance.findOne({ projectId, materialCode }).lean();

  const currentQuantity = existing ? Number(existing.availableQuantity) : 0;
  const balanceAfter = currentQuantity + delta;
  if (balanceAfter < -1e-6) {
    throw new InsufficientStockError(materialCode, projectId);
  }

  if (existing) {
    await SiteStockBalance.updateOne(
      { _id: existing._id },
      { availableQuantity: balanceAfter },
    );
  } else {
    await SiteStockBalance.create({
      _id: crypto.randomUUID(),
      projectId,
      materialCode,
      materialName,
      category,
      unit,
      availableQuantity: balanceAfter,
      reservedQuantity: 0,
      reorderLevel: 0,
      status: "available",
    });
  }

  await StockLedgerEntry.create({
    _id: crypto.randomUUID(),
    projectId,
    materialCode,
    materialName,
    unit,
    movementType,
    quantity: delta,
    balanceAfter,
    referenceId,
    date: new Date(),
  });

  return balanceAfter;
}

/** Upserts the balance and appends a ledger entry for an accepted GRN line. */
export async function postGoodsInwardToStock({
  projectId,
  materialCode,
  materialName,
  category,
  unit,
  quantity,
  referenceId,
}) {
  return adjustSiteStock({
    projectId,
    materialCode,
    materialName,
    category,
    unit,
    delta: quantity,
    movementType: "goods-inward",
    referenceId,
  });
}

/**
 * Posts replacement material received for a rejected delivery or a damaged
 * return into site stock, so it can be issued and consumed like any other
 * stock. Recorded as its own ledger movement to stay traceable to the
 * return/QC record it settles.
 */
export async function postReplacementToStock({
  projectId,
  materialCode,
  materialName,
  unit,
  quantity,
  referenceId,
}) {
  const material = await Material.findOne({ code: materialCode }, { categoryId: 1 }).lean();
  const category = material
    ? await MaterialCategory.findById(material.categoryId, { name: 1 }).lean()
    : null;
  return adjustSiteStock({
    projectId,
    materialCode,
    materialName,
    category: category?.name ?? "Uncategorised",
    unit,
    delta: quantity,
    movementType: "replacement",
    referenceId,
  });
}

/**
 * Stock the Project Manager has approved for posting but the store manager
 * hasn't formally confirmed yet. Held on the balance as
 * `pendingReceiptQuantity` — issuing may still draw on it (see
 * `createMaterialIssue`, which confirms just enough of it to cover the
 * issue), but it isn't reflected as on-hand stock until confirmed. Pass a
 * negative quantity to undo.
 */
export async function addPendingReceipt({
  projectId,
  materialCode,
  materialName,
  category,
  unit,
  quantity,
}) {
  const existing = await SiteStockBalance.findOne({ projectId, materialCode }).lean();
  if (existing) {
    await SiteStockBalance.updateOne(
      { _id: existing._id },
      { $inc: { pendingReceiptQuantity: quantity } },
    );
    return;
  }
  await SiteStockBalance.create({
    _id: crypto.randomUUID(),
    projectId,
    materialCode,
    materialName,
    category,
    unit,
    availableQuantity: 0,
    reservedQuantity: 0,
    pendingReceiptQuantity: quantity,
    reorderLevel: 0,
    status: "available",
  });
}

/**
 * Moves confirmed units from "awaiting confirmation" into available stock,
 * with a ledger entry. Caps at whatever is actually still pending — some of
 * it may already have been drawn into available stock by an issue made
 * before this confirmation ran (see `createMaterialIssue`) — and returns the
 * quantity actually confirmed, which callers must use (instead of the
 * quantity requested) when rolling back a failed step, so a rollback can't
 * undo more than this call actually did.
 */
export async function confirmPendingReceipt({
  projectId,
  materialCode,
  materialName,
  category,
  unit,
  quantity,
  referenceId,
  movementType = "goods-inward",
}) {
  const existing = await SiteStockBalance.findOne(
    { projectId, materialCode },
    { pendingReceiptQuantity: 1 },
  ).lean();
  const pending = Number(existing?.pendingReceiptQuantity ?? 0);
  const confirmedQuantity = Math.min(Number(quantity), Math.max(pending, 0));
  if (confirmedQuantity <= 1e-6) return 0;
  await adjustSiteStock({
    projectId,
    materialCode,
    materialName,
    category,
    unit,
    delta: confirmedQuantity,
    movementType,
    referenceId,
  });
  await SiteStockBalance.updateOne(
    { projectId, materialCode },
    { $inc: { pendingReceiptQuantity: -confirmedQuantity } },
  );
  return confirmedQuantity;
}

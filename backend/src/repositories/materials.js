import { Material, MaterialCategory, PurchaseOrder, Vendor } from "../db/models/index.js";
import { effectivePrice, latestOrderPrices } from "./material-pricing.js";

export class UnknownCategoryError extends Error {
  constructor(category, subcategory) {
    super(`Unknown material category: ${category} / ${subcategory}`);
    this.name = "UnknownCategoryError";
  }
}

/** Fills in the last order price for items whose catalogue price is empty. */
async function withEffectivePrices(rows) {
  const unpriced = rows.filter((row) => !(Number(row.lastPurchasePrice) > 0)).map((row) => row.code);
  const orderPrices = await latestOrderPrices(unpriced);
  return rows.map((row) => ({
    ...row,
    lastPurchasePrice: effectivePrice(row.lastPurchasePrice, orderPrices.get(row.code)),
  }));
}

function mapMaterial(row) {
  if (!row) {
    return null;
  }
  return {
    id: row._id,
    code: row.code,
    name: row.name,
    category: row.categoryId,
    subcategory: row.subcategoryId,
    unit: row.unit,
    ...(row.specification ? { specification: row.specification } : {}),
    reorderLevel: Number(row.reorderLevel),
    lastPurchasePrice: Number(row.lastPurchasePrice),
    status: row.status,
    approvedVendorIds: row.approvedVendorIds ?? [],
  };
}

export async function listAllMaterials() {
  const rows = await Material.find().sort({ name: 1 }).lean();
  return (await withEffectivePrices(rows)).map(mapMaterial);
}

export async function getMaterial(materialIdOrCode) {
  const row = await Material.findOne({
    $or: [{ _id: materialIdOrCode }, { code: materialIdOrCode }],
  })
    .collation({ locale: "en", strength: 2 })
    .lean();
  return row ? mapMaterial((await withEffectivePrices([row]))[0]) : null;
}

export async function createMaterial(input) {
  const id = crypto.randomUUID();
  await Material.create({
    _id: id,
    code: input.code.toLocaleUpperCase(),
    name: input.name,
    categoryId: input.category,
    subcategoryId: input.subcategory,
    unit: input.unit,
    specification: input.specification || null,
    reorderLevel: input.reorderLevel,
    lastPurchasePrice: input.lastPurchasePrice,
    status: input.status ?? "active",
    approvedVendorIds: input.approvedVendorIds ?? [],
  });

  return getMaterial(id);
}

export async function updateMaterial(materialId, input) {
  const existing = await getMaterial(materialId);
  if (!existing) {
    return null;
  }
  await Material.updateOne(
    { _id: existing.id },
    {
      specification: input.specification || null,
      reorderLevel: input.reorderLevel,
      lastPurchasePrice: input.lastPurchasePrice,
      status: input.status,
    },
  );

  return getMaterial(existing.id);
}

export async function listMaterialCategories() {
  const rows = await MaterialCategory.find().sort({ name: 1 }).lean();
  return rows.map((row) => ({
    id: row._id,
    parentId: row.parentId,
    name: row.name,
  }));
}

function codePart(value, length) {
  return (
    value
      .toLocaleUpperCase()
      .replace(/[^A-Z0-9]+/g, "")
      .slice(0, length)
      .padEnd(length, "X")
  );
}

/** Builds a readable, unique code like CEM-WAL-01 from the subcategory and item name. */
async function nextMaterialCode(name, subcategory) {
  const base = `${codePart(subcategory, 3)}-${codePart(name, 3)}`;
  let sequence = 1;
  let candidate = `${base}-${String(sequence).padStart(2, "0")}`;
  // eslint-disable-next-line no-await-in-loop
  while (
    await Material.exists({ code: candidate }).collation({ locale: "en", strength: 2 })
  ) {
    sequence += 1;
    candidate = `${base}-${String(sequence).padStart(2, "0")}`;
  }
  return candidate;
}

/**
 * Adds an item that was typed into an indent to the material catalogue, so it
 * is in the list next time. If a material with the same name already exists
 * it is reused instead of duplicated. Price and reorder level start at zero;
 * they can be filled in later from the Materials page.
 */
export async function findOrCreateMaterialFromIndent({ name, unit, category, subcategory }) {
  const existing = await Material.findOne({ name })
    .collation({ locale: "en", strength: 2 })
    .lean();
  if (existing) {
    return mapMaterial(existing);
  }

  const validCategory = await MaterialCategory.exists({ _id: subcategory, parentId: category });
  if (!validCategory) {
    throw new UnknownCategoryError(category, subcategory);
  }

  return createMaterial({
    code: await nextMaterialCode(name, subcategory),
    name,
    category,
    subcategory,
    unit,
    reorderLevel: 0,
    lastPurchasePrice: 0,
    status: "active",
    approvedVendorIds: [],
  });
}

const LIVE_PO_STATUSES_EXCLUDED = ["draft", "rejected", "cancelled"];

/**
 * Vendors for a material: the ones approved on the catalogue entry plus every
 * vendor it has actually been ordered from, with what was ordered and
 * delivered. A material bought from a vendor never had to be pre-approved, so
 * relying on the approved list alone leaves this empty for most stock.
 */
export async function listMaterialVendors(materialIdOrCode) {
  const material = await getMaterial(materialIdOrCode);
  if (!material) return null;

  const orders = await PurchaseOrder.find(
    {
      "items.materialCode": material.code,
      status: { $nin: LIVE_PO_STATUSES_EXCLUDED },
    },
    { vendorId: 1, poNumber: 1, items: 1, createdAt: 1 },
  )
    .sort({ createdAt: -1 })
    .lean();

  const byVendor = new Map();
  for (const order of orders) {
    const line = order.items.find((item) => item.materialCode === material.code);
    if (!line) continue;
    const entry = byVendor.get(order.vendorId) ?? {
      vendorId: order.vendorId,
      orderCount: 0,
      orderedQuantity: 0,
      receivedQuantity: 0,
      // Orders are newest first, so the first one seen is the latest.
      lastUnitPrice: Number(line.unitPrice),
      lastOrderId: order._id,
      lastOrderNumber: order.poNumber,
      lastOrderedAt: order.createdAt ? order.createdAt.toISOString() : null,
    };
    entry.orderCount += 1;
    entry.orderedQuantity += Number(line.orderedQuantity);
    entry.receivedQuantity += Number(line.receivedQuantity ?? 0);
    byVendor.set(order.vendorId, entry);
  }

  const approved = new Set(material.approvedVendorIds);
  const vendorIds = [...new Set([...approved, ...byVendor.keys()])];
  const vendorRows = vendorIds.length
    ? await Vendor.find({ _id: { $in: vendorIds } }, { code: 1, name: 1, type: 1, rating: 1 }).lean()
    : [];
  const vendors = new Map(vendorRows.map((row) => [row._id, row]));

  return vendorIds
    .map((vendorId) => {
      const vendor = vendors.get(vendorId);
      const supplied = byVendor.get(vendorId);
      return {
        vendorId,
        vendorCode: vendor?.code ?? null,
        vendorName: vendor?.name ?? vendorId,
        vendorType: vendor?.type ?? null,
        rating: vendor ? Number(vendor.rating) : null,
        approved: approved.has(vendorId),
        orderCount: supplied?.orderCount ?? 0,
        orderedQuantity: supplied?.orderedQuantity ?? 0,
        receivedQuantity: supplied?.receivedQuantity ?? 0,
        lastUnitPrice: supplied?.lastUnitPrice ?? null,
        lastOrderId: supplied?.lastOrderId ?? null,
        lastOrderNumber: supplied?.lastOrderNumber ?? null,
        lastOrderedAt: supplied?.lastOrderedAt ?? null,
      };
    })
    // Vendors that have actually supplied come first, most recent order at the top.
    .sort(
      (a, b) =>
        Number(b.orderCount > 0) - Number(a.orderCount > 0) ||
        String(b.lastOrderedAt ?? "").localeCompare(String(a.lastOrderedAt ?? "")) ||
        a.vendorName.localeCompare(b.vendorName),
    );
}

import { MaterialCategory, Vendor } from "../db/models/index.js";
import { computeVendorPerformance, NO_PERFORMANCE_YET } from "./vendor-performance.js";

export class DuplicateVendorCodeError extends Error {
  constructor(code) {
    super(`A vendor with code ${code} already exists`);
    this.name = "DuplicateVendorCodeError";
    this.code = code;
  }
}

/** Generates the next VND-0001, VND-0002, ... after the highest one in use. */
async function nextVendorCode() {
  const rows = await Vendor.find({ code: /^VND-\d+$/i }, { code: 1 }).lean();
  const highest = rows.reduce(
    (max, row) => Math.max(max, Number(row.code.slice(4))),
    0,
  );
  return `VND-${String(highest + 1).padStart(4, "0")}`;
}

/**
 * Rating, delivery performance and quality/rejection rates are not stored:
 * they're calculated from the vendor's real deliveries and quality checks
 * (see vendor-performance.js), so they're always current.
 */
function mapVendor(row, performance = NO_PERFORMANCE_YET) {
  if (!row) {
    return null;
  }
  return {
    id: row._id,
    code: row.code,
    name: row.name,
    type: row.type,
    gstNumber: row.gstNumber,
    address: row.address,
    rating: performance.rating,
    deliveryPerformance: performance.deliveryPerformance,
    qualityAcceptanceRate: performance.qualityAcceptanceRate,
    rejectionRate: performance.rejectionRate,
    performanceBasis: performance.basis,
    priceCompetitiveness: row.priceCompetitiveness,
    status: row.status,
    contacts: (row.contacts ?? []).map((contact) => ({
      name: contact.name,
      role: contact.role,
      phone: contact.phone,
      email: contact.email,
    })),
    materialCategories: row.materialCategories ?? [],
  };
}

export async function listAllVendors() {
  const rows = await Vendor.find().sort({ name: 1 }).lean();
  const performance = await computeVendorPerformance();
  return rows.map((row) => mapVendor(row, performance.get(row._id)));
}

export async function getVendor(vendorId) {
  const row = await Vendor.findById(vendorId).lean();
  if (!row) {
    return null;
  }
  const performance = await computeVendorPerformance(row._id);
  return mapVendor(row, performance.get(row._id));
}

export class UnknownMaterialCategoryError extends Error {
  constructor(categoryId) {
    super(`Unknown material category: ${categoryId}`);
    this.name = "UnknownMaterialCategoryError";
  }
}

/** Replaces the set of material categories a vendor can supply. */
export async function updateVendorCapabilities(vendorId, materialCategories) {
  const existing = await Vendor.exists({ _id: vendorId });
  if (!existing) {
    return null;
  }
  const ids = [...new Set(materialCategories)];
  if (ids.length > 0) {
    const known = new Set(
      (await MaterialCategory.find({ _id: { $in: ids } }, { _id: 1 }).lean()).map((row) => row._id),
    );
    const unknown = ids.find((id) => !known.has(id));
    if (unknown) {
      throw new UnknownMaterialCategoryError(unknown);
    }
  }
  await Vendor.updateOne({ _id: vendorId }, { materialCategories: ids });
  return getVendor(vendorId);
}

export async function createVendor(input) {
  // Left blank, the code is generated — same as project codes.
  const code = input.code ? input.code.toLocaleUpperCase() : await nextVendorCode();
  const clash = await Vendor.exists({ code }).collation({ locale: "en", strength: 2 });
  if (clash) {
    throw new DuplicateVendorCodeError(code);
  }

  const id = crypto.randomUUID();
  try {
    await Vendor.create({
      _id: id,
      code,
      name: input.name,
      type: input.type,
      gstNumber: input.gstNumber,
      address: input.address,
      priceCompetitiveness: input.priceCompetitiveness ?? "",
      status: input.status ?? "active",
      contacts: input.contacts ?? [],
      // De-duplicated the same way the old join table's unique constraint did.
      materialCategories: [...new Set(input.materialCategories ?? [])],
    });
  } catch (error) {
    // Two requests can race past the check above; the unique index still wins.
    if (error?.code === 11000) {
      throw new DuplicateVendorCodeError(code);
    }
    throw error;
  }

  return getVendor(id);
}

import mongoose from "mongoose";

// `material_approved_vendors` (Postgres join table) is embedded here as a
// plain id array — it was always read/written as a single unit with its
// material, never queried independently.
const materialSchema = new mongoose.Schema(
  {
    _id: { type: String },
    code: { type: String, required: true },
    name: { type: String, required: true },
    categoryId: { type: String, required: true, ref: "MaterialCategory" },
    subcategoryId: { type: String, required: true, ref: "MaterialCategory" },
    unit: { type: String, required: true },
    specification: { type: String, default: null },
    reorderLevel: { type: Number, required: true, default: 0 },
    lastPurchasePrice: { type: Number, required: true, default: 0 },
    status: { type: String, required: true, default: "active", enum: ["active", "inactive"] },
    approvedVendorIds: { type: [String], default: [], ref: "Vendor" },
  },
  { timestamps: true, versionKey: false },
);
materialSchema.index({ code: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export const Material = mongoose.models.Material ?? mongoose.model("Material", materialSchema);

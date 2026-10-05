import mongoose from "mongoose";

const vendorContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },
  { _id: false },
);

// `vendor_contacts` and `vendor_material_categories` (Postgres child tables)
// are embedded here — both were always read/written as a single unit with
// their vendor, never queried independently.
const vendorSchema = new mongoose.Schema(
  {
    _id: { type: String },
    code: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    gstNumber: { type: String, required: true },
    address: { type: String, required: true },
    rating: { type: Number, required: true, default: 0 },
    deliveryPerformance: { type: Number, required: true, default: 0 },
    qualityAcceptanceRate: { type: Number, required: true, default: 0 },
    rejectionRate: { type: Number, required: true, default: 0 },
    priceCompetitiveness: { type: String, default: "" },
    status: {
      type: String,
      required: true,
      default: "active",
      enum: ["active", "under-review", "inactive"],
    },
    contacts: { type: [vendorContactSchema], default: [] },
    materialCategories: { type: [String], default: [], ref: "MaterialCategory" },
  },
  { timestamps: true, versionKey: false },
);
vendorSchema.index({ code: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export const Vendor = mongoose.models.Vendor ?? mongoose.model("Vendor", vendorSchema);

import mongoose from "mongoose";

const siteStockBalanceSchema = new mongoose.Schema(
  {
    _id: { type: String },
    projectId: { type: String, required: true, ref: "Project" },
    materialCode: { type: String, required: true },
    materialName: { type: String, required: true },
    category: { type: String, required: true },
    unit: { type: String, required: true },
    availableQuantity: { type: Number, required: true, default: 0 },
    reservedQuantity: { type: Number, required: true, default: 0 },
    // Posted by the Project Manager's approval but not yet confirmed as received
    // by the store manager — visible, but not usable until confirmed.
    pendingReceiptQuantity: { type: Number, required: true, default: 0 },
    reorderLevel: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      required: true,
      default: "available",
      enum: ["available", "reserved", "low-stock", "damaged", "under-inspection", "in-transit"],
    },
  },
  { timestamps: { createdAt: false, updatedAt: true }, versionKey: false },
);
siteStockBalanceSchema.index({ projectId: 1, materialCode: 1 }, { unique: true });

export const SiteStockBalance =
  mongoose.models.SiteStockBalance ??
  mongoose.model("SiteStockBalance", siteStockBalanceSchema);

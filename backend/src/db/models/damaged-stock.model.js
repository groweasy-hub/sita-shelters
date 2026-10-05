import mongoose from "mongoose";

const damagedStockSchema = new mongoose.Schema(
  {
    _id: { type: String },
    type: { type: String, required: true, enum: ["damage", "wastage"] },
    projectId: { type: String, required: true, ref: "Project" },
    materialCode: { type: String, required: true },
    materialName: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true },
    financialValue: { type: Number, required: true },
    reason: {
      type: String,
      required: true,
      enum: [
        "transportation",
        "vendor-defect",
        "site-handling",
        "weather",
        "improper-storage",
        "expiry",
        "construction-wastage",
        "accidental-damage",
      ],
    },
    department: {
      type: String,
      required: true,
      enum: ["civil", "electrical", "plumbing", "fire-safety", "finishing", "stores", "logistics"],
    },
    date: { type: Date, required: true },
    sourceType: { type: String, required: true, enum: ["qc-rejection", "return-inspection", "other"] },
    sourceId: { type: String, default: null },
    remarks: { type: String, default: "" },
  },
  { versionKey: false },
);

export const DamagedStock =
  mongoose.models.DamagedStock ?? mongoose.model("DamagedStock", damagedStockSchema);

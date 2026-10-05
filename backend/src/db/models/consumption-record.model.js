import mongoose from "mongoose";

const consumptionRecordSchema = new mongoose.Schema(
  {
    _id: { type: String },
    materialIssueId: { type: String, required: true, ref: "MaterialIssue" },
    projectId: { type: String, required: true, ref: "Project" },
    materialCode: { type: String, required: true },
    materialName: { type: String, required: true },
    categoryId: { type: String, required: true, ref: "MaterialCategory" },
    unit: { type: String, required: true },
    quantityConsumed: { type: Number, required: true },
    activity: { type: String, required: true },
    location: { type: String, required: true },
    recordedById: { type: String, required: true, ref: "User" },
    consumedAt: { type: Date, required: true },
  },
  { versionKey: false },
);

export const ConsumptionRecord =
  mongoose.models.ConsumptionRecord ??
  mongoose.model("ConsumptionRecord", consumptionRecordSchema);

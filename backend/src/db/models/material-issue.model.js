import mongoose from "mongoose";

const materialIssueSchema = new mongoose.Schema(
  {
    _id: { type: String },
    projectId: { type: String, required: true, ref: "Project" },
    materialCode: { type: String, required: true },
    materialName: { type: String, required: true },
    unit: { type: String, required: true },
    issuedQuantity: { type: Number, required: true },
    consumedQuantity: { type: Number, required: true, default: 0 },
    returnedQuantity: { type: Number, required: true, default: 0 },
    recipientName: { type: String, required: true },
    department: {
      type: String,
      required: true,
      enum: ["civil", "electrical", "plumbing", "fire-safety", "finishing", "equipment"],
    },
    purpose: { type: String, required: true },
    workLocation: { type: String, required: true },
    issuedById: { type: String, required: true, ref: "User" },
    issuedAt: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      default: "issued",
      enum: ["issued", "partially-consumed", "consumed", "returned"],
    },
  },
  { versionKey: false },
);

export const MaterialIssue =
  mongoose.models.MaterialIssue ?? mongoose.model("MaterialIssue", materialIssueSchema);

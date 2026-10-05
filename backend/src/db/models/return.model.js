import mongoose from "mongoose";

const returnSchema = new mongoose.Schema(
  {
    _id: { type: String },
    materialIssueId: { type: String, required: true, ref: "MaterialIssue" },
    projectId: { type: String, required: true, ref: "Project" },
    materialCode: { type: String, required: true },
    materialName: { type: String, required: true },
    unit: { type: String, required: true },
    returningQuantity: { type: Number, required: true },
    reason: {
      type: String,
      required: true,
      enum: ["work-completed", "excess-material", "change-in-plan", "unused-material"],
    },
    returnedById: { type: String, required: true, ref: "User" },
    returnedAt: { type: Date, required: true },
    inspectionStatus: {
      type: String,
      required: true,
      default: "pending-inspection",
      enum: ["pending-inspection", "good", "damaged"],
    },
    inspectionGoodQuantity: { type: Number, required: true, default: 0 },
    inspectionDamagedQuantity: { type: Number, required: true, default: 0 },
    inspectionById: { type: String, default: null, ref: "User" },
    inspectionAt: { type: Date, default: null },
    inspectionRemarks: { type: String, default: "" },
    // Vendor/site settlement for a damaged return — set once, when resolved.
    resolutionType: { type: String, default: null, enum: [null, "replace", "refund"] },
    resolutionAmount: { type: Number, default: null },
    // Quantity settled (agreed to be replaced, or refunded).
    resolutionQuantity: { type: Number, default: null },
    // Replacement units actually received so far (see `replacements`); each
    // delivery is posted to site stock when it is recorded.
    replacedQuantity: { type: Number, default: 0 },
    // Refund settlements: set once, when the money has actually come back.
    refundCompletedAt: { type: Date, default: null },
    refundCompletedById: { type: String, default: null, ref: "User" },
    refundReference: { type: String, default: "" },
    refundRemarks: { type: String, default: "" },
    resolutionRemarks: { type: String, default: "" },
    resolvedById: { type: String, default: null, ref: "User" },
    resolvedAt: { type: Date, default: null },
  },
  { versionKey: false },
);

export const Return = mongoose.models.Return ?? mongoose.model("Return", returnSchema);

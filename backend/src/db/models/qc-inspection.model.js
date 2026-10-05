import mongoose from "mongoose";

// One line per check the inspector performed (e.g. "No visible damage").
const qcChecklistItemSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    result: { type: String, required: true, enum: ["pass", "fail", "na"] },
  },
  { _id: false },
);

const qcInspectionSchema = new mongoose.Schema(
  {
    _id: { type: String },
    inwardId: { type: String, required: true, ref: "Grn" },
    projectId: { type: String, required: true, ref: "Project" },
    materialCode: { type: String, required: true },
    materialName: { type: String, required: true },
    unit: { type: String, required: true },
    receivedQuantity: { type: Number, required: true },
    acceptedQuantity: { type: Number, required: true, default: 0 },
    rejectedQuantity: { type: Number, required: true, default: 0 },
    inspectorId: { type: String, default: null, ref: "User" },
    status: {
      type: String,
      required: true,
      default: "pending-inspection",
      enum: ["pending-inspection", "under-inspection", "accepted", "rejected"],
    },
    remarks: { type: String, default: "" },
    checklist: { type: [qcChecklistItemSchema], default: [] },
    inspectedAt: { type: Date, default: null },
    // Vendor settlement for a rejected delivery — set once, when resolved.
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

export const QcInspection =
  mongoose.models.QcInspection ?? mongoose.model("QcInspection", qcInspectionSchema);

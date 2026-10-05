import mongoose from "mongoose";

// One row per delivery of replacement material against a QC rejection or a
// damaged return. A settlement can be received in several parts, so a single
// resolution may have many of these. The id doubles as the stock-ledger
// reference for the units it added to site inventory.
const replacementSchema = new mongoose.Schema(
  {
    _id: { type: String },
    sourceType: { type: String, required: true, enum: ["qc", "return"] },
    sourceId: { type: String, required: true },
    projectId: { type: String, required: true, ref: "Project" },
    materialCode: { type: String, required: true },
    materialName: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true, default: 0 },
    value: { type: Number, required: true, default: 0 },
    remarks: { type: String, default: "" },
    receivedById: { type: String, required: true, ref: "User" },
    receivedAt: { type: Date, required: true },
    // Same approval path as a GRN: Site Engineer → Project Manager (posts the
    // stock) → Store Manager confirms. Absent on deliveries from before the
    // workflow existed; those were posted immediately and read as received.
    stage: {
      type: String,
      default: null,
      enum: [
        null,
        "pending-engineer-approval",
        "pending-manager-approval",
        "pending-store-confirmation",
        "received",
        "rejected",
      ],
    },
    approvals: {
      type: [
        new mongoose.Schema(
          {
            approverId: { type: String, required: true },
            role: { type: String, required: true },
            action: { type: String, required: true },
            remarks: { type: String, default: "" },
            at: { type: Date, required: true, default: Date.now },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
  },
  { versionKey: false },
);
replacementSchema.index({ sourceType: 1, sourceId: 1 });

export const Replacement =
  mongoose.models.Replacement ?? mongoose.model("Replacement", replacementSchema);

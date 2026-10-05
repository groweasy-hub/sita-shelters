import mongoose from "mongoose";

// `grn_lines` and `grn_approvals` (Postgres child tables) are embedded as
// `lines`/`approvals` — always read/written as a single unit with their GRN.
const grnLineSchema = new mongoose.Schema(
  {
    materialCode: { type: String, required: true },
    materialName: { type: String, required: true },
    unit: { type: String, required: true },
    orderedQuantity: { type: Number, required: true },
    receivedQuantity: { type: Number, required: true },
    damagedQuantity: { type: Number, required: true, default: 0 },
    missingQuantity: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);
const grnApprovalSchema = new mongoose.Schema(
  {
    approverId: { type: String, required: true, ref: "User" },
    role: { type: String, required: true },
    action: {
      type: String,
      required: true,
      enum: [
        "submitted",
        "site-engineer-approved",
        "project-manager-approved",
        "rejected",
        "sent-back",
        // Recorded by the system when quality control finishes and the GRN is raised.
        "grn-created",
        // The store manager confirming the posted stock has been received.
        "store-confirmed",
      ],
    },
    remarks: { type: String, default: "" },
    at: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const grnSchema = new mongoose.Schema(
  {
    _id: { type: String },
    grnNumber: { type: String, required: true },
    purchaseOrderId: { type: String, required: true, ref: "PurchaseOrder" },
    vendorId: { type: String, required: true, ref: "Vendor" },
    projectId: { type: String, required: true, ref: "Project" },
    vehicleNumber: { type: String, required: true },
    driverName: { type: String, required: true },
    transporterName: { type: String, required: true },
    invoiceNumber: { type: String, required: true },
    deliveryChallanNumber: { type: String, required: true },
    receivedAt: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      default: "pending-qc",
      enum: ["pending-qc", "under-inspection", "accepted", "rejected", "partially-accepted"],
    },
    recordedById: { type: String, default: null, ref: "User" },
    // Where the GRN is in its approval workflow (QC → Site Engineer → Project
    // Manager → stock posted → Store confirmation). Absent on GRNs from before
    // the workflow existed; those are read as already received.
    stage: {
      type: String,
      default: null,
      enum: [
        null,
        "awaiting-qc",
        "pending-engineer-approval",
        "pending-manager-approval",
        "pending-store-confirmation",
        "received",
        "rejected",
        "closed",
      ],
    },
    lines: { type: [grnLineSchema], default: [] },
    approvals: { type: [grnApprovalSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

export const Grn = mongoose.models.Grn ?? mongoose.model("Grn", grnSchema);

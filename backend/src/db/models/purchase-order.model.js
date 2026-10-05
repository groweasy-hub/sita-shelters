import mongoose from "mongoose";

// `po_lines`, `po_approvals` and `po_delivery_schedule` (Postgres child
// tables) are embedded as `items`, `approvals` and `deliverySchedule` —
// matching the API response shape the repository already maps to, and
// always read/written as a single unit with their purchase order.
const poLineSchema = new mongoose.Schema(
  {
    materialCode: { type: String, required: true },
    materialName: { type: String, required: true },
    unit: { type: String, required: true },
    orderedQuantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    taxPercent: { type: Number, required: true },
    // Cumulative accepted quantity posted from approved GRNs; drives the
    // PO's partially-delivered/fully-delivered status automatically.
    receivedQuantity: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);
const poApprovalSchema = new mongoose.Schema(
  {
    approver: { type: String, required: true },
    role: { type: String, required: true },
    action: {
      type: String,
      required: true,
      enum: ["submitted", "approved", "rejected", "sent-back", "released"],
    },
    remarks: { type: String, default: "" },
    at: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);
const poDeliveryScheduleSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    plannedDate: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: { type: String, required: true, default: "pending", enum: ["pending", "delivered"] },
  },
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    _id: { type: String },
    poNumber: { type: String, required: true },
    vendorId: { type: String, required: true, ref: "Vendor" },
    projectId: { type: String, required: true, ref: "Project" },
    sourceIndentId: { type: String, default: null, ref: "Indent" },
    quotationLineIds: { type: [String], default: [], ref: "SupplierQuotation" },
    status: {
      type: String,
      required: true,
      default: "draft",
      enum: [
        "draft",
        "pending-approval",
        "approved",
        "rejected",
        "released",
        "partially-delivered",
        "fully-delivered",
        "closed",
        "cancelled",
      ],
    },
    termsNote: { type: String, default: null },
    releasedAt: { type: Date, default: null },
    items: { type: [poLineSchema], default: [] },
    approvals: { type: [poApprovalSchema], default: [] },
    deliverySchedule: { type: [poDeliveryScheduleSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

export const PurchaseOrder =
  mongoose.models.PurchaseOrder ?? mongoose.model("PurchaseOrder", purchaseOrderSchema);

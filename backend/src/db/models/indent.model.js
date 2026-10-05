import mongoose from "mongoose";

const indentLineSchema = new mongoose.Schema(
  {
    materialCode: { type: String, required: true },
    materialName: { type: String, required: true },
    unit: { type: String, required: true },
    requestedQuantity: { type: Number, required: true },
    approvedQuantity: { type: Number, default: null },
  },
  { _id: false },
);

// `indent_lines` (Postgres child table) is embedded — always read/written
// as a single unit with its indent, never queried independently.
const indentSchema = new mongoose.Schema(
  {
    _id: { type: String },
    indentNumber: { type: String, required: true },
    projectId: { type: String, required: true, ref: "Project" },
    requestedById: { type: String, required: true, ref: "User" },
    priority: { type: String, required: true, enum: ["low", "medium", "high", "urgent"] },
    status: {
      type: String,
      required: true,
      default: "draft",
      enum: [
        "draft",
        "submitted",
        "under-review",
        "approved",
        "rejected",
        "partially-fulfilled",
        "completed",
      ],
    },
    requiredDate: { type: String, required: true },
    purpose: { type: String, required: true },
    workLocation: { type: String, required: true },
    hasProcurementRequest: { type: Boolean, required: true, default: false },
    // Set when `status` moves to "approved" — who to credit on the activity
    // timeline, since `status` alone doesn't say who changed it.
    approvedById: { type: String, default: null, ref: "User" },
    approvedAt: { type: Date, default: null },
    lines: { type: [indentLineSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

export const Indent = mongoose.models.Indent ?? mongoose.model("Indent", indentSchema);

import mongoose from "mongoose";

const procurementRequestLineSchema = new mongoose.Schema(
  {
    materialCode: { type: String, required: true },
    materialName: { type: String, required: true },
    unit: { type: String, required: true },
    requiredQuantity: { type: Number, required: true },
  },
  { _id: false },
);

// `procurement_request_lines` (Postgres child table) is embedded as
// `materials`, matching the API response shape the repository already maps
// to — always read/written as a single unit with its request.
const procurementRequestSchema = new mongoose.Schema(
  {
    _id: { type: String },
    requestNumber: { type: String, required: true },
    sourceIndentId: { type: String, default: null, ref: "Indent" },
    projectId: { type: String, required: true, ref: "Project" },
    requiredDeliveryDate: { type: String, required: true },
    status: { type: String, required: true, default: "draft", enum: ["draft", "submitted", "approved"] },
    materials: { type: [procurementRequestLineSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

export const ProcurementRequest =
  mongoose.models.ProcurementRequest ??
  mongoose.model("ProcurementRequest", procurementRequestSchema);

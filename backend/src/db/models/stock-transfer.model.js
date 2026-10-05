import mongoose from "mongoose";

const stockTransferSchema = new mongoose.Schema(
  {
    _id: { type: String },
    sourceProjectId: { type: String, required: true, ref: "Project" },
    destinationProjectId: { type: String, required: true, ref: "Project" },
    materialCode: { type: String, required: true },
    materialName: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      default: "draft",
      enum: [
        "draft",
        "requested",
        "approved",
        "ready-for-dispatch",
        "dispatched",
        "in-transit",
        "received",
        "rejected",
      ],
    },
    requestedById: { type: String, required: true, ref: "User" },
    approvedById: { type: String, default: null, ref: "User" },
    requestedAt: { type: Date, required: true },
    dispatchedAt: { type: Date, default: null },
    receivedAt: { type: Date, default: null },
    vehicleNumber: { type: String, default: null },
    remarks: { type: String, default: null },
    rejectionReason: { type: String, default: null },
  },
  { versionKey: false },
);

export const StockTransfer =
  mongoose.models.StockTransfer ?? mongoose.model("StockTransfer", stockTransferSchema);

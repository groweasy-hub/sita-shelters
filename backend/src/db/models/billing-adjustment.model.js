import mongoose from "mongoose";

const billingAdjustmentSchema = new mongoose.Schema(
  {
    _id: { type: String },
    invoiceId: { type: String, required: true, unique: true, ref: "Grn" },
    transportationFee: { type: Number, required: true, default: 0, min: 0 },
    labourCharges: { type: Number, required: true, default: 0, min: 0 },
    otherCharges: { type: Number, required: true, default: 0, min: 0 },
    taxPercent: { type: Number, required: true, default: 18, min: 0 },
    updatedById: { type: String, default: null, ref: "User" },
  },
  { timestamps: true, versionKey: false },
);

export const BillingAdjustment =
  mongoose.models.BillingAdjustment ??
  mongoose.model("BillingAdjustment", billingAdjustmentSchema);

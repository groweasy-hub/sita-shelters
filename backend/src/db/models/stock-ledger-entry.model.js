import mongoose from "mongoose";

// Append-only ledger; balanceAfter is computed and stored at write time so
// history never needs to be replayed to render a past balance.
const stockLedgerEntrySchema = new mongoose.Schema(
  {
    _id: { type: String },
    projectId: { type: String, required: true, ref: "Project" },
    materialCode: { type: String, required: true },
    materialName: { type: String, required: true },
    unit: { type: String, required: true },
    movementType: {
      type: String,
      required: true,
      enum: [
        "opening",
        "goods-inward",
        "issue",
        "consumption",
        "return",
        "replacement",
        "transfer-in",
        "transfer-out",
        "damage",
      ],
    },
    quantity: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    referenceId: { type: String, default: null },
    date: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

export const StockLedgerEntry =
  mongoose.models.StockLedgerEntry ??
  mongoose.model("StockLedgerEntry", stockLedgerEntrySchema);

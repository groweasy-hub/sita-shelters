import mongoose from "mongoose";

const uomSchema = new mongoose.Schema(
  {
    _id: { type: String },
    code: { type: String, required: true },
    name: { type: String, required: true },
  },
  { versionKey: false },
);
uomSchema.index({ code: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export const Uom = mongoose.models.Uom ?? mongoose.model("Uom", uomSchema);

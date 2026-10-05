import mongoose from "mongoose";

// Uploaded quotation documents; fileUrl points into object storage once the
// uploads phase wires it (still unpopulated — embedded for schema
// completeness ahead of that phase, same as the Postgres table was).
const quotationDocumentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    fileUrl: { type: String, default: null },
    fileType: { type: String, default: null },
    fileSizeBytes: { type: Number, default: null },
    uploadedAt: { type: Date, default: Date.now },
    uploadedById: { type: String, default: null, ref: "User" },
  },
  { _id: false },
);

// One document = one supplier's quote for one material against one
// procurement request (matches quotationSchema, which is flat/single-
// material rather than a multi-line document). Kept as its own top-level
// collection (not embedded on ProcurementRequest) since it's queried and
// listed independently of any single parent request.
const supplierQuotationSchema = new mongoose.Schema(
  {
    _id: { type: String },
    purchaseRequestId: { type: String, required: true, ref: "ProcurementRequest" },
    vendorId: { type: String, required: true, ref: "Vendor" },
    materialCode: { type: String, required: true },
    quotationNumber: { type: String, required: true },
    quotationDate: { type: String, required: true },
    // Optional: no date means the quote doesn't expire.
    validUntil: { type: String, default: null },
    unitPrice: { type: Number, required: true },
    moq: { type: Number, required: true, default: 0 },
    discountPercent: { type: Number, required: true, default: 0 },
    taxPercent: { type: Number, required: true },
    // true when unitPrice already includes tax (taxPercent then only says how
    // much of it is tax); false when tax is added on top of the rate.
    taxIncluded: { type: Boolean, required: true, default: false },
    // Optional: no value means the supplier gave no delivery promise.
    deliveryDays: { type: Number, default: null },
    paymentTerms: { type: String, default: "" },
    deliveryTerms: { type: String, default: "" },
    remarks: { type: String, default: "" },
    qualityRating: { type: String, required: true, default: "medium", enum: ["low", "medium", "high"] },
    status: {
      type: String,
      required: true,
      default: "draft",
      enum: ["draft", "received", "under-review", "selected", "rejected", "expired"],
    },
    rejectionReason: { type: String, default: null },
    documents: { type: [quotationDocumentSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

export const SupplierQuotation =
  mongoose.models.SupplierQuotation ??
  mongoose.model("SupplierQuotation", supplierQuotationSchema);

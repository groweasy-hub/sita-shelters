import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    _id: { type: String },
    userId: { type: String, default: null, ref: "User" },
    module: { type: String, required: true },
    referenceId: { type: String, default: null },
    action: { type: String, required: true },
    oldValue: { type: String, default: null },
    newValue: { type: String, default: null },
    remarks: { type: String, default: null },
    status: { type: String, default: "success", enum: ["success", "blocked"] },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

export const AuditLog = mongoose.models.AuditLog ?? mongoose.model("AuditLog", auditLogSchema);

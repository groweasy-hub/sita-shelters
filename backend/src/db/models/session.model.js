import mongoose from "mongoose";

// Session ids are stored as a hash of the bearer token issued to the
// browser; the raw token is never persisted.
const sessionSchema = new mongoose.Schema(
  {
    _id: { type: String },
    userId: { type: String, required: true, ref: "User" },
    expiresAt: { type: Date, required: true },
    userAgent: { type: String, default: null },
    ipAddress: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);
// Belt-and-suspenders auto-cleanup alongside the app's own expiry check.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.models.Session ?? mongoose.model("Session", sessionSchema);

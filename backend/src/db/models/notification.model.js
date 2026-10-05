import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    _id: { type: String },
    userId: { type: String, required: true, ref: "User" },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    referenceType: { type: String, default: null },
    referenceId: { type: String, default: null },
    isRead: { type: Boolean, required: true, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

export const Notification =
  mongoose.models.Notification ?? mongoose.model("Notification", notificationSchema);

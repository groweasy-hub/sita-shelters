import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    _id: { type: String },
    code: { type: String, required: true },
    name: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["planning", "active", "on-hold", "completed"],
    },
    // Nullable: a project can exist before a project-manager user does.
    // Set automatically when a project-manager is created/assigned against
    // this project (see `repositories/users.js`'s `createUser`).
    projectManagerId: { type: String, default: null, ref: "User" },
    startDate: { type: String, required: true },
    estimatedCompletionDate: { type: String, required: true },
    progressPercent: { type: Number, required: true, default: 0, min: 0, max: 100 },
    description: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: null },
    landmark: { type: String, default: null },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: "India" },
  },
  { timestamps: true, versionKey: false },
);
projectSchema.index({ code: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export const Project = mongoose.models.Project ?? mongoose.model("Project", projectSchema);

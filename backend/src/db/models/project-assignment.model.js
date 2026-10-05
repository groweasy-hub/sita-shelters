import mongoose from "mongoose";

const projectAssignmentSchema = new mongoose.Schema(
  {
    _id: { type: String },
    userId: { type: String, required: true, ref: "User" },
    projectId: { type: String, required: true, ref: "Project" },
    accessLevel: {
      type: String,
      required: true,
      default: "view",
      enum: ["view", "operational", "management", "approval"],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);
projectAssignmentSchema.index({ userId: 1, projectId: 1 }, { unique: true });

export const ProjectAssignment =
  mongoose.models.ProjectAssignment ??
  mongoose.model("ProjectAssignment", projectAssignmentSchema);

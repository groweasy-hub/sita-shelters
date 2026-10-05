import mongoose from "mongoose";

// Keep in sync with APP_ROLES in frontend/src/config/permissions.js and
// backend/src/permissions.js.
export const APP_ROLE_VALUES = [
  "super-admin",
  "administrator",
  "project-head",
  "project-manager",
  "site-executive",
  "site-engineer",
  "supervisor",
  "gate-man",
  "store-manager",
  "project-accountant",
  "quality-inspector",
  "procurement-manager",
  "finance-manager",
  "hq-accountant",
  "hq-design",
  "hq-operations-head",
  "hq-ceo",
  "hq-md",
  "viewer",
];

const userSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, default: null },
    role: { type: String, required: true, enum: APP_ROLE_VALUES },
    status: {
      type: String,
      required: true,
      default: "invited",
      enum: ["active", "invited", "inactive"],
    },
    mobile: { type: String, default: null },
    // Profile picture, stored in Cloudinary — avatarPublicId is what's
    // needed to delete or replace it there; avatarUrl is just for display.
    avatarUrl: { type: String, default: null },
    avatarPublicId: { type: String, default: null },
    // Employee record. `employeeId` is generated (EMP-1041, EMP-1042, ...).
    employeeId: { type: String, default: null },
    department: { type: String, default: null },
    reportingManagerId: { type: String, default: null, ref: "User" },
    joiningDate: { type: String, default: null },
    passwordHash: { type: String, default: null },
    passwordChangedAt: { type: Date, default: null },
    passwordResetTokenHash: { type: String, default: null },
    passwordResetExpiresAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);
// Case-insensitive uniqueness, same as Postgres's lower(email) unique index.
// Employee ids are unique among the accounts that have one.
userSchema.index(
  { employeeId: 1 },
  {
    unique: true,
    partialFilterExpression: { employeeId: { $type: "string" } },
  },
);
userSchema.index(
  { email: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);
userSchema.index(
  { username: 1 },
  {
    unique: true,
    partialFilterExpression: { username: { $type: "string" } },
    collation: { locale: "en", strength: 2 },
  },
);

export const User = mongoose.models.User ?? mongoose.model("User", userSchema);

import { Router } from "express";
import multer from "multer";
import { z } from "zod";

import { displayNameSchema, emailSchema } from "../auth/validation.js";
import { sendWelcomeEmail } from "../auth/welcome-email.js";
import {
  deleteImage,
  isCloudinaryConfigured,
  uploadImageBuffer,
} from "../lib/cloudinary.js";
import { requirePermission } from "../middleware/require-permission.js";
import { APP_ROLES } from "../permissions.js";
import {
  clearUserAvatar,
  createUser,
  DuplicateEmailError,
  getUserAvatarPublicId,
  getUserById,
  listUsers,
  setUserAvatar,
  UnknownReportingManagerError,
} from "../repositories/users.js";

export const administrationUsersRouter = Router();

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

const identifierSchema = z.string().trim().min(1).max(128);
const createUserInputSchema = z.object({
  name: displayNameSchema,
  email: emailSchema,
  role: z.enum(APP_ROLES),
  projectIds: z.array(identifierSchema).default([]),
  // The employee record. The employee id is generated, never supplied.
  department: z.string().trim().min(1, "Department is required").max(100),
  reportingManagerId: z.preprocess(
    (value) => (value === "" ? null : value),
    identifierSchema.nullable().default(null),
  ),
  mobile: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s\-()]{6,19}$/, "Enter a valid mobile number"),
  joiningDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid joining date"),
});

function validationIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

administrationUsersRouter.get(
  "/",
  requirePermission("administration:view"),
  async (req, res) => {
    try {
      res.json(await listUsers());
    } catch (error) {
      console.error("Administration users API error", error);
      res
        .status(500)
        .json({ error: "The user directory request could not be completed" });
    }
  },
);

administrationUsersRouter.post(
  "/",
  requirePermission("administration:users:manage"),
  async (req, res) => {
    const result = createUserInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "User details are invalid",
        issues: validationIssues(result.error),
      });
    }
    try {
      const { user, temporaryPassword } = await createUser(result.data);
      void sendWelcomeEmail({
        userId: user.id,
        name: user.name,
        email: user.email,
        temporaryPassword,
      });
      res.status(201).json({ user, temporaryPassword });
    } catch (error) {
      if (error instanceof UnknownReportingManagerError) {
        return res.status(400).json({
          error: "User details are invalid",
          issues: [
            {
              field: "reportingManagerId",
              message: "Choose an existing employee as the reporting manager",
            },
          ],
        });
      }
      if (error instanceof DuplicateEmailError) {
        return res.status(400).json({ error: "User details are invalid" });
      }
      console.error("Administration user create API error", error);
      res.status(500).json({ error: "The user could not be created" });
    }
  },
);

administrationUsersRouter.post(
  "/:userId/avatar",
  requirePermission("administration:users:manage"),
  avatarUpload.single("image"),
  async (req, res) => {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({ error: "Image upload is not configured" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No image file was provided" });
    }
    try {
      const existing = await getUserById(req.params.userId);
      if (!existing) {
        return res.status(404).json({ error: "User not found" });
      }
      // A fixed public id (the user's own id) means this overwrites the
      // previous avatar in place at Cloudinary rather than leaving it orphaned.
      const { url, publicId } = await uploadImageBuffer(req.file.buffer, {
        folder: "sita-shelters/avatars",
        publicId: req.params.userId,
      });
      res.json(await setUserAvatar(req.params.userId, { url, publicId }));
    } catch (error) {
      console.error("Avatar upload API error", error);
      res.status(500).json({ error: "The image could not be uploaded" });
    }
  },
);

administrationUsersRouter.delete(
  "/:userId/avatar",
  requirePermission("administration:users:manage"),
  async (req, res) => {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({ error: "Image upload is not configured" });
    }
    try {
      const publicId = await getUserAvatarPublicId(req.params.userId);
      if (!publicId) {
        return res.status(404).json({ error: "This user has no profile image" });
      }
      await deleteImage(publicId);
      res.json(await clearUserAvatar(req.params.userId));
    } catch (error) {
      console.error("Avatar remove API error", error);
      res.status(500).json({ error: "The image could not be removed" });
    }
  },
);

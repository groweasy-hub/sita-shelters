import { Router } from "express";
import { z } from "zod";

import { requirePermission } from "../middleware/require-permission.js";
import { canAccessProject } from "../permissions.js";
import {
  completeQualityControlRefund,
  getQualityControlInspection,
  inspectQualityControlRecord,
  listAllQualityControlInspections,
  listQualityControlInspectionsByInward,
  QcAlreadyInspectedError,
  QcNothingToResolveError,
  QcQuantityMismatchError,
  QcReplacementQuantityError,
  receiveQualityControlReplacement,
  resolveQualityControlRecord,
} from "../repositories/quality-control.js";
import { RefundNotAllowedError } from "../repositories/refunds.js";
import {
  ReplacementNotAllowedError,
  ReplacementQuantityError,
} from "../repositories/replacements.js";

export const qualityControlRouter = Router();

const inspectInputSchema = z
  .object({
    acceptedQuantity: z.coerce.number().finite().nonnegative(),
    rejectedQuantity: z.coerce.number().finite().nonnegative(),
    remarks: z.string().trim().min(1).max(500),
    // The checks the inspector ticked off: pass / fail / not applicable.
    checklist: z
      .array(
        z.object({
          key: z.string().trim().min(1).max(64),
          label: z.string().trim().min(1).max(200),
          result: z.enum(["pass", "fail", "na"]),
        }),
      )
      .max(20)
      .default([]),
  })
  .refine((input) => input.acceptedQuantity + input.rejectedQuantity > 0, {
    message: "Enter at least one non-zero quantity",
    path: ["acceptedQuantity"],
  });
const resolveInputSchema = z.object({
  type: z.enum(["replace", "refund"]),
  // The value is calculated from quantity × unit price, never taken from the client.
  quantity: z.coerce.number().finite().positive("Enter a quantity greater than zero"),
  remarks: z.string().trim().max(500).default(""),
});

const receiveInputSchema = z.object({
  quantity: z.coerce.number().finite().positive("Enter a quantity greater than zero"),
  remarks: z.string().trim().max(500).default(""),
});

const refundCompletedInputSchema = z.object({
  reference: z.string().trim().max(120).default(""),
  remarks: z.string().trim().max(500).default(""),
});

function validationIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

qualityControlRouter.get(
  "/",
  requirePermission("quality-control:view"),
  async (req, res) => {
    try {
      res.json(await listAllQualityControlInspections());
    } catch (error) {
      console.error("Quality control API error", error);
      res.status(500).json({ error: "The QC request could not be completed" });
    }
  },
);

qualityControlRouter.get(
  "/:qcId",
  requirePermission("quality-control:view"),
  async (req, res) => {
    try {
      const record = await getQualityControlInspection(req.params.qcId);
      if (!record) {
        return res.status(404).json({ error: "QC record not found" });
      }
      res.json(record);
    } catch (error) {
      console.error("Quality control detail API error", error);
      res.status(500).json({ error: "The QC request could not be completed" });
    }
  },
);

qualityControlRouter.get(
  "/by-inward/:inwardId",
  requirePermission("quality-control:view"),
  async (req, res) => {
    try {
      res.json(await listQualityControlInspectionsByInward(req.params.inwardId));
    } catch (error) {
      console.error("Quality control by-inward API error", error);
      res.status(500).json({ error: "The QC request could not be completed" });
    }
  },
);

qualityControlRouter.post(
  "/:qcId/inspect",
  requirePermission({ all: ["quality-control:manage", "quality-control:approve"] }),
  async (req, res) => {
    const result = inspectInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Inspection details are invalid",
        issues: validationIssues(result.error),
      });
    }
    try {
      const existing = await getQualityControlInspection(req.params.qcId);
      if (!existing) {
        return res.status(404).json({ error: "QC record not found" });
      }
      // Project-scoped roles (site engineer, project manager, …) may only
      // inspect deliveries for a project they're assigned to.
      if (!canAccessProject(req.user, existing.projectId)) {
        return res.status(403).json({
          error: "Inspection details are invalid",
          issues: [{ field: "qcId", message: "You are not assigned to this project" }],
        });
      }
      const record = await inspectQualityControlRecord(req.params.qcId, {
        ...result.data,
        inspectorId: req.user.id,
      });
      res.json(record);
    } catch (error) {
      if (error instanceof QcAlreadyInspectedError) {
        return res.status(409).json({
          error: "Inspection details are invalid",
          issues: [{ field: "qcId", message: error.message }],
        });
      }
      if (error instanceof QcQuantityMismatchError) {
        return res.status(400).json({
          error: "Inspection details are invalid",
          issues: [{ field: "acceptedQuantity", message: error.message }],
        });
      }
      console.error("Quality control inspect API error", error);
      res.status(500).json({ error: "The inspection could not be recorded" });
    }
  },
);

qualityControlRouter.post(
  "/:qcId/resolve",
  requirePermission({ all: ["quality-control:manage", "quality-control:approve"] }),
  async (req, res) => {
    const result = resolveInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Resolution details are invalid",
        issues: validationIssues(result.error),
      });
    }
    try {
      const existing = await getQualityControlInspection(req.params.qcId);
      if (!existing) {
        return res.status(404).json({ error: "QC record not found" });
      }
      if (!canAccessProject(req.user, existing.projectId)) {
        return res.status(403).json({
          error: "Resolution details are invalid",
          issues: [{ field: "qcId", message: "You are not assigned to this project" }],
        });
      }
      const record = await resolveQualityControlRecord(req.params.qcId, {
        ...result.data,
        resolvedById: req.user.id,
      });
      res.json(record);
    } catch (error) {
      if (error instanceof QcNothingToResolveError) {
        return res.status(409).json({
          error: "Resolution details are invalid",
          issues: [{ field: "qcId", message: error.message }],
        });
      }
      if (error instanceof QcReplacementQuantityError) {
        return res.status(400).json({
          error: "Resolution details are invalid",
          issues: [{ field: "quantity", message: error.message }],
        });
      }
      console.error("Quality control resolve API error", error);
      res.status(500).json({ error: "The resolution could not be recorded" });
    }
  },
);

qualityControlRouter.post(
  "/:qcId/replacements",
  requirePermission({ all: ["quality-control:manage", "quality-control:approve"] }),
  async (req, res) => {
    const result = receiveInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Replacement details are invalid",
        issues: validationIssues(result.error),
      });
    }
    try {
      const existing = await getQualityControlInspection(req.params.qcId);
      if (!existing) {
        return res.status(404).json({ error: "QC record not found" });
      }
      if (!canAccessProject(req.user, existing.projectId)) {
        return res.status(403).json({
          error: "Replacement details are invalid",
          issues: [{ field: "qcId", message: "You are not assigned to this project" }],
        });
      }
      const record = await receiveQualityControlReplacement(req.params.qcId, {
        ...result.data,
        receivedById: req.user.id,
      });
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof ReplacementNotAllowedError) {
        return res.status(409).json({
          error: "Replacement details are invalid",
          issues: [{ field: "qcId", message: error.message }],
        });
      }
      if (error instanceof ReplacementQuantityError) {
        return res.status(400).json({
          error: "Replacement details are invalid",
          issues: [{ field: "quantity", message: error.message }],
        });
      }
      console.error("Quality control replacement API error", error);
      res.status(500).json({ error: "The replacement could not be recorded" });
    }
  },
);

qualityControlRouter.post(
  "/:qcId/refund-completed",
  requirePermission({ all: ["quality-control:manage", "quality-control:approve"] }),
  async (req, res) => {
    const result = refundCompletedInputSchema.safeParse(req.body ?? {});
    if (!result.success) {
      return res.status(400).json({
        error: "Refund details are invalid",
        issues: validationIssues(result.error),
      });
    }
    try {
      const existing = await getQualityControlInspection(req.params.qcId);
      if (!existing) {
        return res.status(404).json({ error: "QC record not found" });
      }
      if (!canAccessProject(req.user, existing.projectId)) {
        return res.status(403).json({
          error: "Refund details are invalid",
          issues: [{ field: "qcId", message: "You are not assigned to this project" }],
        });
      }
      const record = await completeQualityControlRefund(req.params.qcId, {
        ...result.data,
        completedById: req.user.id,
      });
      res.json(record);
    } catch (error) {
      if (error instanceof RefundNotAllowedError) {
        return res.status(409).json({
          error: "Refund details are invalid",
          issues: [{ field: "qcId", message: error.message }],
        });
      }
      console.error("Quality control refund API error", error);
      res.status(500).json({ error: "The refund could not be recorded" });
    }
  },
);

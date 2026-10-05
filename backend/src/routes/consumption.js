import { Router } from "express";
import { z } from "zod";

import { requirePermission } from "../middleware/require-permission.js";
import { canAccessProject } from "../permissions.js";
import {
  getMaterialIssueRow,
  listOutstandingMaterialIssues,
} from "../repositories/material-issues.js";
import {
  createConsumptionRecord,
  ExcessQuantityError,
  confirmIssueConsumption,
  InsufficientStockError,
  IssueNotOutstandingError,
  listAllConsumptionRecords,
  recordDirectUsage,
  UnknownMaterialError,
  UnknownMaterialIssueError,
  UnknownProjectError,
} from "../repositories/consumption.js";

export const consumptionRouter = Router();

const identifierSchema = z.string().trim().min(1).max(128);
const createConsumptionInputSchema = z.object({
  materialIssueId: identifierSchema,
  quantityConsumed: z.coerce.number().finite().positive(),
  activity: z.string().trim().min(1).max(255),
  location: z.string().trim().min(1).max(255),
});

const directUsageInputSchema = z.object({
  projectId: identifierSchema,
  materialCode: identifierSchema,
  quantityConsumed: z.coerce.number().finite().positive(),
  activity: z.string().trim().min(1).max(255),
  location: z.string().trim().min(1).max(255),
});

function validationIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

// Issued material still waiting for "Consumed", limited to the caller's sites.
// Registered before any "/:id" style route so "pending" isn't read as an id.
consumptionRouter.get(
  "/pending",
  requirePermission("consumption:view"),
  async (req, res) => {
    try {
      const issues = await listOutstandingMaterialIssues();
      res.json(issues.filter((issue) => canAccessProject(req.user, issue.projectId)));
    } catch (error) {
      console.error("Pending consumption API error", error);
      res.status(500).json({ error: "The consumption request could not be completed" });
    }
  },
);

consumptionRouter.get(
  "/",
  requirePermission("consumption:view"),
  async (req, res) => {
    try {
      res.json(await listAllConsumptionRecords());
    } catch (error) {
      console.error("Consumption API error", error);
      res.status(500).json({ error: "The consumption request could not be completed" });
    }
  },
);

consumptionRouter.post(
  "/",
  requirePermission("consumption:manage"),
  async (req, res) => {
    const result = createConsumptionInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Consumption details are invalid",
        issues: validationIssues(result.error),
      });
    }
    try {
      // Project-scoped roles (e.g. the store manager) may only log use against their own site's issues.
      const issue = await getMaterialIssueRow(result.data.materialIssueId);
      if (issue && !canAccessProject(req.user, issue.projectId)) {
        return res.status(403).json({
          error: "Consumption details are invalid",
          issues: [{ field: "materialIssueId", message: "You are not assigned to this project" }],
        });
      }
      const record = await createConsumptionRecord({
        ...result.data,
        recordedById: req.user.id,
      });
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof UnknownMaterialIssueError) {
        return res.status(400).json({
          error: "Consumption details are invalid",
          issues: [{ field: "materialIssueId", message: error.message }],
        });
      }
      if (error instanceof ExcessQuantityError) {
        return res.status(400).json({
          error: "Consumption details are invalid",
          issues: [{ field: "quantityConsumed", message: error.message }],
        });
      }
      console.error("Consumption create API error", error);
      res.status(500).json({ error: "The consumption entry could not be recorded" });
    }
  },
);

// Usage recorded straight from site stock (no prior issue). It takes stock out
// of the store, so it needs the right to issue material as well as to log use.
consumptionRouter.post(
  "/direct",
  requirePermission({ all: ["consumption:manage", "material-issues:manage"] }),
  async (req, res) => {
    const result = directUsageInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Usage details are invalid",
        issues: validationIssues(result.error),
      });
    }
    if (!canAccessProject(req.user, result.data.projectId)) {
      return res.status(403).json({
        error: "Usage details are invalid",
        issues: [{ field: "projectId", message: "You are not assigned to this project" }],
      });
    }
    try {
      const record = await recordDirectUsage({
        ...result.data,
        recordedById: req.user.id,
        recordedByName: req.user.name,
      });
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof UnknownProjectError) {
        return res.status(400).json({
          error: "Usage details are invalid",
          issues: [{ field: "projectId", message: error.message }],
        });
      }
      if (error instanceof UnknownMaterialError) {
        return res.status(400).json({
          error: "Usage details are invalid",
          issues: [{ field: "materialCode", message: error.message }],
        });
      }
      if (error instanceof InsufficientStockError) {
        return res.status(400).json({
          error: "Usage details are invalid",
          issues: [
            {
              field: "quantityConsumed",
              message: "The site doesn't hold enough of this material in stock",
            },
          ],
        });
      }
      console.error("Direct usage API error", error);
      res.status(500).json({ error: "The usage could not be recorded" });
    }
  },
);

// "Consumed" from the Site Engineer or Project Manager on an issued material.
// Either can do it; the first click updates the issue for both.
const confirmInputSchema = z.object({
  materialIssueId: identifierSchema,
  // Omitted = everything still outstanding on the issue.
  quantity: z.coerce.number().finite().positive().optional(),
});

consumptionRouter.post(
  "/confirm",
  requirePermission("consumption:confirm"),
  async (req, res) => {
    const result = confirmInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Consumption details are invalid",
        issues: validationIssues(result.error),
      });
    }
    try {
      const issue = await getMaterialIssueRow(result.data.materialIssueId);
      if (!issue) {
        return res.status(404).json({ error: "Material issue not found" });
      }
      if (!canAccessProject(req.user, issue.projectId)) {
        return res.status(403).json({
          error: "Consumption details are invalid",
          issues: [{ field: "materialIssueId", message: "You are not assigned to this project" }],
        });
      }
      const record = await confirmIssueConsumption({
        ...result.data,
        quantity: result.data.quantity,
        recordedById: req.user.id,
      });
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof IssueNotOutstandingError) {
        return res.status(409).json({
          error: "Consumption details are invalid",
          issues: [{ field: "materialIssueId", message: error.message }],
        });
      }
      if (error instanceof ExcessQuantityError) {
        return res.status(400).json({
          error: "Consumption details are invalid",
          issues: [{ field: "quantity", message: error.message }],
        });
      }
      console.error("Consumption confirm API error", error);
      res.status(500).json({ error: "The consumption could not be recorded" });
    }
  },
);

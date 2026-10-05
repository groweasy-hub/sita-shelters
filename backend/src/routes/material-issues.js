import { Router } from "express";
import { z } from "zod";

import { requirePermission } from "../middleware/require-permission.js";
import { InsufficientStockError } from "../repositories/inventory.js";
import {
  createMaterialIssue,
  getMaterialIssue,
  listAllMaterialIssues,
  UnknownMaterialError,
  UnknownProjectError,
} from "../repositories/material-issues.js";

export const materialIssuesRouter = Router();

const identifierSchema = z.string().trim().min(1).max(128);
const createMaterialIssueInputSchema = z.object({
  projectId: identifierSchema,
  materialCode: identifierSchema,
  issuedQuantity: z.coerce.number().finite().positive(),
  recipientName: z.string().trim().min(1).max(255),
  purpose: z.string().trim().min(1).max(255),
  workLocation: z.string().trim().min(1).max(255),
});

function validationIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

materialIssuesRouter.get(
  "/",
  requirePermission("material-issues:view"),
  async (req, res) => {
    try {
      res.json(await listAllMaterialIssues());
    } catch (error) {
      console.error("Material issues API error", error);
      res.status(500).json({ error: "The material issue request could not be completed" });
    }
  },
);

materialIssuesRouter.get(
  "/:issueId",
  requirePermission("material-issues:view"),
  async (req, res) => {
    try {
      const record = await getMaterialIssue(req.params.issueId);
      if (!record) {
        return res.status(404).json({ error: "Material issue not found" });
      }
      res.json(record);
    } catch (error) {
      console.error("Material issue detail API error", error);
      res.status(500).json({ error: "The material issue request could not be completed" });
    }
  },
);

materialIssuesRouter.post(
  "/",
  requirePermission("material-issues:manage"),
  async (req, res) => {
    const result = createMaterialIssueInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Material issue details are invalid",
        issues: validationIssues(result.error),
      });
    }
    try {
      const record = await createMaterialIssue({
        ...result.data,
        issuedById: req.user.id,
      });
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof UnknownProjectError) {
        return res.status(400).json({
          error: "Material issue details are invalid",
          issues: [{ field: "projectId", message: error.message }],
        });
      }
      if (error instanceof UnknownMaterialError) {
        return res.status(400).json({
          error: "Material issue details are invalid",
          issues: [{ field: "materialCode", message: error.message }],
        });
      }
      if (error instanceof InsufficientStockError) {
        return res.status(400).json({
          error: "Material issue details are invalid",
          issues: [{ field: "issuedQuantity", message: error.message }],
        });
      }
      console.error("Material issue create API error", error);
      res.status(500).json({ error: "The material issue could not be created" });
    }
  },
);

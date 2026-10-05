import { Router } from "express";
import { z } from "zod";

import { requirePermission } from "../middleware/require-permission.js";
import { canAccessProject } from "../permissions.js";
import {
  createIndent,
  getIndent,
  getIndentTimeline,
  listAllIndents,
  UnknownMaterialError,
} from "../repositories/indents.js";
import { UnknownCategoryError } from "../repositories/materials.js";
import { getProject } from "../repositories/projects.js";
import { approveIndentAndSendToProcurement } from "../repositories/procurement.js";

export const indentsRouter = Router();

const identifierSchema = z.string().trim().min(1).max(128);
const requestedQuantitySchema = z.coerce.number().finite().positive();
// A line is either an existing catalogue item, or a new item typed in by the
// requester — which is added to the catalogue when the indent is created.
const createIndentLineInputSchema = z.union([
  z.object({
    materialCode: identifierSchema,
    requestedQuantity: requestedQuantitySchema,
  }),
  z.object({
    newMaterial: z.object({
      name: z.string().trim().min(1).max(255),
      unit: z.string().trim().min(1).max(32),
      category: identifierSchema,
      subcategory: identifierSchema,
    }),
    requestedQuantity: requestedQuantitySchema,
  }),
]);
const createIndentInputSchema = z.object({
  projectId: identifierSchema,
  requiredDate: z.string().trim().min(1),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  purpose: z.string().trim().min(1).max(500),
  workLocation: z.string().trim().min(1).max(255),
  lines: z.array(createIndentLineInputSchema).min(1),
});

function validationIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

indentsRouter.get("/", requirePermission("indents:view"), async (req, res) => {
  try {
    res.json(await listAllIndents());
  } catch (error) {
    console.error("Indents API error", error);
    res.status(500).json({ error: "The indent request could not be completed" });
  }
});

indentsRouter.get("/:indentId", requirePermission("indents:view"), async (req, res) => {
  try {
    const indent = await getIndent(req.params.indentId);
    if (!indent) {
      return res.status(404).json({ error: "Indent not found" });
    }
    res.json(indent);
  } catch (error) {
    console.error("Indent detail API error", error);
    res.status(500).json({ error: "The indent request could not be completed" });
  }
});

indentsRouter.get(
  "/:indentId/timeline",
  requirePermission("indents:view"),
  async (req, res) => {
    try {
      const indent = await getIndent(req.params.indentId);
      if (!indent) {
        return res.status(404).json({ error: "Indent not found" });
      }
      res.json(await getIndentTimeline(req.params.indentId));
    } catch (error) {
      console.error("Indent timeline API error", error);
      res.status(500).json({ error: "The indent timeline could not be loaded" });
    }
  },
);

indentsRouter.post("/", requirePermission("indents:create"), async (req, res) => {
  const result = createIndentInputSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Indent details are invalid",
      issues: validationIssues(result.error),
    });
  }

  try {
    if (!(await getProject(result.data.projectId))) {
      return res.status(400).json({
        error: "Indent details are invalid",
        issues: [{ field: "projectId", message: "Unknown project" }],
      });
    }
    // Project-scoped roles can only raise indents for projects they're assigned to.
    if (!canAccessProject(req.user, result.data.projectId)) {
      return res.status(403).json({
        error: "Indent details are invalid",
        issues: [
          { field: "projectId", message: "You are not assigned to this project" },
        ],
      });
    }

    const indent = await createIndent({
      ...result.data,
      requestedById: req.user.id,
    });
    res.status(201).json(indent);
  } catch (error) {
    if (error instanceof UnknownMaterialError || error instanceof UnknownCategoryError) {
      return res.status(400).json({
        error: "Indent details are invalid",
        issues: [{ field: "lines", message: error.message }],
      });
    }
    console.error("Indent create API error", error);
    res.status(500).json({ error: "The indent could not be created" });
  }
});

/**
 * Approves an indent and, in the same step, sends it to procurement —
 * creates the procurement request that the quotation flow selects against.
 * Matches the DB schema's intended chain: Indent -> Procurement Request ->
 * Supplier Quotation -> Purchase Order.
 */
indentsRouter.post(
  "/:indentId/approve",
  requirePermission("indents:approve"),
  async (req, res) => {
    try {
      const indent = await getIndent(req.params.indentId);
      if (!indent) {
        return res.status(404).json({ error: "Indent not found" });
      }
      if (indent.status !== "submitted" && indent.status !== "under-review") {
        return res.status(409).json({
          error: "Only a submitted or under-review indent can be approved",
        });
      }
      await approveIndentAndSendToProcurement(req.params.indentId, req.user.id);
      res.json(await getIndent(req.params.indentId));
    } catch (error) {
      console.error("Indent approve API error", error);
      res.status(500).json({ error: "The indent could not be approved" });
    }
  },
);

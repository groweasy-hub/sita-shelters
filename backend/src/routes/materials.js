import { Router } from "express";
import { z } from "zod";

import { requirePermission } from "../middleware/require-permission.js";
import {
  createMaterial,
  getMaterial,
  listAllMaterials,
  listMaterialVendors,
  updateMaterial,
} from "../repositories/materials.js";

export const materialsRouter = Router();

const identifierSchema = z.string().trim().min(1).max(128);
const createMaterialInputSchema = z.object({
  code: identifierSchema,
  name: z.string().trim().min(1).max(255),
  category: identifierSchema,
  subcategory: identifierSchema,
  unit: z.string().trim().min(1).max(32),
  specification: z.string().trim().max(500).optional(),
  approvedVendorIds: z.array(identifierSchema).default([]),
  reorderLevel: z.coerce.number().finite().nonnegative(),
  lastPurchasePrice: z.coerce.number().finite().nonnegative(),
  status: z.enum(["active", "inactive"]).default("active"),
});
const updateMaterialInputSchema = z.object({
  specification: z.string().trim().max(500).optional(),
  reorderLevel: z.coerce.number().finite().nonnegative(),
  lastPurchasePrice: z.coerce.number().finite().nonnegative(),
  status: z.enum(["active", "inactive"]),
});

function validationIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

materialsRouter.get("/", requirePermission("materials:view"), async (req, res) => {
  try {
    res.json(await listAllMaterials());
  } catch (error) {
    console.error("Materials API error", error);
    res.status(500).json({ error: "The material request could not be completed" });
  }
});

materialsRouter.get(
  "/:materialId/vendors",
  requirePermission("materials:view"),
  async (req, res) => {
    try {
      const vendors = await listMaterialVendors(req.params.materialId);
      if (!vendors) {
        return res.status(404).json({ error: "Material not found" });
      }
      res.json(vendors);
    } catch (error) {
      console.error("Material vendors API error", error);
      res.status(500).json({ error: "The material request could not be completed" });
    }
  },
);

materialsRouter.get("/:materialId", requirePermission("materials:view"), async (req, res) => {
  try {
    const material = await getMaterial(req.params.materialId);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    res.json(material);
  } catch (error) {
    console.error("Material detail API error", error);
    res.status(500).json({ error: "The material request could not be completed" });
  }
});

materialsRouter.post("/", requirePermission("materials:manage"), async (req, res) => {
  const result = createMaterialInputSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Material details are invalid",
      issues: validationIssues(result.error),
    });
  }

  try {
    const material = await createMaterial(result.data);
    res.status(201).json(material);
  } catch (error) {
    console.error("Material create API error", error);
    res.status(500).json({ error: "The material could not be created" });
  }
});

materialsRouter.patch("/:materialId", requirePermission("materials:manage"), async (req, res) => {
  const result = updateMaterialInputSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Material details are invalid",
      issues: validationIssues(result.error),
    });
  }

  try {
    const material = await updateMaterial(req.params.materialId, result.data);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    res.json(material);
  } catch (error) {
    console.error("Material update API error", error);
    res.status(500).json({ error: "The material could not be updated" });
  }
});

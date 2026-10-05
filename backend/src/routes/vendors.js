import { Router } from "express";
import { z } from "zod";

import { requirePermission } from "../middleware/require-permission.js";
import {
  createVendor,
  DuplicateVendorCodeError,
  getVendor,
  listAllVendors,
  UnknownMaterialCategoryError,
  updateVendorCapabilities,
} from "../repositories/vendors.js";

export const vendorsRouter = Router();

const identifierSchema = z.string().trim().min(1).max(128);
const vendorContactSchema = z.object({
  name: z.string().trim().min(1),
  role: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  email: z.string().trim().min(1),
});
const createVendorInputSchema = z.object({
  // Optional: generated (VND-0001, VND-0002, ...) when left blank.
  code: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    identifierSchema.optional(),
  ),
  name: z.string().trim().min(1).max(255),
  type: z.string().trim().min(1),
  gstNumber: z.string().trim().min(1),
  address: z.string().trim().min(1),
  contacts: z.array(vendorContactSchema).default([]),
  materialCategories: z.array(identifierSchema).default([]),
  priceCompetitiveness: z.string().trim().default(""),
  status: z.enum(["active", "under-review", "inactive"]).default("active"),
});

const updateVendorCapabilitiesInputSchema = z.object({
  materialCategories: z.array(identifierSchema).max(100),
});

function validationIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

vendorsRouter.get("/", requirePermission("vendors:view"), async (req, res) => {
  try {
    res.json(await listAllVendors());
  } catch (error) {
    console.error("Vendors API error", error);
    res.status(500).json({ error: "The vendor request could not be completed" });
  }
});

vendorsRouter.get("/:vendorId", requirePermission("vendors:view"), async (req, res) => {
  try {
    const vendor = await getVendor(req.params.vendorId);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.json(vendor);
  } catch (error) {
    console.error("Vendor detail API error", error);
    res.status(500).json({ error: "The vendor request could not be completed" });
  }
});

vendorsRouter.post("/", requirePermission("vendors:manage"), async (req, res) => {
  const result = createVendorInputSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Vendor details are invalid",
      issues: validationIssues(result.error),
    });
  }

  try {
    const vendor = await createVendor(result.data);
    res.status(201).json(vendor);
  } catch (error) {
    if (error instanceof DuplicateVendorCodeError) {
      return res.status(409).json({
        error: "Vendor details are invalid",
        issues: [{ field: "code", message: error.message }],
      });
    }
    console.error("Vendor create API error", error);
    res.status(500).json({ error: "The vendor could not be created" });
  }
});

// Only the supply capability is editable after creation; the scorecard is
// calculated, never set by hand.
vendorsRouter.patch("/:vendorId", requirePermission("vendors:manage"), async (req, res) => {
  const result = updateVendorCapabilitiesInputSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Vendor details are invalid",
      issues: validationIssues(result.error),
    });
  }

  try {
    const vendor = await updateVendorCapabilities(
      req.params.vendorId,
      result.data.materialCategories,
    );
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.json(vendor);
  } catch (error) {
    if (error instanceof UnknownMaterialCategoryError) {
      return res.status(400).json({
        error: "Vendor details are invalid",
        issues: [{ field: "materialCategories", message: error.message }],
      });
    }
    console.error("Vendor update API error", error);
    res.status(500).json({ error: "The vendor could not be updated" });
  }
});

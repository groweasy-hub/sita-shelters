import { Router } from "express";
import { z } from "zod";

import { requirePermission } from "../middleware/require-permission.js";
import {
  createQuotation,
  deselectQuotationLine,
  listAllQuotations,
  selectQuotationLine,
} from "../repositories/procurement.js";

export const quotationsRouter = Router();

const identifierSchema = z.string().trim().min(1).max(128);
const createQuotationInputSchema = z.object({
  purchaseRequestId: identifierSchema,
  vendorId: identifierSchema,
  materialCode: identifierSchema,
  quotationNumber: z.string().trim().min(1).max(64),
  quotationDate: z.string().trim().min(1),
  validUntil: z.string().trim().min(1).nullable().default(null),
  unitPrice: z.coerce.number().finite().nonnegative(),
  moq: z.coerce.number().finite().nonnegative().default(0),
  discountPercent: z.coerce.number().finite().nonnegative().default(0),
  taxPercent: z.coerce.number().finite().nonnegative(),
  taxIncluded: z.boolean().default(false),
  deliveryDays: z.coerce.number().int().nonnegative().nullable().default(null),
  paymentTerms: z.string().trim().max(200).default(""),
  deliveryTerms: z.string().trim().max(200).default(""),
  remarks: z.string().trim().max(500).default(""),
  qualityRating: z.enum(["low", "medium", "high"]).default("medium"),
});

function validationIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

quotationsRouter.get("/", requirePermission("procurement:view"), async (req, res) => {
  try {
    res.json(await listAllQuotations());
  } catch (error) {
    console.error("Quotations API error", error);
    res.status(500).json({ error: "The quotation list could not be completed" });
  }
});

quotationsRouter.post(
  "/",
  requirePermission("procurement:manage"),
  async (req, res) => {
    const result = createQuotationInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Quotation details are invalid",
        issues: validationIssues(result.error),
      });
    }
    try {
      const quotation = await createQuotation(result.data);
      res.status(201).json(quotation);
    } catch (error) {
      console.error("Quotation create API error", error);
      res.status(500).json({ error: "The quotation could not be created" });
    }
  },
);

quotationsRouter.post(
  "/:quotationId/select",
  requirePermission("procurement:approve"),
  async (req, res) => {
    try {
      const quotation = await selectQuotationLine(req.params.quotationId);
      if (!quotation) {
        return res.status(404).json({ error: "Quotation not found" });
      }
      res.json(quotation);
    } catch (error) {
      console.error("Quotation select API error", error);
      res.status(500).json({ error: "The quotation could not be selected" });
    }
  },
);

quotationsRouter.post(
  "/:quotationId/deselect",
  requirePermission("procurement:approve"),
  async (req, res) => {
    try {
      const quotation = await deselectQuotationLine(req.params.quotationId);
      if (!quotation) {
        return res.status(404).json({ error: "Quotation not found" });
      }
      res.json(quotation);
    } catch (error) {
      console.error("Quotation deselect API error", error);
      res.status(500).json({ error: "The quotation could not be deselected" });
    }
  },
);

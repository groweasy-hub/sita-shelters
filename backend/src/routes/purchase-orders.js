import { Router } from "express";
import { z } from "zod";

import { requirePermission } from "../middleware/require-permission.js";
import {
  approvePurchaseOrder,
  createPurchaseOrder,
  getPurchaseOrder,
  listAllPurchaseOrders,
  rejectPurchaseOrder,
  releasePurchaseOrder,
  sendBackPurchaseOrder,
  UnknownMaterialError,
} from "../repositories/procurement.js";

export const purchaseOrdersRouter = Router();

const identifierSchema = z.string().trim().min(1).max(128);
const poItemInputSchema = z.object({
  quotationLineId: identifierSchema.nullable().default(null),
  materialCode: identifierSchema,
  // Ignored: the name and unit are always taken from the material catalogue.
  materialName: z.string().trim().max(255).optional(),
  unit: z.string().trim().max(32).optional(),
  orderedQuantity: z.coerce.number().finite().positive(),
  unitPrice: z.coerce.number().finite().nonnegative(),
  taxPercent: z.coerce.number().finite().nonnegative(),
});
const createPoInputSchema = z.object({
  sourceIndentId: identifierSchema.nullable().default(null),
  vendorId: identifierSchema,
  projectId: identifierSchema,
  termsNote: z.string().trim().max(500).default(""),
  items: z.array(poItemInputSchema).min(1, "Add at least one item"),
});
const approvalRemarksInputSchema = z.object({
  remarks: z.string().trim().min(1).max(500),
});

function validationIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

purchaseOrdersRouter.get(
  "/",
  requirePermission("procurement:view"),
  async (req, res) => {
    try {
      res.json(await listAllPurchaseOrders());
    } catch (error) {
      console.error("Purchase orders API error", error);
      res
        .status(500)
        .json({ error: "The purchase order list could not be completed" });
    }
  },
);

purchaseOrdersRouter.get(
  "/:poId",
  requirePermission("procurement:view"),
  async (req, res) => {
    try {
      const order = await getPurchaseOrder(req.params.poId);
      if (!order) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Purchase order detail API error", error);
      res
        .status(500)
        .json({ error: "The purchase order request could not be completed" });
    }
  },
);

purchaseOrdersRouter.post(
  "/",
  requirePermission("procurement:approve"),
  async (req, res) => {
    const result = createPoInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Purchase order details are invalid",
        issues: validationIssues(result.error),
      });
    }
    try {
      const order = await createPurchaseOrder({
        ...result.data,
        approver: req.user.name,
        role: req.user.role,
      });
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof UnknownMaterialError) {
        return res.status(400).json({
          error: "Purchase order details are invalid",
          issues: [{ field: "items", message: error.message }],
        });
      }
      console.error("Purchase order create API error", error);
      res.status(500).json({ error: "The purchase order could not be created" });
    }
  },
);

function approvalAction(handler) {
  return async (req, res) => {
    try {
      const order = await handler(req.params.poId, {
        approver: req.user.name,
        role: req.user.role,
      });
      if (!order) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Purchase order action API error", error);
      res.status(500).json({ error: "The purchase order could not be updated" });
    }
  };
}

purchaseOrdersRouter.post(
  "/:poId/approve",
  requirePermission("procurement:approve"),
  approvalAction(approvePurchaseOrder),
);

purchaseOrdersRouter.post(
  "/:poId/reject",
  requirePermission("procurement:approve"),
  (req, res) => {
    const result = approvalRemarksInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Remarks are required",
        issues: validationIssues(result.error),
      });
    }
    return approvalAction((poId, actor) =>
      rejectPurchaseOrder(poId, { ...actor, remarks: result.data.remarks }),
    )(req, res);
  },
);

purchaseOrdersRouter.post(
  "/:poId/send-back",
  requirePermission("procurement:approve"),
  (req, res) => {
    const result = approvalRemarksInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Remarks are required",
        issues: validationIssues(result.error),
      });
    }
    return approvalAction((poId, actor) =>
      sendBackPurchaseOrder(poId, { ...actor, remarks: result.data.remarks }),
    )(req, res);
  },
);

purchaseOrdersRouter.post(
  "/:poId/release",
  requirePermission("procurement:approve"),
  approvalAction(releasePurchaseOrder),
);

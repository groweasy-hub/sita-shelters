import { Router } from "express";
import { z } from "zod";

import { requirePermission } from "../middleware/require-permission.js";
import {
  approveGrnAsProjectManager,
  approveGrnAsSiteEngineer,
  confirmGrnReceipt,
  rejectGrn,
} from "../repositories/grn-workflow.js";
import {
  createInwardRecord,
  getInwardRecord,
  listAllInwardRecords,
  listInwardRecordsByPurchaseOrder,
  UnknownPurchaseOrderError,
} from "../repositories/inward.js";
import { registerWorkflowSteps } from "./workflow-steps.js";

export const inwardRouter = Router();

const identifierSchema = z.string().trim().min(1).max(128);
const inwardLineInputSchema = z.object({
  materialCode: identifierSchema,
  orderedQuantity: z.coerce.number().finite().nonnegative(),
  receivedQuantity: z.coerce.number().finite().nonnegative(),
  damagedQuantity: z.coerce.number().finite().nonnegative().default(0),
  missingQuantity: z.coerce.number().finite().nonnegative().default(0),
});
const createInwardInputSchema = z.object({
  purchaseOrderId: identifierSchema,
  vehicleNumber: z.string().trim().min(1).max(32),
  driverName: z.string().trim().min(1).max(120),
  transporterName: z.string().trim().min(1).max(160),
  invoiceNumber: z.string().trim().min(1).max(64),
  deliveryChallanNumber: z.string().trim().min(1).max(64),
  receivedAt: z.string().trim().min(1),
  lines: z.array(inwardLineInputSchema).min(1),
});

function validationIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

inwardRouter.get("/", requirePermission("inward:view"), async (req, res) => {
  try {
    res.json(await listAllInwardRecords());
  } catch (error) {
    console.error("Inward API error", error);
    res.status(500).json({ error: "The inward request could not be completed" });
  }
});

inwardRouter.get("/:inwardId", requirePermission("inward:view"), async (req, res) => {
  try {
    const record = await getInwardRecord(req.params.inwardId);
    if (!record) {
      return res.status(404).json({ error: "Inward record not found" });
    }
    res.json(record);
  } catch (error) {
    console.error("Inward detail API error", error);
    res.status(500).json({ error: "The inward request could not be completed" });
  }
});

inwardRouter.get(
  "/by-purchase-order/:purchaseOrderId",
  requirePermission("inward:view"),
  async (req, res) => {
    try {
      res.json(await listInwardRecordsByPurchaseOrder(req.params.purchaseOrderId));
    } catch (error) {
      console.error("Inward by-PO API error", error);
      res.status(500).json({ error: "The inward request could not be completed" });
    }
  },
);

inwardRouter.post("/", requirePermission("inward:manage"), async (req, res) => {
  const result = createInwardInputSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Inward details are invalid",
      issues: validationIssues(result.error),
    });
  }
  try {
    const record = await createInwardRecord({
      ...result.data,
      recordedById: req.user.id,
    });
    res.status(201).json(record);
  } catch (error) {
    if (error instanceof UnknownPurchaseOrderError) {
      return res.status(400).json({
        error: "Inward details are invalid",
        issues: [{ field: "purchaseOrderId", message: error.message }],
      });
    }
    console.error("Inward create API error", error);
    res.status(500).json({ error: "The inward record could not be created" });
  }
});

// GRN workflow: QC → Site Engineer → Project Manager (posts stock) → Store confirms.
registerWorkflowSteps(inwardRouter, {
  idParam: "inwardId",
  load: getInwardRecord,
  steps: {
    "approve-engineer": approveGrnAsSiteEngineer,
    "approve-manager": approveGrnAsProjectManager,
    "confirm-receipt": confirmGrnReceipt,
    reject: rejectGrn,
  },
});

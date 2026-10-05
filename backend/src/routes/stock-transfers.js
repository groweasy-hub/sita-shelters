import { Router } from "express";
import { z } from "zod";

import { requirePermission } from "../middleware/require-permission.js";
import { InsufficientStockError } from "../repositories/inventory.js";
import {
  approveStockTransfer,
  createStockTransfer,
  dispatchStockTransfer,
  getStockTransfer,
  InvalidTransferTransitionError,
  listAllStockTransfers,
  markTransferInTransit,
  markTransferReadyForDispatch,
  receiveStockTransfer,
  rejectStockTransfer,
  SameProjectTransferError,
  UnknownMaterialError,
} from "../repositories/stock-transfers.js";

export const stockTransfersRouter = Router();

const identifierSchema = z.string().trim().min(1).max(128);
const createTransferInputSchema = z.object({
  sourceProjectId: identifierSchema,
  destinationProjectId: identifierSchema,
  materialCode: identifierSchema,
  quantity: z.coerce.number().finite().positive(),
  remarks: z.string().trim().max(500).default(""),
});
const rejectInputSchema = z.object({
  rejectionReason: z.string().trim().min(1).max(500),
});
const dispatchInputSchema = z.object({
  vehicleNumber: z.string().trim().min(1).max(32),
});

function validationIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

function handleKnownErrors(error, res) {
  if (error instanceof UnknownMaterialError) {
    return res.status(400).json({
      error: "Transfer details are invalid",
      issues: [{ field: "materialCode", message: error.message }],
    });
  }
  if (error instanceof SameProjectTransferError) {
    return res.status(400).json({
      error: "Transfer details are invalid",
      issues: [{ field: "destinationProjectId", message: error.message }],
    });
  }
  if (error instanceof InvalidTransferTransitionError) {
    return res.status(409).json({ error: error.message });
  }
  if (error instanceof InsufficientStockError) {
    return res.status(409).json({ error: error.message });
  }
  return null;
}

stockTransfersRouter.get(
  "/",
  requirePermission("stock-transfers:view"),
  async (req, res) => {
    try {
      res.json(await listAllStockTransfers());
    } catch (error) {
      console.error("Stock transfers API error", error);
      res.status(500).json({ error: "The transfer request could not be completed" });
    }
  },
);

stockTransfersRouter.get(
  "/:transferId",
  requirePermission("stock-transfers:view"),
  async (req, res) => {
    try {
      const transfer = await getStockTransfer(req.params.transferId);
      if (!transfer) {
        return res.status(404).json({ error: "Transfer not found" });
      }
      res.json(transfer);
    } catch (error) {
      console.error("Stock transfer detail API error", error);
      res.status(500).json({ error: "The transfer request could not be completed" });
    }
  },
);

stockTransfersRouter.post(
  "/",
  requirePermission("stock-transfers:manage"),
  async (req, res) => {
    const result = createTransferInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Transfer details are invalid",
        issues: validationIssues(result.error),
      });
    }
    try {
      const transfer = await createStockTransfer({
        ...result.data,
        requestedById: req.user.id,
      });
      res.status(201).json(transfer);
    } catch (error) {
      if (handleKnownErrors(error, res)) return;
      console.error("Stock transfer create API error", error);
      res.status(500).json({ error: "The transfer could not be created" });
    }
  },
);

function transitionRoute(path, permission, handler) {
  stockTransfersRouter.post(path, requirePermission(permission), async (req, res) => {
    try {
      const transfer = await handler(req);
      if (!transfer) {
        return res.status(404).json({ error: "Transfer not found" });
      }
      res.json(transfer);
    } catch (error) {
      if (handleKnownErrors(error, res)) return;
      console.error("Stock transfer action API error", error);
      res.status(500).json({ error: "The transfer could not be updated" });
    }
  });
}

transitionRoute("/:transferId/approve", "stock-transfers:approve", (req) =>
  approveStockTransfer(req.params.transferId, req.user.id),
);

stockTransfersRouter.post(
  "/:transferId/reject",
  requirePermission("stock-transfers:approve"),
  async (req, res) => {
    const result = rejectInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "A rejection reason is required",
        issues: validationIssues(result.error),
      });
    }
    try {
      const transfer = await rejectStockTransfer(req.params.transferId, {
        approvedById: req.user.id,
        rejectionReason: result.data.rejectionReason,
      });
      if (!transfer) {
        return res.status(404).json({ error: "Transfer not found" });
      }
      res.json(transfer);
    } catch (error) {
      if (handleKnownErrors(error, res)) return;
      console.error("Stock transfer reject API error", error);
      res.status(500).json({ error: "The transfer could not be rejected" });
    }
  },
);

transitionRoute(
  "/:transferId/ready-for-dispatch",
  "stock-transfers:manage",
  (req) => markTransferReadyForDispatch(req.params.transferId),
);

stockTransfersRouter.post(
  "/:transferId/dispatch",
  requirePermission("stock-transfers:manage"),
  async (req, res) => {
    const result = dispatchInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "A vehicle number is required",
        issues: validationIssues(result.error),
      });
    }
    try {
      const transfer = await dispatchStockTransfer(req.params.transferId, result.data);
      if (!transfer) {
        return res.status(404).json({ error: "Transfer not found" });
      }
      res.json(transfer);
    } catch (error) {
      if (handleKnownErrors(error, res)) return;
      console.error("Stock transfer dispatch API error", error);
      res.status(500).json({ error: "The transfer could not be dispatched" });
    }
  },
);

transitionRoute("/:transferId/in-transit", "stock-transfers:manage", (req) =>
  markTransferInTransit(req.params.transferId),
);

transitionRoute("/:transferId/receive", "stock-transfers:manage", (req) =>
  receiveStockTransfer(req.params.transferId),
);

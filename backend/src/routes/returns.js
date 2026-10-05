import { Router } from "express";
import { z } from "zod";

import { requirePermission } from "../middleware/require-permission.js";
import {
  createReturn,
  ExcessQuantityError,
  getReturn,
  inspectReturn,
  listAllReturns,
  completeReturnRefund,
  listVendorReturns,
  receiveReturnReplacement,
  RefundNotAllowedError,
  ReplacementNotAllowedError,
  ReplacementQuantityError,
  resolveReturn,
  ReturnNothingToResolveError,
  UnknownMaterialIssueError,
} from "../repositories/returns.js";

export const returnsRouter = Router();

const identifierSchema = z.string().trim().min(1).max(128);
const createReturnInputSchema = z.object({
  materialIssueId: identifierSchema,
  returningQuantity: z.coerce.number().finite().positive(),
  reason: z.enum([
    "work-completed",
    "excess-material",
    "change-in-plan",
    "unused-material",
  ]),
});
const inspectInputSchema = z
  .object({
    goodQuantity: z.coerce.number().finite().nonnegative(),
    damagedQuantity: z.coerce.number().finite().nonnegative(),
    remarks: z.string().trim().min(1).max(500),
  })
  .refine((input) => input.goodQuantity + input.damagedQuantity > 0, {
    message: "Enter at least one non-zero quantity",
    path: ["goodQuantity"],
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

returnsRouter.get("/", requirePermission("returns:view"), async (req, res) => {
  try {
    res.json(await listAllReturns());
  } catch (error) {
    console.error("Returns API error", error);
    res.status(500).json({ error: "The return request could not be completed" });
  }
});

// Registered before "/:returnId" so "vendor" isn't read as a return id.
returnsRouter.get("/vendor", requirePermission("returns:view"), async (req, res) => {
  try {
    res.json(await listVendorReturns());
  } catch (error) {
    console.error("Vendor returns API error", error);
    res.status(500).json({ error: "The return request could not be completed" });
  }
});

returnsRouter.get("/:returnId", requirePermission("returns:view"), async (req, res) => {
  try {
    const record = await getReturn(req.params.returnId);
    if (!record) {
      return res.status(404).json({ error: "Return not found" });
    }
    res.json(record);
  } catch (error) {
    console.error("Return detail API error", error);
    res.status(500).json({ error: "The return request could not be completed" });
  }
});

returnsRouter.post("/", requirePermission("returns:manage"), async (req, res) => {
  const result = createReturnInputSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Return details are invalid",
      issues: validationIssues(result.error),
    });
  }
  try {
    const record = await createReturn({
      ...result.data,
      returnedById: req.user.id,
    });
    res.status(201).json(record);
  } catch (error) {
    if (error instanceof UnknownMaterialIssueError) {
      return res.status(400).json({
        error: "Return details are invalid",
        issues: [{ field: "materialIssueId", message: error.message }],
      });
    }
    if (error instanceof ExcessQuantityError) {
      return res.status(400).json({
        error: "Return details are invalid",
        issues: [{ field: "returningQuantity", message: error.message }],
      });
    }
    console.error("Return create API error", error);
    res.status(500).json({ error: "The return could not be logged" });
  }
});

returnsRouter.post(
  "/:returnId/inspect",
  requirePermission("returns:manage"),
  async (req, res) => {
    const result = inspectInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Inspection details are invalid",
        issues: validationIssues(result.error),
      });
    }
    try {
      const record = await inspectReturn(req.params.returnId, {
        ...result.data,
        inspectedById: req.user.id,
      });
      if (!record) {
        return res.status(404).json({ error: "Return not found" });
      }
      res.json(record);
    } catch (error) {
      console.error("Return inspect API error", error);
      res.status(500).json({ error: "The inspection could not be recorded" });
    }
  },
);

returnsRouter.post(
  "/:returnId/resolve",
  requirePermission("returns:manage"),
  async (req, res) => {
    const result = resolveInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Resolution details are invalid",
        issues: validationIssues(result.error),
      });
    }
    try {
      const record = await resolveReturn(req.params.returnId, {
        ...result.data,
        resolvedById: req.user.id,
      });
      if (!record) {
        return res.status(404).json({ error: "Return not found" });
      }
      res.json(record);
    } catch (error) {
      if (error instanceof ReturnNothingToResolveError) {
        return res.status(409).json({
          error: "Resolution details are invalid",
          issues: [{ field: "returnId", message: error.message }],
        });
      }
      if (error instanceof ReplacementQuantityError) {
        return res.status(400).json({
          error: "Resolution details are invalid",
          issues: [{ field: "quantity", message: error.message }],
        });
      }
      console.error("Return resolve API error", error);
      res.status(500).json({ error: "The resolution could not be recorded" });
    }
  },
);

returnsRouter.post(
  "/:returnId/replacements",
  requirePermission("returns:manage"),
  async (req, res) => {
    const result = receiveInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Replacement details are invalid",
        issues: validationIssues(result.error),
      });
    }
    try {
      const record = await receiveReturnReplacement(req.params.returnId, {
        ...result.data,
        receivedById: req.user.id,
      });
      if (!record) {
        return res.status(404).json({ error: "Return not found" });
      }
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof ReplacementNotAllowedError) {
        return res.status(409).json({
          error: "Replacement details are invalid",
          issues: [{ field: "returnId", message: error.message }],
        });
      }
      if (error instanceof ReplacementQuantityError) {
        return res.status(400).json({
          error: "Replacement details are invalid",
          issues: [{ field: "quantity", message: error.message }],
        });
      }
      console.error("Return replacement API error", error);
      res.status(500).json({ error: "The replacement could not be recorded" });
    }
  },
);

returnsRouter.post(
  "/:returnId/refund-completed",
  requirePermission("returns:manage"),
  async (req, res) => {
    const result = refundCompletedInputSchema.safeParse(req.body ?? {});
    if (!result.success) {
      return res.status(400).json({
        error: "Refund details are invalid",
        issues: validationIssues(result.error),
      });
    }
    try {
      const record = await completeReturnRefund(req.params.returnId, {
        ...result.data,
        completedById: req.user.id,
      });
      if (!record) {
        return res.status(404).json({ error: "Return not found" });
      }
      res.json(record);
    } catch (error) {
      if (error instanceof RefundNotAllowedError) {
        return res.status(409).json({
          error: "Refund details are invalid",
          issues: [{ field: "returnId", message: error.message }],
        });
      }
      console.error("Return refund API error", error);
      res.status(500).json({ error: "The refund could not be recorded" });
    }
  },
);

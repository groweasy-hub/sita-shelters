import { Router } from "express";
import { z } from "zod";

import { requirePermission } from "../middleware/require-permission.js";
import {
  listBillingInvoices,
  updateBillingCharges,
} from "../repositories/billings.js";

export const billingsRouter = Router();

const amountSchema = z.coerce.number().finite().nonnegative().default(0);
const chargesInputSchema = z.object({
  transportationFee: amountSchema,
  labourCharges: amountSchema,
  otherCharges: amountSchema,
  taxPercent: z.coerce.number().finite().min(0).max(100).default(18),
});

billingsRouter.get("/", requirePermission("billing:view"), async (req, res) => {
  try {
    res.json(await listBillingInvoices());
  } catch (error) {
    console.error("Billings API error", error);
    res.status(500).json({ error: "The billing request could not be completed" });
  }
});

billingsRouter.patch(
  "/:invoiceId/charges",
  requirePermission("billing:view"),
  async (req, res) => {
    const result = chargesInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Billing charges are invalid" });
    }

    try {
      const adjustment = await updateBillingCharges(
        req.params.invoiceId,
        result.data,
        req.user.id,
      );
      if (!adjustment) {
        return res.status(404).json({ error: "Billing invoice not found" });
      }
      res.json(await listBillingInvoices());
    } catch (error) {
      console.error("Billing charges API error", error);
      res
        .status(500)
        .json({ error: "The billing charges could not be updated" });
    }
  },
);

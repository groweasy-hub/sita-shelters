import { Router } from "express";

import { requirePermission } from "../middleware/require-permission.js";
import {
  getPurchaseRequest,
  listAllPurchaseRequests,
} from "../repositories/procurement.js";

export const procurementRequestsRouter = Router();

procurementRequestsRouter.get(
  "/",
  requirePermission("procurement:view"),
  async (req, res) => {
    try {
      res.json(await listAllPurchaseRequests());
    } catch (error) {
      console.error("Procurement requests API error", error);
      res
        .status(500)
        .json({ error: "The procurement request list could not be completed" });
    }
  },
);

procurementRequestsRouter.get(
  "/:requestId",
  requirePermission("procurement:view"),
  async (req, res) => {
    try {
      const request = await getPurchaseRequest(req.params.requestId);
      if (!request) {
        return res.status(404).json({ error: "Procurement request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Procurement request detail API error", error);
      res
        .status(500)
        .json({ error: "The procurement request could not be completed" });
    }
  },
);

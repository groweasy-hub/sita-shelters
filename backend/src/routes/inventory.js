import { Router } from "express";

import { requirePermission } from "../middleware/require-permission.js";
import {
  getSiteStockRegister,
  listDamagedStock,
  listSiteStockBalances,
  listStockLedger,
} from "../repositories/inventory.js";

export const inventoryRouter = Router();

inventoryRouter.get("/", requirePermission("inventory:view"), async (req, res) => {
  try {
    const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
    res.json(await listSiteStockBalances(projectId));
  } catch (error) {
    console.error("Inventory API error", error);
    res.status(500).json({ error: "The inventory request could not be completed" });
  }
});

inventoryRouter.get(
  "/ledger",
  requirePermission("inventory:view"),
  async (req, res) => {
    try {
      const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
      res.json(await listStockLedger(projectId));
    } catch (error) {
      console.error("Inventory ledger API error", error);
      res.status(500).json({ error: "The ledger request could not be completed" });
    }
  },
);

inventoryRouter.get(
  "/site-stock-register",
  requirePermission("inventory:view"),
  async (req, res) => {
    try {
      const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
      res.json(await getSiteStockRegister(projectId));
    } catch (error) {
      console.error("Site stock register API error", error);
      res.status(500).json({ error: "The stock register request could not be completed" });
    }
  },
);

inventoryRouter.get(
  "/damaged",
  requirePermission("inventory:view"),
  async (req, res) => {
    try {
      const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
      res.json(await listDamagedStock(projectId));
    } catch (error) {
      console.error("Damaged stock API error", error);
      res.status(500).json({ error: "The damaged stock request could not be completed" });
    }
  },
);

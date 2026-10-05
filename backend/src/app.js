import cors from "cors";
import express from "express";

import { FRONTEND_ORIGINS, TRUST_PROXY_HOPS } from "./config.js";
import { administrationUsersRouter } from "./routes/administration-users.js";
import { authRouter } from "./routes/auth.js";
import { billingsRouter } from "./routes/billings.js";
import { consumptionRouter } from "./routes/consumption.js";
import { indentsRouter } from "./routes/indents.js";
import { inventoryRouter } from "./routes/inventory.js";
import { inwardRouter } from "./routes/inward.js";
import { materialIssuesRouter } from "./routes/material-issues.js";
import { materialsRouter } from "./routes/materials.js";
import { procurementRequestsRouter } from "./routes/procurement-requests.js";
import { projectsRouter } from "./routes/projects.js";
import { purchaseOrdersRouter } from "./routes/purchase-orders.js";
import { qualityControlRouter } from "./routes/quality-control.js";
import { quotationsRouter } from "./routes/quotations.js";
import { replacementsRouter } from "./routes/replacements.js";
import { returnsRouter } from "./routes/returns.js";
import { stockTransfersRouter } from "./routes/stock-transfers.js";
import { vendorsRouter } from "./routes/vendors.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", TRUST_PROXY_HOPS);

  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin/non-browser requests (curl, health checks) send no
        // Origin header at all — allow those through.
        if (!origin || FRONTEND_ORIGINS.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRouter);
  app.use("/api/indents", indentsRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/materials", materialsRouter);
  app.use("/api/billings", billingsRouter);
  app.use("/api/inward", inwardRouter);
  app.use("/api/quality-control", qualityControlRouter);
  app.use("/api/material-issues", materialIssuesRouter);
  app.use("/api/consumption", consumptionRouter);
  app.use("/api/returns", returnsRouter);
  app.use("/api/replacements", replacementsRouter);
  app.use("/api/inventory", inventoryRouter);
  app.use("/api/procurement/requests", procurementRequestsRouter);
  app.use("/api/procurement/quotations", quotationsRouter);
  app.use("/api/procurement/purchase-orders", purchaseOrdersRouter);
  app.use("/api/stock-transfers", stockTransfersRouter);
  app.use("/api/vendors", vendorsRouter);
  app.use("/api/administration/users", administrationUsersRouter);

  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Express only treats a 4-arg function as an error handler; `next` must
  // stay in the signature even though this handler never calls it.
  app.use((error, req, res, next) => {
    if (error?.message === "Not allowed by CORS") {
      return res.status(403).json({ error: "Origin not allowed" });
    }
    console.error("Unhandled API error", error);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

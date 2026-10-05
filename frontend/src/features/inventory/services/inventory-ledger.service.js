import { apiClient } from "@/lib/api-client";

export function listInventoryLedger(projectId) {
  return apiClient.get("/api/inventory/ledger", {
    query: projectId ? { projectId } : undefined,
  });
}

/**
 * Site Stock Register: Opening + Inward - Issued + Transfer = Current Stock.
 * Computed server-side from the real stock ledger (see
 * `backend/src/repositories/inventory.js`).
 */
export function getSiteStockRegister(projectId) {
  return apiClient.get("/api/inventory/site-stock-register", {
    query: projectId ? { projectId } : undefined,
  });
}

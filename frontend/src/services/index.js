export { createFetchHttpClient, HttpError } from "./http-client";

/**
 * The single fetch boundary for the app. Its base URL comes from
 * `NEXT_PUBLIC_API_URL` (see .env.example) and nowhere else — when that
 * variable is unset it falls back to the same-origin `/api` proxy, never to
 * a hardcoded backend host.
 */
export { apiClient } from "@/lib/api-client";

// Every feature's API surface, re-exported from one place so callers don't
// need to know which feature owns which service.
export { fetchCurrentSession, login, logout } from "@/features/auth/services/auth.service";
export { administrationUsersService } from "@/features/administration/services/administration.service";
export { consumptionService } from "@/features/consumption/services/consumption.service";
export { damagedStockService } from "@/features/damaged-stock/services/damaged-stock.service";
export { indentsService } from "@/features/indents/services/indents.service";
export {
  getSiteStockRegister,
  listInventoryLedger,
} from "@/features/inventory/services/inventory-ledger.service";
export { recordStockUsage } from "@/features/inventory/services/inventory-usage.service";
export { inventoryService } from "@/features/inventory/services/inventory.service";
export { inwardService } from "@/features/inward/services/inward.service";
export {
  confirmIssueConsumption,
  listPendingConsumption,
} from "@/features/material-issues/services/material-issue-consumption.service";
export { materialIssuesService } from "@/features/material-issues/services/material-issues.service";
export { materialsService } from "@/features/materials/services/materials.service";
export { purchaseOrdersService } from "@/features/procurement/services/purchase-orders.service";
export { purchaseRequestsService } from "@/features/procurement/services/purchase-requests.service";
export { quotationsService } from "@/features/procurement/services/quotations.service";
export {
  enrichCurrentUser,
  getCurrentUserAccessSummary,
  getCurrentUserProjectAssignments,
  profileService,
} from "@/features/profile/services/profile.service";
export { projectsService } from "@/features/projects/services/projects.service";
export { qualityControlService } from "@/features/quality-control/services/quality-control.service";
export {
  listAssignmentsForResource,
  listResourceAssignments,
} from "@/features/resources/services/resource-assignments.service";
export {
  listMaintenanceForResource,
  listResourceMaintenanceRecords,
} from "@/features/resources/services/resource-maintenance.service";
export { resourcesService } from "@/features/resources/services/resources.service";
export { returnsService } from "@/features/returns/services/returns.service";
export { stockTransfersService } from "@/features/stock-transfers/services/stock-transfers.service";
export { vendorsService } from "@/features/vendors/services/vendors.service";

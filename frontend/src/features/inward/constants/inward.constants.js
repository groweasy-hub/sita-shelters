import { TABLE_DEFAULTS } from "@/config/constants";
import { getStatusConfig } from "@/config/status";

/**
 * `partially-accepted` is not in the centralized status vocabulary; it is
 * rendered through `StatusBadge`'s graceful unknown-status fallback rather
 * than by editing `src/config/status.js`.
 */
export const INWARD_STATUS_VALUES = [
  "pending-qc",
  "under-inspection",
  "accepted",
  "rejected",
  "partially-accepted",
];
export const INWARD_STATUS_OPTIONS = INWARD_STATUS_VALUES.map((value) => ({
  value,
  label: getStatusConfig(value).label,
}));
/**
 * Where a GRN is in its workflow: QC → Site Engineer → Project Manager (posts
 * stock) → Store Manager confirms → ready to use.
 */
export const INWARD_STAGE_VALUES = [
  "awaiting-qc",
  "pending-engineer-approval",
  "pending-manager-approval",
  "pending-store-confirmation",
  "received",
  "rejected",
  "closed",
];
export const INWARD_SORT_FIELDS = [
  "id",
  "purchaseOrderId",
  "projectId",
  "receivedAt",
  "status",
];
export const INWARD_PAGE_SIZE_OPTIONS = TABLE_DEFAULTS.pageSizeOptions;
export const INWARD_DEFAULT_LIST_PARAMS = {
  projectId: null,
  status: null,
  search: "",
  page: TABLE_DEFAULTS.page,
  pageSize: TABLE_DEFAULTS.pageSize,
  sortBy: "receivedAt",
  sortDirection: "desc",
};
export const inwardQueryKeys = {
  all: ["inward"],
  lists: () => [...inwardQueryKeys.all, "list"],
  list: (params) => [...inwardQueryKeys.lists(), params],
  details: () => [...inwardQueryKeys.all, "detail"],
  detail: (inwardId) => [...inwardQueryKeys.details(), inwardId],
  byPurchaseOrder: (purchaseOrderId) => [
    ...inwardQueryKeys.all,
    "by-purchase-order",
    purchaseOrderId,
  ],
};

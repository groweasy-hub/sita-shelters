import { TABLE_DEFAULTS } from "@/config/constants";
import { getStatusConfig } from "@/config/status";
export const INVENTORY_STATUS_VALUES = [
  "available",
  "reserved",
  "low-stock",
  "damaged",
  "under-inspection",
  "in-transit",
];
export const INVENTORY_STATUS_OPTIONS = INVENTORY_STATUS_VALUES.map(
  (value) => ({
    value,
    label: getStatusConfig(value).label,
  }),
);
export const INVENTORY_SORT_FIELDS = [
  "materialCode",
  "materialName",
  "category",
  "projectName",
  "availableQuantity",
  "reservedQuantity",
  "reorderLevel",
  "status",
  "updatedAt",
];
export const INVENTORY_PAGE_SIZE_OPTIONS = TABLE_DEFAULTS.pageSizeOptions;
export const INVENTORY_DEFAULT_LIST_PARAMS = {
  projectId: null,
  search: "",
  statuses: [],
  page: TABLE_DEFAULTS.page,
  pageSize: TABLE_DEFAULTS.pageSize,
  sortBy: "materialName",
  sortDirection: "asc",
};
export const inventoryQueryKeys = {
  all: ["inventory"],
  lists: () => [...inventoryQueryKeys.all, "list"],
  list: (params) => [...inventoryQueryKeys.lists(), params],
  details: () => [...inventoryQueryKeys.all, "detail"],
  detail: (inventoryItemId) => [
    ...inventoryQueryKeys.details(),
    inventoryItemId,
  ],
};

import { TABLE_DEFAULTS } from "@/config/constants";
import { getStatusConfig } from "@/config/status";

/**
 * Resources are reusable physical assets — machinery, equipment, water
 * tankers, tools, scaffolding and vehicles — that move between projects
 * repeatedly without being consumed. This is distinct from the `materials`
 * and `inventory` features, which track consumable stock.
 */
export const RESOURCE_CATEGORY_VALUES = [
  "machinery",
  "equipment",
  "water-tanker",
  "tool",
  "scaffolding",
  "vehicle",
];
const RESOURCE_CATEGORY_LABELS = {
  machinery: "Machinery",
  equipment: "Equipment",
  "water-tanker": "Water Tanker",
  tool: "Tool",
  scaffolding: "Scaffolding",
  vehicle: "Vehicle",
};
export const RESOURCE_CATEGORY_OPTIONS = RESOURCE_CATEGORY_VALUES.map(
  (value) => ({
    value,
    label: RESOURCE_CATEGORY_LABELS[value],
  }),
);
export function getResourceCategoryLabel(category) {
  return RESOURCE_CATEGORY_LABELS[category] ?? category;
}

/** The full resource status vocabulary already lives in `config/status.js`. */
export const RESOURCE_STATUS_VALUES = [
  "available",
  "assigned",
  "in-use",
  "under-maintenance",
  "unavailable",
];
export const RESOURCE_STATUS_OPTIONS = RESOURCE_STATUS_VALUES.map(
  (value) => ({
    value,
    label: getStatusConfig(value).label,
  }),
);
export const RESOURCE_SORT_FIELDS = [
  "id",
  "name",
  "category",
  "status",
  "assignedSince",
  "nextMaintenanceDueDate",
  "dailyRentalCost",
];
export const RESOURCE_PAGE_SIZE_OPTIONS = TABLE_DEFAULTS.pageSizeOptions;
export const RESOURCE_DEFAULT_LIST_PARAMS = {
  category: null,
  status: null,
  projectId: null,
  search: "",
  page: TABLE_DEFAULTS.page,
  pageSize: TABLE_DEFAULTS.pageSize,
  sortBy: "name",
  sortDirection: "asc",
};
export const resourcesQueryKeys = {
  all: ["resources"],
  lists: () => [...resourcesQueryKeys.all, "list"],
  list: (params) => [...resourcesQueryKeys.lists(), params],
  details: () => [...resourcesQueryKeys.all, "detail"],
  detail: (resourceId) => [...resourcesQueryKeys.details(), resourceId],
};

/** Assignment history: which project a resource was deployed to, and when. */
export const resourceAssignmentsQueryKeys = {
  all: ["resource-assignments"],
};

/** Maintenance log: scheduled service, breakdown repair and inspection events. */
export const MAINTENANCE_TYPE_VALUES = ["scheduled", "breakdown", "inspection"];
const MAINTENANCE_TYPE_LABELS = {
  scheduled: "Scheduled service",
  breakdown: "Breakdown repair",
  inspection: "Inspection",
};
export const MAINTENANCE_TYPE_OPTIONS = MAINTENANCE_TYPE_VALUES.map(
  (value) => ({
    value,
    label: MAINTENANCE_TYPE_LABELS[value],
  }),
);
export function getMaintenanceTypeLabel(type) {
  return MAINTENANCE_TYPE_LABELS[type] ?? type;
}
/**
 * `completed` is already defined in `config/status.js`. `in-progress` is too.
 * `scheduled` is not yet a known status key there, so `getStatusConfig` falls
 * back to a neutral-tone badge with a humanized "Scheduled" label.
 */
export const MAINTENANCE_STATUS_VALUES = [
  "completed",
  "in-progress",
  "scheduled",
];
export const MAINTENANCE_STATUS_OPTIONS = MAINTENANCE_STATUS_VALUES.map(
  (value) => ({
    value,
    label: getStatusConfig(value).label,
  }),
);
export const resourceMaintenanceQueryKeys = {
  all: ["resource-maintenance"],
};

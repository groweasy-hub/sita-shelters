import { TABLE_DEFAULTS } from "@/config/constants";
import { getStatusConfig } from "@/config/status";

export const RETURN_REASON_VALUES = [
  "work-completed",
  "excess-material",
  "change-in-plan",
  "unused-material",
];
export const RETURN_REASON_OPTIONS = [
  { value: "work-completed", label: "Work Completed" },
  { value: "excess-material", label: "Excess Material" },
  { value: "change-in-plan", label: "Change in Plan" },
  { value: "unused-material", label: "Unused Material" },
];
export const RETURN_INSPECTION_STATUS_VALUES = [
  "pending-inspection",
  "good",
  "damaged",
];
export const RETURN_INSPECTION_STATUS_OPTIONS =
  RETURN_INSPECTION_STATUS_VALUES.map((value) => ({
    value,
    label: getStatusConfig(value).label,
  }));
export const RETURN_SORT_FIELDS = [
  "id",
  "projectName",
  "materialName",
  "returningQuantity",
  "inspectionStatus",
  "returnedAt",
];
export const RETURN_PAGE_SIZE_OPTIONS = TABLE_DEFAULTS.pageSizeOptions;
export const RETURN_DEFAULT_LIST_PARAMS = {
  projectId: null,
  search: "",
  inspectionStatus: null,
  reason: null,
  page: TABLE_DEFAULTS.page,
  pageSize: TABLE_DEFAULTS.pageSize,
  sortBy: "returnedAt",
  sortDirection: "desc",
};
export const returnsQueryKeys = {
  all: ["returns"],
  lists: () => [...returnsQueryKeys.all, "list"],
  list: (params) => [...returnsQueryKeys.lists(), params],
  details: () => [...returnsQueryKeys.all, "detail"],
  detail: (returnId) => [...returnsQueryKeys.details(), returnId],
};

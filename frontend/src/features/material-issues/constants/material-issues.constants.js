import { TABLE_DEFAULTS } from "@/config/constants";
import { getStatusConfig } from "@/config/status";

export const MATERIAL_ISSUE_STATUS_VALUES = [
  "issued",
  "partially-consumed",
  "consumed",
  "returned",
];
export const MATERIAL_ISSUE_STATUS_OPTIONS = MATERIAL_ISSUE_STATUS_VALUES.map(
  (value) => ({
    value,
    label: getStatusConfig(value).label,
  }),
);
export const MATERIAL_ISSUE_DEPARTMENT_VALUES = [
  "civil",
  "electrical",
  "plumbing",
  "fire-safety",
  "finishing",
  "equipment",
];
export const MATERIAL_ISSUE_DEPARTMENT_OPTIONS = [
  { value: "civil", label: "Civil" },
  { value: "electrical", label: "Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "fire-safety", label: "Fire & Safety" },
  { value: "finishing", label: "Finishing" },
  { value: "equipment", label: "Equipment" },
];
export const MATERIAL_ISSUE_SORT_FIELDS = [
  "id",
  "projectName",
  "materialName",
  "issuedQuantity",
  "consumedQuantity",
  "remainingQuantity",
  "status",
  "issuedAt",
];
export const MATERIAL_ISSUE_PAGE_SIZE_OPTIONS = TABLE_DEFAULTS.pageSizeOptions;
export const MATERIAL_ISSUE_DEFAULT_LIST_PARAMS = {
  projectId: null,
  search: "",
  status: null,
  department: null,
  page: TABLE_DEFAULTS.page,
  pageSize: TABLE_DEFAULTS.pageSize,
  sortBy: "issuedAt",
  sortDirection: "desc",
};
export const materialIssuesQueryKeys = {
  all: ["material-issues"],
  lists: () => [...materialIssuesQueryKeys.all, "list"],
  list: (params) => [...materialIssuesQueryKeys.lists(), params],
  details: () => [...materialIssuesQueryKeys.all, "detail"],
  detail: (issueId) => [...materialIssuesQueryKeys.details(), issueId],
};

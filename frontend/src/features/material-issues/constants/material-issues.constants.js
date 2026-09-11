import { TABLE_DEFAULTS } from "@/config/constants";
import { getStatusConfig } from "@/config/status";
import { MATERIAL_CATEGORY_OPTIONS } from "@/lib/mock-data/material-categories";

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
export const MATERIAL_ISSUE_DEPARTMENT_VALUES =
  MATERIAL_CATEGORY_OPTIONS.map((category) => category.id);
export const MATERIAL_ISSUE_DEPARTMENT_OPTIONS =
  MATERIAL_CATEGORY_OPTIONS.map((category) => ({
    value: category.id,
    label: category.name,
  }));
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

import { TABLE_DEFAULTS } from "@/config/constants";
import { getStatusConfig } from "@/config/status";

export const QC_STATUS_VALUES = [
  "pending-inspection",
  "under-inspection",
  "accepted",
  "rejected",
];
export const QC_STATUS_OPTIONS = QC_STATUS_VALUES.map((value) => ({
  value,
  label: getStatusConfig(value).label,
}));
export const QC_SORT_FIELDS = [
  "id",
  "inwardId",
  "projectId",
  "materialName",
  "status",
  "inspectedAt",
];
export const QC_PAGE_SIZE_OPTIONS = TABLE_DEFAULTS.pageSizeOptions;
export const QC_DEFAULT_LIST_PARAMS = {
  projectId: null,
  status: null,
  search: "",
  page: TABLE_DEFAULTS.page,
  pageSize: TABLE_DEFAULTS.pageSize,
  sortBy: "id",
  sortDirection: "asc",
};
export const qualityControlQueryKeys = {
  all: ["quality-control"],
  lists: () => [...qualityControlQueryKeys.all, "list"],
  list: (params) => [...qualityControlQueryKeys.lists(), params],
  details: () => [...qualityControlQueryKeys.all, "detail"],
  detail: (qcId) => [...qualityControlQueryKeys.details(), qcId],
  byInward: (inwardId) => [...qualityControlQueryKeys.all, "by-inward", inwardId],
};

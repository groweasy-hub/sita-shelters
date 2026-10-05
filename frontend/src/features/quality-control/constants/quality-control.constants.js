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
/** The checks an inspector works through before accepting or rejecting a delivery. */
export const QC_CHECKLIST_ITEMS = [
  { key: "quantity", label: "Quantity matches the delivery challan and purchase order" },
  { key: "specification", label: "Material grade / specification matches the order" },
  { key: "condition", label: "No visible damage, defects or contamination" },
  { key: "packaging", label: "Packaging and labelling intact" },
  { key: "documents", label: "Test certificate and invoice documents received" },
];
export const QC_CHECK_RESULT_OPTIONS = [
  { value: "pass", label: "Pass" },
  { value: "fail", label: "Fail" },
  { value: "na", label: "N/A" },
];
export const QC_RESOLUTION_TYPE_VALUES = ["replace", "refund"];
export const QC_RESOLUTION_TYPE_OPTIONS = [
  { value: "replace", label: "Vendor to replace" },
  { value: "refund", label: "Vendor to refund" },
];
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

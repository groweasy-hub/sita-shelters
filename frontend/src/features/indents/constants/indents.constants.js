import { TABLE_DEFAULTS } from "@/config/constants";
import { getStatusConfig } from "@/config/status";
import { MATERIAL_CATEGORY_TREE } from "@/lib/mock-data/material-categories";

export const INDENT_PRIORITY_VALUES = ["low", "medium", "high", "urgent"];
export const INDENT_PRIORITY_OPTIONS = INDENT_PRIORITY_VALUES.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));
export const INDENT_STATUS_VALUES = [
  "draft",
  "submitted",
  "under-review",
  "approved",
  "rejected",
  "partially-fulfilled",
  "completed",
];
export const INDENT_STATUS_OPTIONS = INDENT_STATUS_VALUES.map((value) => ({
  value,
  label: getStatusConfig(value).label,
}));
export const INDENT_SORT_FIELDS = [
  "id",
  "projectName",
  "priority",
  "status",
  "requiredDate",
  "createdAt",
];
export const INDENT_PAGE_SIZE_OPTIONS = TABLE_DEFAULTS.pageSizeOptions;
export const INDENT_DEFAULT_LIST_PARAMS = {
  projectId: null,
  status: null,
  priority: null,
  search: "",
  page: TABLE_DEFAULTS.page,
  pageSize: TABLE_DEFAULTS.pageSize,
  sortBy: "createdAt",
  sortDirection: "desc",
};
export const indentsQueryKeys = {
  all: ["indents"],
  lists: () => [...indentsQueryKeys.all, "list"],
  list: (params) => [...indentsQueryKeys.lists(), params],
  details: () => [...indentsQueryKeys.all, "detail"],
  detail: (indentId) => [...indentsQueryKeys.details(), indentId],
  timeline: (indentId) => [...indentsQueryKeys.all, "timeline", indentId],
};

/** Units offered when a requester types in an item that isn't in the catalogue yet. */
export const NEW_ITEM_UNIT_OPTIONS = [
  "bags",
  "m³",
  "MT",
  "kg",
  "SFT",
  "RFT",
  "CFT",
  "SQM",
  "CUM",
  "sheets",
  "nos",
  "pcs",
  "m",
  "lengths",
  "rolls",
  "bundles",
  "boxes",
  "drums",
  "loads",
  "trips",
  "litres",
  "sets",
];
/** Flat "Civil › Cement" list; the value is "<category>/<subcategory>". */
export const NEW_ITEM_CATEGORY_OPTIONS = MATERIAL_CATEGORY_TREE.flatMap(
  (category) =>
    category.subcategories.map((subcategory) => ({
      value: `${category.id}/${subcategory.id}`,
      label: `${category.name} › ${subcategory.name}`,
    })),
);
/** Sentinel option value in the material dropdown that switches a line to "new item". */
export const NEW_ITEM_OPTION_VALUE = "__new-item__";

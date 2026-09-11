import { TABLE_DEFAULTS } from "@/config/constants";
import { MATERIAL_CATEGORY_OPTIONS } from "@/lib/mock-data/material-categories";

export const MATERIAL_STATUS_VALUES = ["active", "inactive"];
export const MATERIAL_CATEGORY_FILTER_OPTIONS = MATERIAL_CATEGORY_OPTIONS;
export const MATERIAL_SORT_FIELDS = [
  "code",
  "name",
  "category",
  "unit",
  "reorderLevel",
  "lastPurchasePrice",
  "status",
];
export const MATERIAL_PAGE_SIZE_OPTIONS = TABLE_DEFAULTS.pageSizeOptions;
export const MATERIAL_DEFAULT_LIST_PARAMS = {
  category: null,
  search: "",
  page: TABLE_DEFAULTS.page,
  pageSize: TABLE_DEFAULTS.pageSize,
  sortBy: "name",
  sortDirection: "asc",
};
export const materialsQueryKeys = {
  all: ["materials"],
  lists: () => [...materialsQueryKeys.all, "list"],
  list: (params) => [...materialsQueryKeys.lists(), params],
  details: () => [...materialsQueryKeys.all, "detail"],
  detail: (materialId) => [...materialsQueryKeys.details(), materialId],
};

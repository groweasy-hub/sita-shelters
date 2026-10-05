import { TABLE_DEFAULTS } from "@/config/constants";
import { MATERIAL_CATEGORY_OPTIONS } from "@/lib/mock-data/material-categories";

export const CONSUMPTION_CATEGORY_OPTIONS = MATERIAL_CATEGORY_OPTIONS;
export const CONSUMPTION_SORT_FIELDS = [
  "id",
  "projectName",
  "materialName",
  "quantityConsumed",
  "consumedAt",
];
export const CONSUMPTION_PAGE_SIZE_OPTIONS = TABLE_DEFAULTS.pageSizeOptions;
export const CONSUMPTION_DEFAULT_LIST_PARAMS = {
  projectId: null,
  search: "",
  categoryId: null,
  page: TABLE_DEFAULTS.page,
  pageSize: TABLE_DEFAULTS.pageSize,
  sortBy: "consumedAt",
  sortDirection: "desc",
};
export const consumptionQueryKeys = {
  all: ["consumption"],
  lists: () => [...consumptionQueryKeys.all, "list"],
  list: (params) => [...consumptionQueryKeys.lists(), params],
  details: () => [...consumptionQueryKeys.all, "detail"],
  detail: (entryId) => [...consumptionQueryKeys.details(), entryId],
};

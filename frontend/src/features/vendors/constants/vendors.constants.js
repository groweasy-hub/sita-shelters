import { TABLE_DEFAULTS } from "@/config/constants";
import { MATERIAL_CATEGORY_OPTIONS } from "@/lib/mock-data/material-categories";

export const VENDOR_STATUS_VALUES = ["active", "under-review", "inactive"];
export const VENDOR_CATEGORY_OPTIONS = MATERIAL_CATEGORY_OPTIONS;
export const VENDOR_SORT_FIELDS = [
  "code",
  "name",
  "type",
  "rating",
  "deliveryPerformance",
  "status",
];
export const VENDOR_PAGE_SIZE_OPTIONS = TABLE_DEFAULTS.pageSizeOptions;
export const VENDOR_DEFAULT_LIST_PARAMS = {
  category: null,
  search: "",
  page: TABLE_DEFAULTS.page,
  pageSize: TABLE_DEFAULTS.pageSize,
  sortBy: "name",
  sortDirection: "asc",
};
export const vendorsQueryKeys = {
  all: ["vendors"],
  lists: () => [...vendorsQueryKeys.all, "list"],
  list: (params) => [...vendorsQueryKeys.lists(), params],
  details: () => [...vendorsQueryKeys.all, "detail"],
  detail: (vendorId) => [...vendorsQueryKeys.details(), vendorId],
};

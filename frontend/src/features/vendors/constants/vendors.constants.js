import { TABLE_DEFAULTS } from "@/config/constants";
import {
  MATERIAL_CATEGORY_OPTIONS,
  MATERIAL_CATEGORY_TREE,
} from "@/lib/mock-data/material-categories";

export const VENDOR_STATUS_VALUES = ["active", "under-review", "inactive"];
export const VENDOR_CATEGORY_OPTIONS = MATERIAL_CATEGORY_OPTIONS;

const PARENT_CATEGORY_BY_SUBCATEGORY = new Map(
  MATERIAL_CATEGORY_TREE.flatMap((category) =>
    category.subcategories.map((subcategory) => [subcategory.id, category.id]),
  ),
);
/**
 * A vendor's supply capability is a set of top-level categories (Civil,
 * Electrical, …). Older records were saved with subcategory ids ("cement"),
 * so those are folded into their parent category here.
 */
export function normalizeCapabilities(categoryIds = []) {
  return [
    ...new Set(
      categoryIds.map((id) => PARENT_CATEGORY_BY_SUBCATEGORY.get(id) ?? id),
    ),
  ];
}
export function capabilityNames(categoryIds = []) {
  return normalizeCapabilities(categoryIds).map(
    (id) => MATERIAL_CATEGORY_OPTIONS.find((option) => option.id === id)?.name ?? id,
  );
}
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

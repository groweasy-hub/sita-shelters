import { VENDORS } from "@/lib/mock-data/vendors";
import {
  vendorListParamsSchema,
  vendorListResultSchema,
  vendorSchema,
  vendorsSchema,
} from "../schemas/vendors.schema";

const mockVendors = vendorsSchema.parse(VENDORS);
function matchesSearch(vendor, search) {
  if (!search) return true;
  const haystack = [vendor.code, vendor.name, vendor.type, vendor.gstNumber]
    .join(" ")
    .toLocaleLowerCase();
  return haystack.includes(search.toLocaleLowerCase());
}
function compareVendors(first, second, field) {
  const firstValue = first[field];
  const secondValue = second[field];
  if (typeof firstValue === "number" && typeof secondValue === "number") {
    return firstValue - secondValue;
  }
  return String(firstValue).localeCompare(String(secondValue), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}
export const mockVendorsAdapter = {
  list(params, options) {
    options?.signal?.throwIfAborted();
    const filtered = mockVendors.filter(
      (vendor) =>
        (!params.category ||
          vendor.materialCategories.includes(params.category)) &&
        matchesSearch(vendor, params.search),
    );
    const direction = params.sortDirection === "asc" ? 1 : -1;
    const sorted = [...filtered].sort(
      (first, second) =>
        compareVendors(first, second, params.sortBy) * direction,
    );
    const start = (params.page - 1) * params.pageSize;
    return {
      items: sorted.slice(start, start + params.pageSize),
      total: sorted.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  },
  get(vendorId) {
    return mockVendors.find((vendor) => vendor.id === vendorId) ?? null;
  },
  listAll() {
    return mockVendors;
  },
};
export function createVendorsService(adapter) {
  return {
    list(params = {}, options = {}) {
      const normalizedParams = vendorListParamsSchema.parse(params);
      const result = adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return vendorListResultSchema.parse(result);
    },
    get(vendorId) {
      const vendor = adapter.get(vendorId);
      return vendor ? vendorSchema.parse(vendor) : null;
    },
    listAll() {
      return adapter.listAll();
    },
  };
}
export const vendorsService = createVendorsService(mockVendorsAdapter);

import { apiClient } from "@/lib/api-client";
import { VENDORS } from "@/lib/mock-data/vendors";
import { HttpError } from "@/services/http-client";
import { normalizeCapabilities } from "../constants/vendors.constants";
import {
  vendorCapabilitiesInputSchema,
  vendorCreateInputSchema,
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
  // Not-yet-rated vendors (null) sort below every rated one.
  const firstValue = first[field] ?? -1;
  const secondValue = second[field] ?? -1;
  if (typeof firstValue === "number" && typeof secondValue === "number") {
    return firstValue - secondValue;
  }
  return String(firstValue).localeCompare(String(secondValue), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}
function paginate(items, params) {
  const filtered = items.filter(
    (vendor) =>
      (!params.category ||
        normalizeCapabilities(vendor.materialCategories).includes(params.category)) &&
      matchesSearch(vendor, params.search),
  );
  const direction = params.sortDirection === "asc" ? 1 : -1;
  const sorted = [...filtered].sort(
    (first, second) => compareVendors(first, second, params.sortBy) * direction,
  );
  const start = (params.page - 1) * params.pageSize;
  return {
    items: sorted.slice(start, start + params.pageSize),
    total: sorted.length,
    page: params.page,
    pageSize: params.pageSize,
  };
}
/** Surfaces the server's own reason instead of a bare "Request failed with status 409". */
function toReadableError(error) {
  if (error instanceof HttpError) {
    const reason =
      error.body?.issues?.[0]?.message ??
      (typeof error.body?.error === "string" ? error.body.error : null);
    if (reason) {
      return new Error(reason, { cause: error });
    }
  }
  return error;
}
export const mockVendorsAdapter = {
  list(params, options) {
    options?.signal?.throwIfAborted();
    return paginate(mockVendors, params);
  },
  get(vendorId) {
    return mockVendors.find((vendor) => vendor.id === vendorId) ?? null;
  },
  listAll() {
    return mockVendors;
  },
};

/**
 * Browser-safe adapter for the durable vendors API. Filtering, sorting and
 * pagination run client-side over the full roster (same logic as
 * `mockVendorsAdapter`) since the roster is small; only `get` and `create`
 * hit their own endpoints.
 */
export const apiVendorsAdapter = {
  async list(params, options) {
    options?.signal?.throwIfAborted();
    const items = await apiClient.get("/api/vendors", { signal: options?.signal });
    return paginate(items, params);
  },
  async get(vendorId) {
    try {
      return await apiClient.get(`/api/vendors/${encodeURIComponent(vendorId)}`);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },
  listAll() {
    return apiClient.get("/api/vendors");
  },
  async create(input) {
    try {
      return await apiClient.post("/api/vendors", { body: input });
    } catch (error) {
      throw toReadableError(error);
    }
  },
  async updateCapabilities(vendorId, input) {
    try {
      return await apiClient.patch(`/api/vendors/${encodeURIComponent(vendorId)}`, {
        body: input,
      });
    } catch (error) {
      throw toReadableError(error);
    }
  },
};

export function createVendorsService(adapter) {
  return {
    async list(params = {}, options = {}) {
      const normalizedParams = vendorListParamsSchema.parse(params);
      const result = await adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return vendorListResultSchema.parse(result);
    },
    async get(vendorId) {
      const vendor = await adapter.get(vendorId);
      return vendor ? vendorSchema.parse(vendor) : null;
    },
    async listAll() {
      return adapter.listAll();
    },
    async create(input) {
      const normalized = vendorCreateInputSchema.parse(input);
      const vendor = await adapter.create(normalized);
      return vendorSchema.parse(vendor);
    },
    async updateCapabilities(vendorId, input) {
      const normalized = vendorCapabilitiesInputSchema.parse(input);
      const vendor = await adapter.updateCapabilities(vendorId, normalized);
      return vendorSchema.parse(vendor);
    },
  };
}
export const vendorsService = createVendorsService(apiVendorsAdapter);

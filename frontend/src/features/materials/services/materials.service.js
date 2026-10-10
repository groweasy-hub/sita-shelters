import { apiClient } from "@/lib/api-client";
import { MATERIALS } from "@/lib/mock-data/materials";
import { HttpError } from "@/services/http-client";
import {
  materialListParamsSchema,
  materialListResultSchema,
  materialCreateInputSchema,
  materialSchema,
  materialsSchema,
  materialVendorsSchema,
  materialUpdateInputSchema,
} from "../schemas/materials.schema";

const mockMaterials = materialsSchema.parse(
  MATERIALS.map((material) => ({
    ...material,
    status: material.status ?? "active",
  })),
);
function matchesSearch(material, search) {
  if (!search) return true;
  const haystack = [
    material.code,
    material.name,
    material.category,
    material.subcategory,
    material.unit,
  ]
    .join(" ")
    .toLocaleLowerCase();
  return haystack.includes(search.toLocaleLowerCase());
}
function compareMaterials(first, second, field) {
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
function paginate(items, params) {
  const filtered = items.filter(
    (material) =>
      (!params.category || material.category === params.category) &&
      matchesSearch(material, params.search),
  );
  const direction = params.sortDirection === "asc" ? 1 : -1;
  const sorted = [...filtered].sort(
    (first, second) =>
      compareMaterials(first, second, params.sortBy) * direction,
  );
  const start = (params.page - 1) * params.pageSize;
  return {
    items: sorted.slice(start, start + params.pageSize),
    total: sorted.length,
    page: params.page,
    pageSize: params.pageSize,
  };
}
export const mockMaterialsAdapter = {
  listVendors() {
    return [];
  },
  list(params, options) {
    options?.signal?.throwIfAborted();
    return paginate(mockMaterials, params);
  },
  get(materialId) {
    const material = mockMaterials.find(
      (candidate) =>
        candidate.id === materialId || candidate.code === materialId,
    );
    return material ?? null;
  },
  listAll() {
    return mockMaterials;
  },
};

/**
 * Browser-safe adapter for the durable materials API. Filtering, sorting
 * and pagination run client-side over the full catalogue (same logic as
 * `mockMaterialsAdapter`) since the catalogue is small; only `get` and
 * `create` hit their own endpoints.
 */
export const apiMaterialsAdapter = {
  async list(params, options) {
    options?.signal?.throwIfAborted();
    const items = await apiClient.get("/api/materials", { signal: options?.signal });
    return paginate(items, params);
  },
  async get(materialId) {
    try {
      return await apiClient.get(`/api/materials/${encodeURIComponent(materialId)}`);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },
  listAll() {
    return apiClient.get("/api/materials");
  },
  /** Approved vendors plus every vendor the material has actually been ordered from. */
  listVendors(materialId) {
    return apiClient.get(`/api/materials/${encodeURIComponent(materialId)}/vendors`);
  },
  create(input) {
    return apiClient.post("/api/materials", { body: input });
  },
  update(materialId, input) {
    return apiClient.patch(`/api/materials/${encodeURIComponent(materialId)}`, {
      body: input,
    });
  },
};

export function createMaterialsService(adapter) {
  return {
    async list(params = {}, options = {}) {
      const normalizedParams = materialListParamsSchema.parse(params);
      const result = await adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return materialListResultSchema.parse(result);
    },
    async get(materialId) {
      const material = await adapter.get(materialId);
      return material ? materialSchema.parse(material) : null;
    },
    async listAll() {
      return adapter.listAll();
    },
    async listVendors(materialId) {
      return materialVendorsSchema.parse(await adapter.listVendors(materialId));
    },
    async create(input) {
      const normalized = materialCreateInputSchema.parse(input);
      const material = await adapter.create(normalized);
      return materialSchema.parse(material);
    },
    async update(materialId, input) {
      const normalized = materialUpdateInputSchema.parse(input);
      const material = await adapter.update(materialId, normalized);
      return materialSchema.parse(material);
    },
  };
}
export const materialsService = createMaterialsService(apiMaterialsAdapter);

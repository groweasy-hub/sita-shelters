import { MATERIALS } from "@/lib/mock-data/materials";
import {
  materialListParamsSchema,
  materialListResultSchema,
  materialSchema,
  materialsSchema,
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
export const mockMaterialsAdapter = {
  list(params, options) {
    options?.signal?.throwIfAborted();
    const filtered = mockMaterials.filter(
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
export function createMaterialsService(adapter) {
  return {
    list(params = {}, options = {}) {
      const normalizedParams = materialListParamsSchema.parse(params);
      const result = adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return materialListResultSchema.parse(result);
    },
    get(materialId) {
      const material = adapter.get(materialId);
      return material ? materialSchema.parse(material) : null;
    },
    listAll() {
      return adapter.listAll();
    },
  };
}
export const materialsService = createMaterialsService(mockMaterialsAdapter);

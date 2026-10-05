import { apiClient } from "@/lib/api-client";
import {
  consumptionCreateInputSchema,
  consumptionEntrySchema,
  consumptionListParamsSchema,
  consumptionListResultSchema,
} from "../schemas/consumption.schema";

function compareEntries(first, second, field) {
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
function matchesSearch(item, search) {
  if (!search) return true;
  const searchableText = [
    item.id,
    item.materialIssueId,
    item.materialCode,
    item.materialName,
    item.projectName,
    item.activity,
    item.location,
    item.recordedByName,
  ]
    .join(" ")
    .toLocaleLowerCase();
  return searchableText.includes(search.toLocaleLowerCase());
}

function paginate(items, params) {
  const filteredItems = items.filter(
    (item) =>
      (params.projectId === null || item.projectId === params.projectId) &&
      (params.categoryId === null || item.categoryId === params.categoryId) &&
      matchesSearch(item, params.search),
  );
  const direction = params.sortDirection === "asc" ? 1 : -1;
  const sortedItems = [...filteredItems].sort(
    (first, second) => compareEntries(first, second, params.sortBy) * direction,
  );
  const start = (params.page - 1) * params.pageSize;
  return {
    items: sortedItems.slice(start, start + params.pageSize),
    total: sortedItems.length,
    page: params.page,
    pageSize: params.pageSize,
  };
}

/** Browser-safe adapter for the durable consumption API. */
export const apiConsumptionAdapter = {
  async list(params, options) {
    options?.signal?.throwIfAborted();
    const items = await apiClient.get("/api/consumption", {
      signal: options?.signal,
    });
    return paginate(items, params);
  },
  listAll() {
    return apiClient.get("/api/consumption");
  },
  create(input) {
    return apiClient.post("/api/consumption", { body: input });
  },
};

export function createConsumptionService(adapter) {
  return {
    async list(params = {}, options = {}) {
      const normalizedParams = consumptionListParamsSchema.parse(params);
      const result = await adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return consumptionListResultSchema.parse(result);
    },
    async listAll() {
      return adapter.listAll();
    },
    async create(input) {
      const normalized = consumptionCreateInputSchema.parse(input);
      const record = await adapter.create(normalized);
      return consumptionEntrySchema.parse(record);
    },
  };
}
export const consumptionService = createConsumptionService(
  apiConsumptionAdapter,
);

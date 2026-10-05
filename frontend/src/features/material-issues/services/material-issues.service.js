import { apiClient } from "@/lib/api-client";
import { HttpError } from "@/services/http-client";
import {
  materialIssueCreateInputSchema,
  materialIssueListParamsSchema,
  materialIssueListResultSchema,
  materialIssueSchema,
} from "../schemas/material-issues.schema";

function compareIssues(first, second, field) {
  if (field === "remainingQuantity") {
    const firstRemaining =
      first.issuedQuantity - first.consumedQuantity - first.returnedQuantity;
    const secondRemaining =
      second.issuedQuantity - second.consumedQuantity - second.returnedQuantity;
    return firstRemaining - secondRemaining;
  }
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
    item.materialCode,
    item.materialName,
    item.projectName,
    item.recipientName,
    item.purpose,
    item.workLocation,
    item.department,
    item.status.replaceAll("-", " "),
  ]
    .join(" ")
    .toLocaleLowerCase();
  return searchableText.includes(search.toLocaleLowerCase());
}

function paginate(items, params) {
  const filteredItems = items.filter(
    (item) =>
      (params.projectId === null || item.projectId === params.projectId) &&
      (params.status === null || item.status === params.status) &&
      (params.department === null || item.department === params.department) &&
      matchesSearch(item, params.search),
  );
  const direction = params.sortDirection === "asc" ? 1 : -1;
  const sortedItems = [...filteredItems].sort(
    (first, second) => compareIssues(first, second, params.sortBy) * direction,
  );
  const start = (params.page - 1) * params.pageSize;
  return {
    items: sortedItems.slice(start, start + params.pageSize),
    total: sortedItems.length,
    page: params.page,
    pageSize: params.pageSize,
  };
}

/** Browser-safe adapter for the durable material issues API. */
export const apiMaterialIssuesAdapter = {
  async list(params, options) {
    options?.signal?.throwIfAborted();
    const items = await apiClient.get("/api/material-issues", {
      signal: options?.signal,
    });
    return paginate(items, params);
  },
  async getById(issueId) {
    try {
      return await apiClient.get(
        `/api/material-issues/${encodeURIComponent(issueId)}`,
      );
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },
  listAll() {
    return apiClient.get("/api/material-issues");
  },
  create(input) {
    return apiClient.post("/api/material-issues", { body: input });
  },
};

export function createMaterialIssuesService(adapter) {
  return {
    async list(params = {}, options = {}) {
      const normalizedParams = materialIssueListParamsSchema.parse(params);
      const result = await adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return materialIssueListResultSchema.parse(result);
    },
    async listAll() {
      return adapter.listAll();
    },
    async getById(issueId) {
      return adapter.getById(issueId);
    },
    async create(input) {
      const normalized = materialIssueCreateInputSchema.parse(input);
      const record = await adapter.create(normalized);
      return materialIssueSchema.parse(record);
    },
  };
}
export const materialIssuesService = createMaterialIssuesService(
  apiMaterialIssuesAdapter,
);

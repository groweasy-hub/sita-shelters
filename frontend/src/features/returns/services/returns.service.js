import { apiClient } from "@/lib/api-client";
import { refundCompleteInputSchema } from "@/lib/refunds";
import { replacementReceiveInputSchema } from "@/lib/replacements";
import { HttpError } from "@/services/http-client";
import {
  returnCreateInputSchema,
  returnInspectionInputSchema,
  returnListParamsSchema,
  returnListResultSchema,
  returnRecordSchema,
  returnResolutionInputSchema,
  vendorReturnsSchema,
} from "../schemas/returns.schema";

function compareReturns(first, second, field) {
  if (field === "inspectionStatus") {
    return String(first.inspection.status).localeCompare(
      String(second.inspection.status),
      undefined,
      { numeric: true, sensitivity: "base" },
    );
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
    item.materialIssueId,
    item.materialCode,
    item.materialName,
    item.projectName,
    item.reason.replaceAll("-", " "),
    item.returnedByName,
    item.inspection.status.replaceAll("-", " "),
  ]
    .join(" ")
    .toLocaleLowerCase();
  return searchableText.includes(search.toLocaleLowerCase());
}

function paginate(items, params) {
  const filteredItems = items.filter(
    (item) =>
      (params.projectId === null || item.projectId === params.projectId) &&
      (params.inspectionStatus === null ||
        item.inspection.status === params.inspectionStatus) &&
      (params.reason === null || item.reason === params.reason) &&
      matchesSearch(item, params.search),
  );
  const direction = params.sortDirection === "asc" ? 1 : -1;
  const sortedItems = [...filteredItems].sort(
    (first, second) => compareReturns(first, second, params.sortBy) * direction,
  );
  const start = (params.page - 1) * params.pageSize;
  return {
    items: sortedItems.slice(start, start + params.pageSize),
    total: sortedItems.length,
    page: params.page,
    pageSize: params.pageSize,
  };
}

/** Browser-safe adapter for the durable returns API. */
export const apiReturnsAdapter = {
  async list(params, options) {
    options?.signal?.throwIfAborted();
    const items = await apiClient.get("/api/returns", { signal: options?.signal });
    return paginate(items, params);
  },
  async get(returnId) {
    try {
      return await apiClient.get(`/api/returns/${encodeURIComponent(returnId)}`);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },
  listAll() {
    return apiClient.get("/api/returns");
  },
  listVendor() {
    return apiClient.get("/api/returns/vendor");
  },
  create(input) {
    return apiClient.post("/api/returns", { body: input });
  },
  inspect(returnId, input) {
    return apiClient.post(`/api/returns/${encodeURIComponent(returnId)}/inspect`, {
      body: input,
    });
  },
  resolve(returnId, input) {
    return apiClient.post(`/api/returns/${encodeURIComponent(returnId)}/resolve`, {
      body: input,
    });
  },
  async completeRefund(returnId, input) {
    try {
      return await apiClient.post(
        `/api/returns/${encodeURIComponent(returnId)}/refund-completed`,
        { body: input },
      );
    } catch (error) {
      const reason = error instanceof HttpError ? error.body?.issues?.[0]?.message : null;
      throw reason ? new Error(reason, { cause: error }) : error;
    }
  },
  async receiveReplacement(returnId, input) {
    try {
      return await apiClient.post(
        `/api/returns/${encodeURIComponent(returnId)}/replacements`,
        { body: input },
      );
    } catch (error) {
      // Surface the server's own reason (e.g. "Only 2 bags are still to be replaced").
      const reason = error instanceof HttpError ? error.body?.issues?.[0]?.message : null;
      throw reason ? new Error(reason, { cause: error }) : error;
    }
  },
};

export function createReturnsService(adapter) {
  return {
    async list(params = {}, options = {}) {
      const normalizedParams = returnListParamsSchema.parse(params);
      const result = await adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return returnListResultSchema.parse(result);
    },
    async listAll() {
      return adapter.listAll();
    },
    /** Rejected deliveries going back to the vendor, with their replace/refund status. */
    async listVendor() {
      return vendorReturnsSchema.parse(await adapter.listVendor());
    },
    async get(returnId) {
      const record = await adapter.get(returnId);
      return record ? returnRecordSchema.parse(record) : null;
    },
    async create({ returnedById, ...formInput }) {
      const normalized = returnCreateInputSchema.parse(formInput);
      const record = await adapter.create({ ...normalized, returnedById });
      return returnRecordSchema.parse(record);
    },
    async inspect(returnId, { inspectedById, ...formInput }) {
      const normalized = returnInspectionInputSchema.parse(formInput);
      const record = await adapter.inspect(returnId, {
        ...normalized,
        inspectedById,
      });
      return record ? returnRecordSchema.parse(record) : null;
    },
    /** Marks the refund for a damaged return as received. */
    async completeRefund(returnId, input) {
      const normalized = refundCompleteInputSchema.parse(input);
      const record = await adapter.completeRefund(returnId, normalized);
      return record ? returnRecordSchema.parse(record) : null;
    },
    /** Records a full or partial delivery of replacement material; it is added to site stock. */
    async receiveReplacement(returnId, input) {
      const normalized = replacementReceiveInputSchema.parse(input);
      const record = await adapter.receiveReplacement(returnId, normalized);
      return record ? returnRecordSchema.parse(record) : null;
    },
    async resolve(returnId, { resolvedById, ...formInput }) {
      const normalized = returnResolutionInputSchema.parse(formInput);
      const record = await adapter.resolve(returnId, {
        ...normalized,
        resolvedById,
      });
      return record ? returnRecordSchema.parse(record) : null;
    },
  };
}
export const returnsService = createReturnsService(apiReturnsAdapter);

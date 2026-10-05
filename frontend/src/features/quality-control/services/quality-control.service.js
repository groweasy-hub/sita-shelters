import { apiClient } from "@/lib/api-client";
import { refundCompleteInputSchema } from "@/lib/refunds";
import { replacementReceiveInputSchema } from "@/lib/replacements";
import { getMaterialByCode } from "@/lib/mock-data/materials";
import { getProjectName } from "@/lib/mock-data/projects";
import { HttpError } from "@/services/http-client";
import {
  qcInspectionSchema,
  qcInspectionsSchema,
  qcListParamsSchema,
  qcListResultSchema,
  qcResolutionInputSchema,
} from "../schemas/quality-control.schema";

function inspection({
  id,
  inwardId,
  projectId,
  materialCode,
  receivedQuantity,
  acceptedQuantity,
  rejectedQuantity,
  inspectorId,
  status,
  remarks,
  inspectedAt = null,
}) {
  const material = getMaterialByCode(materialCode);
  return {
    id,
    inwardId,
    projectId,
    projectName: getProjectName(projectId),
    materialCode,
    materialName: material?.name ?? materialCode,
    unit: material?.unit ?? "",
    receivedQuantity,
    acceptedQuantity,
    rejectedQuantity,
    inspectorId,
    status,
    remarks,
    inspectedAt,
  };
}

/**
 * Fourteen QC inspections, one per goods-inward line in the inward
 * feature's mock GRNs (real referential integrity via `inwardId`, since
 * both features are hand-authored together in this module set). Accepted
 * lines are described as moving on to site stock; the one rejected line
 * (`QC-00011`) is described as triggering a vendor return.
 */
const RAW_QC_INSPECTIONS = [
  inspection({
    id: "QC-00001",
    inwardId: "GRN-00001",
    projectId: "sita-heights",
    materialCode: "FIN-TIL-600",
    receivedQuantity: 80,
    acceptedQuantity: 80,
    rejectedQuantity: 0,
    inspectorId: "usr-ritu-agarwal",
    status: "accepted",
    remarks: "Tiles match specification; batch sample check passed.",
    inspectedAt: "2026-08-21T10:00:00+05:30",
  }),
  inspection({
    id: "QC-00002",
    inwardId: "GRN-00002",
    projectId: "sita-heights",
    materialCode: "FIN-PNT-EM",
    receivedQuantity: 280,
    acceptedQuantity: 0,
    rejectedQuantity: 0,
    inspectorId: "usr-ritu-agarwal",
    status: "pending-inspection",
    remarks: "Awaiting inspection queue.",
  }),
  inspection({
    id: "QC-00003",
    inwardId: "GRN-00003",
    projectId: "sita-enclave",
    materialCode: "PLB-PVC-110",
    receivedQuantity: 48,
    acceptedQuantity: 48,
    rejectedQuantity: 0,
    inspectorId: "usr-ritu-agarwal",
    status: "accepted",
    remarks:
      "Received short by 2 lengths per transporter; quantity received is in good condition.",
    inspectedAt: "2026-08-25T14:00:00+05:30",
  }),
  inspection({
    id: "QC-00004",
    inwardId: "GRN-00004",
    projectId: "sita-greens",
    materialCode: "AGG-20MM",
    receivedQuantity: 60,
    acceptedQuantity: 0,
    rejectedQuantity: 0,
    inspectorId: "usr-ritu-agarwal",
    status: "under-inspection",
    remarks: "Sample gradation test in progress.",
  }),
  inspection({
    id: "QC-00005",
    inwardId: "GRN-00005",
    projectId: "sita-greens",
    materialCode: "SND-MFG-01",
    receivedQuantity: 40,
    acceptedQuantity: 0,
    rejectedQuantity: 0,
    inspectorId: "usr-ritu-agarwal",
    status: "pending-inspection",
    remarks: "Awaiting inspection queue.",
  }),
  inspection({
    id: "QC-00006",
    inwardId: "GRN-00006",
    projectId: "sita-grove",
    materialCode: "BRK-FLY-01",
    receivedQuantity: 10000,
    acceptedQuantity: 10000,
    rejectedQuantity: 0,
    inspectorId: "usr-ritu-agarwal",
    status: "accepted",
    remarks: "Brick sample crushing strength within IS 12894 tolerance.",
    inspectedAt: "2026-08-09T09:00:00+05:30",
  }),
  inspection({
    id: "QC-00007",
    inwardId: "GRN-00007",
    projectId: "sita-grove",
    materialCode: "BRK-FLY-01",
    receivedQuantity: 10000,
    acceptedQuantity: 10000,
    rejectedQuantity: 0,
    inspectorId: "usr-ritu-agarwal",
    status: "accepted",
    remarks: "Second batch consistent with the first; accepted.",
    inspectedAt: "2026-08-15T09:00:00+05:30",
  }),
  inspection({
    id: "QC-00008",
    inwardId: "GRN-00008",
    projectId: "sita-meridian",
    materialCode: "CEM-OPC-53",
    receivedQuantity: 100,
    acceptedQuantity: 100,
    rejectedQuantity: 0,
    inspectorId: "usr-naveen-pillai",
    status: "accepted",
    remarks: "Fineness and setting time within specification.",
    inspectedAt: "2026-08-21T10:00:00+05:30",
  }),
  inspection({
    id: "QC-00009",
    inwardId: "GRN-00009",
    projectId: "sita-meridian",
    materialCode: "CEM-OPC-53",
    receivedQuantity: 100,
    acceptedQuantity: 92,
    rejectedQuantity: 8,
    inspectorId: "usr-naveen-pillai",
    status: "accepted",
    remarks:
      "8 bags rejected due to moisture damage; balance 92 bags accepted.",
    inspectedAt: "2026-08-28T09:30:00+05:30",
  }),
  inspection({
    id: "QC-00010",
    inwardId: "GRN-00010",
    projectId: "sita-meridian",
    materialCode: "STL-TMT-16",
    receivedQuantity: 8,
    acceptedQuantity: 8,
    rejectedQuantity: 0,
    inspectorId: "usr-naveen-pillai",
    status: "accepted",
    remarks:
      "Mill test certificate verified; mechanical properties conform to Fe 500D.",
    inspectedAt: "2026-08-11T09:00:00+05:30",
  }),
  inspection({
    id: "QC-00011",
    inwardId: "GRN-00011",
    projectId: "sita-meridian",
    materialCode: "STL-TMT-12",
    receivedQuantity: 10,
    acceptedQuantity: 0,
    rejectedQuantity: 10,
    inspectorId: "usr-naveen-pillai",
    status: "rejected",
    remarks:
      "Bar diameter and rib pattern do not match the Fe 500D 12 mm specification; entire batch rejected, vendor return initiated.",
    inspectedAt: "2026-08-16T10:00:00+05:30",
  }),
  inspection({
    id: "QC-00012",
    inwardId: "GRN-00012",
    projectId: "sita-orchid",
    materialCode: "CEM-OPC-53",
    receivedQuantity: 120,
    acceptedQuantity: 120,
    rejectedQuantity: 0,
    inspectorId: "usr-naveen-pillai",
    status: "accepted",
    remarks: "Cement batch inspected on arrival; accepted for restart works.",
    inspectedAt: "2026-08-15T09:00:00+05:30",
  }),
  inspection({
    id: "QC-00013",
    inwardId: "GRN-00013",
    projectId: "sita-riviera",
    materialCode: "FIN-PNT-EX",
    receivedQuantity: 60,
    acceptedQuantity: 60,
    rejectedQuantity: 0,
    inspectorId: "usr-ritu-agarwal",
    status: "accepted",
    remarks: "Paint viscosity and shade sample match the approved swatch.",
    inspectedAt: "2026-08-26T09:00:00+05:30",
  }),
  inspection({
    id: "QC-00014",
    inwardId: "GRN-00014",
    projectId: "sita-riviera",
    materialCode: "FIN-DOR-FL",
    receivedQuantity: 10,
    acceptedQuantity: 10,
    rejectedQuantity: 0,
    inspectorId: "usr-ritu-agarwal",
    status: "accepted",
    remarks: "Door dimensions and laminate finish verified against sample.",
    inspectedAt: "2026-08-19T09:00:00+05:30",
  }),
];
let mockQcInspections = qcInspectionsSchema.parse(RAW_QC_INSPECTIONS);

function nowIso() {
  return new Date().toISOString();
}
function updateInspection(qcId, updater) {
  let updated = null;
  mockQcInspections = mockQcInspections.map((record) => {
    if (record.id !== qcId) return record;
    updated = updater(record);
    return updated;
  });
  return updated;
}

function matchesSearch(record, search) {
  if (!search) return true;
  const haystack = [
    record.id,
    record.inwardId,
    record.projectName,
    record.materialName,
    record.materialCode,
  ]
    .join(" ")
    .toLocaleLowerCase();
  return haystack.includes(search.toLocaleLowerCase());
}
function compare(first, second, field) {
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
export const mockQualityControlAdapter = {
  list(params, options) {
    options?.signal?.throwIfAborted();
    const filtered = mockQcInspections.filter(
      (record) =>
        (!params.projectId || record.projectId === params.projectId) &&
        (!params.status || record.status === params.status) &&
        matchesSearch(record, params.search),
    );
    const direction = params.sortDirection === "asc" ? 1 : -1;
    const sorted = [...filtered].sort(
      (first, second) => compare(first, second, params.sortBy) * direction,
    );
    const start = (params.page - 1) * params.pageSize;
    return {
      items: sorted.slice(start, start + params.pageSize),
      total: sorted.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  },
  get(qcId) {
    return mockQcInspections.find((record) => record.id === qcId) ?? null;
  },
  listAll() {
    return mockQcInspections;
  },
  listByInward(inwardId) {
    return mockQcInspections.filter((record) => record.inwardId === inwardId);
  },
  /**
   * Records the inspector's verdict for a pending/under-inspection line.
   * Any accepted quantity puts the record in `accepted` (matching the
   * existing partial-accept mock data, e.g. `QC-00009`); zero accepted
   * with some rejected puts it in `rejected`.
   */
  inspect(qcId, { inspectorId, acceptedQuantity, rejectedQuantity, remarks }) {
    return updateInspection(qcId, (record) => ({
      ...record,
      acceptedQuantity,
      rejectedQuantity,
      inspectorId,
      remarks,
      status: acceptedQuantity > 0 ? "accepted" : "rejected",
      inspectedAt: nowIso(),
    }));
  },
  /** Logs how a rejected delivery was settled with the vendor — a replacement or a refund. */
  resolve(qcId, { resolvedById, type, quantity, remarks }) {
    return updateInspection(qcId, (record) => ({
      ...record,
      resolution: {
        type,
        amount: quantity * (record.unitPrice ?? 0),
        quantity,
        remarks,
        resolvedById,
        resolvedAt: nowIso(),
      },
    }));
  },
};

/** Surfaces the server's own reason instead of "Request failed with status 409". */
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

/** Browser-safe adapter for the durable quality-control API. */
export const apiQualityControlAdapter = {
  async list(params, options) {
    options?.signal?.throwIfAborted();
    const items = await apiClient.get("/api/quality-control", {
      signal: options?.signal,
    });
    const filtered = items.filter(
      (record) =>
        (!params.projectId || record.projectId === params.projectId) &&
        (!params.status || record.status === params.status) &&
        matchesSearch(record, params.search),
    );
    const direction = params.sortDirection === "asc" ? 1 : -1;
    const sorted = [...filtered].sort(
      (first, second) => compare(first, second, params.sortBy) * direction,
    );
    const start = (params.page - 1) * params.pageSize;
    return {
      items: sorted.slice(start, start + params.pageSize),
      total: sorted.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  },
  async get(qcId) {
    try {
      return await apiClient.get(`/api/quality-control/${encodeURIComponent(qcId)}`);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },
  listAll() {
    return apiClient.get("/api/quality-control");
  },
  listByInward(inwardId) {
    return apiClient.get(
      `/api/quality-control/by-inward/${encodeURIComponent(inwardId)}`,
    );
  },
  async inspect(qcId, input) {
    try {
      return await apiClient.post(
        `/api/quality-control/${encodeURIComponent(qcId)}/inspect`,
        { body: input },
      );
    } catch (error) {
      throw toReadableError(error);
    }
  },
  async resolve(qcId, input) {
    try {
      return await apiClient.post(
        `/api/quality-control/${encodeURIComponent(qcId)}/resolve`,
        { body: input },
      );
    } catch (error) {
      throw toReadableError(error);
    }
  },
  async completeRefund(qcId, input) {
    try {
      return await apiClient.post(
        `/api/quality-control/${encodeURIComponent(qcId)}/refund-completed`,
        { body: input },
      );
    } catch (error) {
      throw toReadableError(error);
    }
  },
  async receiveReplacement(qcId, input) {
    try {
      return await apiClient.post(
        `/api/quality-control/${encodeURIComponent(qcId)}/replacements`,
        { body: input },
      );
    } catch (error) {
      throw toReadableError(error);
    }
  },
};

export function createQualityControlService(adapter) {
  return {
    async list(params = {}, options = {}) {
      const normalizedParams = qcListParamsSchema.parse(params);
      const result = await adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return qcListResultSchema.parse(result);
    },
    async get(qcId) {
      const record = await adapter.get(qcId);
      return record ? qcInspectionSchema.parse(record) : null;
    },
    async listAll() {
      return adapter.listAll();
    },
    async listByInward(inwardId) {
      return adapter.listByInward(inwardId);
    },
    async inspect(qcId, input) {
      const record = await adapter.inspect(qcId, input);
      return record ? qcInspectionSchema.parse(record) : null;
    },
    /** Marks the vendor's refund for a rejected delivery as received. */
    async completeRefund(qcId, input) {
      const normalized = refundCompleteInputSchema.parse(input);
      const record = await adapter.completeRefund(qcId, normalized);
      return record ? qcInspectionSchema.parse(record) : null;
    },
    /** Records a full or partial delivery of replacement material; it is added to site stock. */
    async receiveReplacement(qcId, input) {
      const normalized = replacementReceiveInputSchema.parse(input);
      const record = await adapter.receiveReplacement(qcId, normalized);
      return record ? qcInspectionSchema.parse(record) : null;
    },
    async resolve(qcId, { resolvedById, ...formInput }) {
      const normalized = qcResolutionInputSchema.parse(formInput);
      const record = await adapter.resolve(qcId, { ...normalized, resolvedById });
      return record ? qcInspectionSchema.parse(record) : null;
    },
  };
}
export const qualityControlService = createQualityControlService(
  apiQualityControlAdapter,
);

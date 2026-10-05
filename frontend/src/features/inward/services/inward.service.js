import { apiClient } from "@/lib/api-client";
import { getMaterialByCode } from "@/lib/mock-data/materials";
import { getProjectName } from "@/lib/mock-data/projects";
import { HttpError } from "@/services/http-client";
import {
  inwardInputSchema,
  inwardListParamsSchema,
  inwardListResultSchema,
  inwardRecordSchema,
  inwardRecordsSchema,
} from "../schemas/inward.schema";

function line(
  code,
  orderedQuantity,
  receivedQuantity,
  damagedQuantity = 0,
  missingQuantity = 0,
) {
  const material = getMaterialByCode(code);
  return {
    materialCode: code,
    materialName: material?.name ?? code,
    unit: material?.unit ?? "",
    orderedQuantity,
    receivedQuantity,
    damagedQuantity,
    missingQuantity,
  };
}
function inward({
  id,
  purchaseOrderId,
  vendorId,
  projectId,
  vehicleNumber,
  driverName,
  transporterName,
  invoiceNumber,
  deliveryChallanNumber,
  receivedAt,
  status,
  lines,
  recordedById = null,
}) {
  return {
    id,
    purchaseOrderId,
    vendorId,
    projectId,
    projectName: getProjectName(projectId),
    vehicleNumber,
    driverName,
    transporterName,
    invoiceNumber,
    deliveryChallanNumber,
    receivedAt,
    status,
    lines,
    recordedById,
  };
}

/**
 * Fourteen goods-inward records, one per delivered `deliverySchedule` entry
 * (or early delivery) across the procurement feature's mock purchase
 * orders. Per the product spec, arrival here is deliberately NOT the same
 * as available stock: every record starts life as `pending-qc` or
 * `under-inspection` until the quality-control feature accepts it.
 */
const RAW_INWARD_RECORDS = [
  inward({
    id: "GRN-00001",
    purchaseOrderId: "PO-00001",
    vendorId: "vnd-kajaria",
    projectId: "sita-heights",
    vehicleNumber: "TS09EF1234",
    driverName: "Ramesh Yadav",
    transporterName: "Balaji Road Carriers",
    invoiceNumber: "INV-2026-4401",
    deliveryChallanNumber: "DC-2026-4401",
    receivedAt: "2026-08-20T11:20:00+05:30",
    status: "accepted",
    lines: [line("FIN-TIL-600", 80, 80)],
  }),
  inward({
    id: "GRN-00002",
    purchaseOrderId: "PO-00002",
    vendorId: "vnd-asian-paints",
    projectId: "sita-heights",
    vehicleNumber: "MH12GT5522",
    driverName: "Sandeep Kulkarni",
    transporterName: "Om Sai Logistics",
    invoiceNumber: "INV-2026-4402",
    deliveryChallanNumber: "DC-2026-4402",
    receivedAt: "2026-09-03T10:05:00+05:30",
    status: "pending-qc",
    lines: [line("FIN-PNT-EM", 280, 280)],
  }),
  inward({
    id: "GRN-00003",
    purchaseOrderId: "PO-00003",
    vendorId: "vnd-finolex",
    projectId: "sita-enclave",
    vehicleNumber: "MH14BQ8890",
    driverName: "Vinod Chavan",
    transporterName: "Konkan Freight Movers",
    invoiceNumber: "INV-2026-4403",
    deliveryChallanNumber: "DC-2026-4403",
    receivedAt: "2026-08-25T09:45:00+05:30",
    status: "accepted",
    lines: [line("PLB-PVC-110", 50, 48, 0, 2)],
  }),
  inward({
    id: "GRN-00004",
    purchaseOrderId: "PO-00004",
    vendorId: "vnd-ultratech",
    projectId: "sita-greens",
    vehicleNumber: "TS07CK3311",
    driverName: "Nagesh Reddy",
    transporterName: "Deccan Bulk Transport",
    invoiceNumber: "INV-2026-4404",
    deliveryChallanNumber: "DC-2026-4404",
    receivedAt: "2026-09-05T14:10:00+05:30",
    status: "under-inspection",
    lines: [line("AGG-20MM", 60, 60)],
  }),
  inward({
    id: "GRN-00005",
    purchaseOrderId: "PO-00005",
    vendorId: "vnd-shree-sand",
    projectId: "sita-greens",
    vehicleNumber: "MH12FX7765",
    driverName: "Ganesh Pawar",
    transporterName: "Shree Sand Own Fleet",
    invoiceNumber: "INV-2026-4405",
    deliveryChallanNumber: "DC-2026-4405",
    receivedAt: "2026-09-04T13:30:00+05:30",
    status: "pending-qc",
    lines: [line("SND-MFG-01", 40, 40)],
  }),
  inward({
    id: "GRN-00006",
    purchaseOrderId: "PO-00006",
    vendorId: "vnd-crescent-brick",
    projectId: "sita-grove",
    vehicleNumber: "TS08DL9012",
    driverName: "Srinivas Goud",
    transporterName: "Crescent Own Fleet",
    invoiceNumber: "INV-2026-4406",
    deliveryChallanNumber: "DC-2026-4406",
    receivedAt: "2026-08-08T10:00:00+05:30",
    status: "accepted",
    lines: [line("BRK-FLY-01", 10000, 10000)],
  }),
  inward({
    id: "GRN-00007",
    purchaseOrderId: "PO-00006",
    vendorId: "vnd-crescent-brick",
    projectId: "sita-grove",
    vehicleNumber: "TS08DL9013",
    driverName: "Mallesh Naik",
    transporterName: "Crescent Own Fleet",
    invoiceNumber: "INV-2026-4407",
    deliveryChallanNumber: "DC-2026-4407",
    receivedAt: "2026-08-14T10:15:00+05:30",
    status: "accepted",
    lines: [line("BRK-FLY-01", 10000, 10000)],
  }),
  inward({
    id: "GRN-00008",
    purchaseOrderId: "PO-00007",
    vendorId: "vnd-ultratech",
    projectId: "sita-meridian",
    vehicleNumber: "MH12KL4456",
    driverName: "Anil Deshmukh",
    transporterName: "UltraTech Logistics",
    invoiceNumber: "INV-2026-4408",
    deliveryChallanNumber: "DC-2026-4408",
    receivedAt: "2026-08-20T09:30:00+05:30",
    status: "accepted",
    lines: [line("CEM-OPC-53", 100, 100)],
  }),
  inward({
    id: "GRN-00009",
    purchaseOrderId: "PO-00007",
    vendorId: "vnd-ultratech",
    projectId: "sita-meridian",
    vehicleNumber: "MH12KL4457",
    driverName: "Prakash Jadhav",
    transporterName: "UltraTech Logistics",
    invoiceNumber: "INV-2026-4409",
    deliveryChallanNumber: "DC-2026-4409",
    receivedAt: "2026-08-27T09:50:00+05:30",
    status: "partially-accepted",
    lines: [line("CEM-OPC-53", 100, 100, 8, 0)],
  }),
  inward({
    id: "GRN-00010",
    purchaseOrderId: "PO-00008",
    vendorId: "vnd-jsw-steel",
    projectId: "sita-meridian",
    vehicleNumber: "KA05MN7788",
    driverName: "Basavaraj Hiremath",
    transporterName: "JSW Dedicated Fleet",
    invoiceNumber: "INV-2026-4410",
    deliveryChallanNumber: "DC-2026-4410",
    receivedAt: "2026-08-10T11:00:00+05:30",
    status: "accepted",
    lines: [line("STL-TMT-16", 8, 8)],
  }),
  inward({
    id: "GRN-00011",
    purchaseOrderId: "PO-00008",
    vendorId: "vnd-jsw-steel",
    projectId: "sita-meridian",
    vehicleNumber: "KA05MN7789",
    driverName: "Chandru Gowda",
    transporterName: "JSW Dedicated Fleet",
    invoiceNumber: "INV-2026-4411",
    deliveryChallanNumber: "DC-2026-4411",
    receivedAt: "2026-08-15T11:40:00+05:30",
    status: "rejected",
    lines: [line("STL-TMT-12", 10, 10, 10, 0)],
  }),
  inward({
    id: "GRN-00012",
    purchaseOrderId: "PO-00014",
    vendorId: "vnd-ultratech",
    projectId: "sita-orchid",
    vehicleNumber: "TN37PQ2210",
    driverName: "Murugan Selvam",
    transporterName: "UltraTech Logistics",
    invoiceNumber: "INV-2026-4412",
    deliveryChallanNumber: "DC-2026-4412",
    receivedAt: "2026-08-14T10:30:00+05:30",
    status: "accepted",
    lines: [line("CEM-OPC-53", 120, 120)],
  }),
  inward({
    id: "GRN-00013",
    purchaseOrderId: "PO-00015",
    vendorId: "vnd-asian-paints",
    projectId: "sita-riviera",
    vehicleNumber: "AP31XY6603",
    driverName: "Koteswara Rao",
    transporterName: "Asian Paints Project Freight",
    invoiceNumber: "INV-2026-4413",
    deliveryChallanNumber: "DC-2026-4413",
    receivedAt: "2026-08-25T09:15:00+05:30",
    status: "accepted",
    lines: [line("FIN-PNT-EX", 60, 60)],
  }),
  inward({
    id: "GRN-00014",
    purchaseOrderId: "PO-00016",
    vendorId: "vnd-asian-paints",
    projectId: "sita-riviera",
    vehicleNumber: "AP31XY6604",
    driverName: "Venkata Ramana",
    transporterName: "Asian Paints Project Freight",
    invoiceNumber: "INV-2026-4414",
    deliveryChallanNumber: "DC-2026-4414",
    receivedAt: "2026-08-18T10:50:00+05:30",
    status: "accepted",
    lines: [line("FIN-DOR-FL", 10, 10)],
  }),
];
let mockInwardRecords = inwardRecordsSchema.parse(RAW_INWARD_RECORDS);
let inwardSequence = mockInwardRecords.length;

function nextInwardId() {
  inwardSequence += 1;
  return `GRN-${String(inwardSequence).padStart(5, "0")}`;
}

function matchesSearch(record, search) {
  if (!search) return true;
  const haystack = [
    record.id,
    record.purchaseOrderId,
    record.projectName,
    record.invoiceNumber,
    record.deliveryChallanNumber,
    ...record.lines.map((entry) => entry.materialName),
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
export const mockInwardAdapter = {
  list(params, options) {
    options?.signal?.throwIfAborted();
    const filtered = mockInwardRecords.filter(
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
  get(inwardId) {
    return mockInwardRecords.find((record) => record.id === inwardId) ?? null;
  },
  listAll() {
    return mockInwardRecords;
  },
  listByPurchaseOrder(purchaseOrderId) {
    return mockInwardRecords.filter(
      (record) => record.purchaseOrderId === purchaseOrderId,
    );
  },
  /**
   * Records a new goods-inward delivery against a released purchase order.
   * Always starts `pending-qc` — quality control decides accept/reject
   * separately (see `quality-control.service.js`), regardless of any
   * transit damage/shortage already noted on the line here.
   */
  create({ purchaseOrderId, vendorId, projectId, lines, ...rest }) {
    const record = inward({
      id: nextInwardId(),
      purchaseOrderId,
      vendorId,
      projectId,
      status: "pending-qc",
      lines,
      ...rest,
    });
    mockInwardRecords = [...mockInwardRecords, record];
    return record;
  },
};

/** Browser-safe adapter for the durable inward/GRN API. */
export const apiInwardAdapter = {
  async list(params, options) {
    options?.signal?.throwIfAborted();
    const items = await apiClient.get("/api/inward", { signal: options?.signal });
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
  async get(inwardId) {
    try {
      return await apiClient.get(`/api/inward/${encodeURIComponent(inwardId)}`);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },
  listAll() {
    return apiClient.get("/api/inward");
  },
  listByPurchaseOrder(purchaseOrderId) {
    return apiClient.get(
      `/api/inward/by-purchase-order/${encodeURIComponent(purchaseOrderId)}`,
    );
  },
  create(input) {
    return apiClient.post("/api/inward", { body: input });
  },
  /** A GRN workflow step: "approve-engineer", "approve-manager", "confirm-receipt" or "reject". */
  async step(inwardId, step, input) {
    try {
      return await apiClient.post(
        `/api/inward/${encodeURIComponent(inwardId)}/${step}`,
        { body: input },
      );
    } catch (error) {
      // Surface the server's own reason (e.g. "not waiting for that step").
      const reason = error instanceof HttpError ? error.body?.issues?.[0]?.message : null;
      throw reason ? new Error(reason, { cause: error }) : error;
    }
  },
};

export function createInwardService(adapter) {
  return {
    async list(params = {}, options = {}) {
      const normalizedParams = inwardListParamsSchema.parse(params);
      const result = await adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return inwardListResultSchema.parse(result);
    },
    async get(inwardId) {
      const record = await adapter.get(inwardId);
      return record ? inwardRecordSchema.parse(record) : null;
    },
    async listAll() {
      return adapter.listAll();
    },
    async listByPurchaseOrder(purchaseOrderId) {
      return adapter.listByPurchaseOrder(purchaseOrderId);
    },
    /** Takes one step of the GRN workflow; the server enforces who may and in what order. */
    async step(inwardId, step, input = {}) {
      const record = await adapter.step(inwardId, step, {
        remarks: String(input.remarks ?? "").trim(),
      });
      return inwardRecordSchema.parse(record);
    },
    async create({ vendorId, projectId, recordedById, ...formInput }) {
      const normalized = inwardInputSchema.parse(formInput);
      const record = await adapter.create({
        purchaseOrderId: normalized.purchaseOrderId,
        vendorId,
        projectId,
        recordedById,
        vehicleNumber: normalized.vehicleNumber,
        driverName: normalized.driverName,
        transporterName: normalized.transporterName,
        invoiceNumber: normalized.invoiceNumber,
        deliveryChallanNumber: normalized.deliveryChallanNumber,
        receivedAt: new Date(normalized.receivedAt).toISOString(),
        lines: normalized.lines.map((line) => ({
          materialCode: line.materialCode,
          materialName: line.materialName,
          unit: line.unit,
          orderedQuantity: line.orderedQuantity,
          receivedQuantity: line.receivedQuantity,
          damagedQuantity: line.damagedQuantity,
          missingQuantity: line.missingQuantity,
        })),
      });
      return inwardRecordSchema.parse(record);
    },
  };
}
export const inwardService = createInwardService(apiInwardAdapter);

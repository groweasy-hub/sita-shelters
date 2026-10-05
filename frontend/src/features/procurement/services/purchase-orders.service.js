import { apiClient } from "@/lib/api-client";
import { getMaterialByCode } from "@/lib/mock-data/materials";
import { getProjectName } from "@/lib/mock-data/projects";
import { HttpError } from "@/services/http-client";
import {
  purchaseOrderInputSchema,
  purchaseOrderListParamsSchema,
  purchaseOrderListResultSchema,
  purchaseOrderSchema,
  purchaseOrdersSchema,
} from "../schemas/procurement.schema";

function item(code, orderedQuantity, unitPrice, taxPercent) {
  const material = getMaterialByCode(code);
  return {
    materialCode: code,
    materialName: material?.name ?? code,
    unit: material?.unit ?? "",
    orderedQuantity,
    unitPrice,
    taxPercent,
  };
}
function delivery(id, plannedDate, quantity, status) {
  return { id, plannedDate, quantity, status };
}
function approval(approver, role, action, remarks, at) {
  return { approver, role, action, remarks, at };
}
function purchaseOrder({
  id,
  vendorId,
  projectId,
  sourceIndentId = null,
  quotationLineIds = [],
  status,
  items,
  deliverySchedule = [],
  approvals = [],
  releasedAt = null,
  termsNote,
  createdAt,
}) {
  return {
    id,
    vendorId,
    projectId,
    projectName: getProjectName(projectId),
    sourceIndentId,
    quotationLineIds,
    status,
    items,
    deliverySchedule,
    approvals,
    releasedAt,
    termsNote,
    createdAt,
  };
}

/**
 * Sixteen hand-authored purchase orders spanning every `purchaseOrder`
 * workflow status. Eight trace back to the selected quotations in
 * `quotations.service.js` via `quotationLineIds`; the remainder are
 * standalone orders raised directly by procurement. Four (`PO-00003`,
 * `PO-00007`, `PO-00008`, `PO-00015`) demonstrate partial supply across
 * multiple scheduled deliveries.
 */
const RAW_PURCHASE_ORDERS = [
  purchaseOrder({
    id: "PO-00001",
    vendorId: "vnd-kajaria",
    projectId: "sita-heights",
    sourceIndentId: "IND-02403",
    quotationLineIds: ["QT-00001"],
    status: "closed",
    items: [item("FIN-TIL-600", 80, 1150, 18)],
    deliverySchedule: [delivery("PO-00001-D1", "2026-08-20", 80, "delivered")],
    approvals: [
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "submitted",
        "",
        "2026-08-12T10:00:00+05:30",
      ),
      approval(
        "Farah Khan",
        "Procurement Manager",
        "approved",
        "Rate matches selected quotation.",
        "2026-08-12T15:00:00+05:30",
      ),
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "released",
        "",
        "2026-08-13T09:00:00+05:30",
      ),
    ],
    releasedAt: "2026-08-13T09:00:00+05:30",
    termsNote: "Payment 30 days from delivery. Freight included.",
    createdAt: "2026-08-12T10:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00002",
    vendorId: "vnd-asian-paints",
    projectId: "sita-heights",
    sourceIndentId: "IND-02403",
    quotationLineIds: ["QT-00003"],
    status: "closed",
    items: [item("FIN-PNT-EM", 280, 375, 12)],
    deliverySchedule: [delivery("PO-00002-D1", "2026-09-03", 280, "delivered")],
    approvals: [
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "submitted",
        "",
        "2026-08-13T09:30:00+05:30",
      ),
      approval(
        "Farah Khan",
        "Procurement Manager",
        "approved",
        "",
        "2026-08-13T14:00:00+05:30",
      ),
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "released",
        "",
        "2026-08-14T09:00:00+05:30",
      ),
    ],
    releasedAt: "2026-08-14T09:00:00+05:30",
    termsNote: "Payment 45 days from invoice.",
    createdAt: "2026-08-13T09:30:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00003",
    vendorId: "vnd-finolex",
    projectId: "sita-enclave",
    sourceIndentId: "IND-02406",
    quotationLineIds: ["QT-00004"],
    status: "partially-delivered",
    items: [item("PLB-PVC-110", 50, 800, 18), item("PLB-FIT-ELB", 120, 95, 18)],
    deliverySchedule: [
      delivery("PO-00003-D1", "2026-08-25", 50, "delivered"),
      delivery("PO-00003-D2", "2026-09-08", 120, "pending"),
    ],
    approvals: [
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "submitted",
        "",
        "2026-08-06T09:00:00+05:30",
      ),
      approval(
        "Farah Khan",
        "Procurement Manager",
        "approved",
        "",
        "2026-08-06T13:00:00+05:30",
      ),
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "released",
        "",
        "2026-08-07T09:00:00+05:30",
      ),
    ],
    releasedAt: "2026-08-07T09:00:00+05:30",
    termsNote: "Split delivery: pipes first, fittings to follow.",
    createdAt: "2026-08-06T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00004",
    vendorId: "vnd-ultratech",
    projectId: "sita-greens",
    sourceIndentId: "IND-02408",
    quotationLineIds: ["QT-00006"],
    status: "fully-delivered",
    items: [item("AGG-20MM", 60, 1620, 5)],
    deliverySchedule: [delivery("PO-00004-D1", "2026-09-05", 60, "delivered")],
    approvals: [
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "submitted",
        "",
        "2026-08-21T09:00:00+05:30",
      ),
      approval(
        "Farah Khan",
        "Procurement Manager",
        "approved",
        "",
        "2026-08-21T12:00:00+05:30",
      ),
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "released",
        "",
        "2026-08-22T09:00:00+05:30",
      ),
    ],
    releasedAt: "2026-08-22T09:00:00+05:30",
    termsNote: "Payment 30 days from delivery.",
    createdAt: "2026-08-21T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00005",
    vendorId: "vnd-shree-sand",
    projectId: "sita-greens",
    sourceIndentId: "IND-02408",
    quotationLineIds: ["QT-00008"],
    status: "fully-delivered",
    items: [item("SND-MFG-01", 40, 1830, 5)],
    deliverySchedule: [delivery("PO-00005-D1", "2026-09-04", 40, "delivered")],
    approvals: [
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "submitted",
        "",
        "2026-08-21T09:15:00+05:30",
      ),
      approval(
        "Farah Khan",
        "Procurement Manager",
        "approved",
        "",
        "2026-08-21T12:15:00+05:30",
      ),
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "released",
        "",
        "2026-08-22T09:15:00+05:30",
      ),
    ],
    releasedAt: "2026-08-22T09:15:00+05:30",
    termsNote: "Payment on delivery.",
    createdAt: "2026-08-21T09:15:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00006",
    vendorId: "vnd-crescent-brick",
    projectId: "sita-grove",
    sourceIndentId: "IND-02412",
    quotationLineIds: ["QT-00009"],
    status: "closed",
    items: [item("BRK-FLY-01", 20000, 7.3, 5)],
    deliverySchedule: [
      delivery("PO-00006-D1", "2026-08-08", 10000, "delivered"),
      delivery("PO-00006-D2", "2026-08-14", 10000, "delivered"),
    ],
    approvals: [
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "submitted",
        "",
        "2026-08-04T09:00:00+05:30",
      ),
      approval(
        "Farah Khan",
        "Procurement Manager",
        "approved",
        "",
        "2026-08-04T13:00:00+05:30",
      ),
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "released",
        "",
        "2026-08-05T09:00:00+05:30",
      ),
    ],
    releasedAt: "2026-08-05T09:00:00+05:30",
    termsNote: "Two truckloads, payment 30 days from final delivery.",
    createdAt: "2026-08-04T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00007",
    vendorId: "vnd-ultratech",
    projectId: "sita-meridian",
    sourceIndentId: "IND-02414",
    quotationLineIds: ["QT-00011"],
    status: "partially-delivered",
    items: [item("CEM-OPC-53", 250, 390, 28)],
    deliverySchedule: [
      delivery("PO-00007-D1", "2026-08-20", 100, "delivered"),
      delivery("PO-00007-D2", "2026-08-27", 100, "delivered"),
      delivery("PO-00007-D3", "2026-09-10", 50, "pending"),
    ],
    approvals: [
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "submitted",
        "",
        "2026-08-15T09:00:00+05:30",
      ),
      approval(
        "Farah Khan",
        "Procurement Manager",
        "approved",
        "",
        "2026-08-15T13:00:00+05:30",
      ),
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "released",
        "",
        "2026-08-16T09:00:00+05:30",
      ),
    ],
    releasedAt: "2026-08-16T09:00:00+05:30",
    termsNote: "Three-batch delivery to match casting schedule.",
    createdAt: "2026-08-15T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00008",
    vendorId: "vnd-jsw-steel",
    projectId: "sita-meridian",
    sourceIndentId: "IND-02415",
    quotationLineIds: ["QT-00013", "QT-00015"],
    status: "partially-delivered",
    items: [
      item("STL-TMT-16", 12, 62000, 18),
      item("STL-TMT-12", 10, 62800, 18),
    ],
    deliverySchedule: [
      delivery("PO-00008-D1", "2026-08-10", 8, "delivered"),
      delivery("PO-00008-D2", "2026-08-15", 10, "delivered"),
      delivery("PO-00008-D3", "2026-09-15", 4, "pending"),
    ],
    approvals: [
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "submitted",
        "",
        "2026-07-24T09:00:00+05:30",
      ),
      approval(
        "Farah Khan",
        "Procurement Manager",
        "approved",
        "",
        "2026-07-24T13:00:00+05:30",
      ),
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "released",
        "",
        "2026-07-25T09:00:00+05:30",
      ),
    ],
    releasedAt: "2026-07-25T09:00:00+05:30",
    termsNote: "16 mm bar balance to follow once mill allocation confirms.",
    createdAt: "2026-07-24T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00009",
    vendorId: "vnd-havells",
    projectId: "sita-heights",
    status: "draft",
    items: [item("ELE-CAB-4C", 1000, 145, 18), item("ELE-SW-1G", 200, 45, 18)],
    deliverySchedule: [delivery("PO-00009-D1", "2026-09-20", 1000, "pending")],
    termsNote: "Awaiting internal budget sign-off before release.",
    createdAt: "2026-09-01T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00010",
    vendorId: "vnd-havells",
    projectId: "sita-enclave",
    status: "pending-approval",
    items: [item("ELE-PNL-4W", 4, 1450, 18), item("ELE-SB-08M", 10, 380, 18)],
    deliverySchedule: [delivery("PO-00010-D1", "2026-09-22", 4, "pending")],
    approvals: [
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "submitted",
        "",
        "2026-08-30T09:00:00+05:30",
      ),
    ],
    termsNote: "Pending procurement manager approval.",
    createdAt: "2026-08-30T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00011",
    vendorId: "vnd-newage-fire",
    projectId: "sita-crest",
    status: "approved",
    items: [
      item("FIR-PMP-01", 1, 285000, 18),
      item("FIR-SPR-15", 200, 175, 18),
    ],
    deliverySchedule: [delivery("PO-00011-D1", "2026-09-28", 1, "pending")],
    approvals: [
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "submitted",
        "",
        "2026-08-31T09:00:00+05:30",
      ),
      approval(
        "Farah Khan",
        "Procurement Manager",
        "approved",
        "Advance terms confirmed with finance.",
        "2026-09-02T11:00:00+05:30",
      ),
    ],
    termsNote: "Advance 30% on order confirmation.",
    createdAt: "2026-08-31T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00012",
    vendorId: "vnd-finolex",
    projectId: "sita-crest",
    status: "released",
    items: [
      item("PLB-CPVC-25", 80, 310, 18),
      item("PLB-VLV-GT25", 15, 210, 18),
    ],
    deliverySchedule: [delivery("PO-00012-D1", "2026-09-14", 80, "pending")],
    approvals: [
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "submitted",
        "",
        "2026-08-29T09:00:00+05:30",
      ),
      approval(
        "Farah Khan",
        "Procurement Manager",
        "approved",
        "",
        "2026-08-29T15:00:00+05:30",
      ),
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "released",
        "",
        "2026-08-30T09:00:00+05:30",
      ),
    ],
    releasedAt: "2026-08-30T09:00:00+05:30",
    termsNote: "Payment 30 days from delivery.",
    createdAt: "2026-08-29T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00013",
    vendorId: "vnd-larsen-equip",
    projectId: "sita-orchid",
    status: "cancelled",
    items: [item("EQP-TNK-10K", 1, 420000, 18)],
    deliverySchedule: [],
    approvals: [
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "submitted",
        "",
        "2026-08-05T09:00:00+05:30",
      ),
      approval(
        "Farah Khan",
        "Procurement Manager",
        "sent-back",
        "Site restart not yet approved.",
        "2026-08-06T10:00:00+05:30",
      ),
    ],
    termsNote: "Cancelled pending site restart approval.",
    createdAt: "2026-08-05T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00014",
    vendorId: "vnd-ultratech",
    projectId: "sita-orchid",
    sourceIndentId: "IND-02421",
    status: "fully-delivered",
    items: [item("CEM-OPC-53", 120, 392, 28)],
    deliverySchedule: [delivery("PO-00014-D1", "2026-08-14", 120, "delivered")],
    approvals: [
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "submitted",
        "",
        "2026-08-13T09:00:00+05:30",
      ),
      approval(
        "Farah Khan",
        "Procurement Manager",
        "approved",
        "",
        "2026-08-13T13:00:00+05:30",
      ),
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "released",
        "",
        "2026-08-14T09:00:00+05:30",
      ),
    ],
    releasedAt: "2026-08-14T09:00:00+05:30",
    termsNote: "Payment 30 days from delivery.",
    createdAt: "2026-08-13T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00015",
    vendorId: "vnd-asian-paints",
    projectId: "sita-riviera",
    sourceIndentId: "IND-02424",
    status: "partially-delivered",
    items: [item("FIN-PNT-EX", 100, 420, 12)],
    deliverySchedule: [
      delivery("PO-00015-D1", "2026-08-25", 60, "delivered"),
      delivery("PO-00015-D2", "2026-09-10", 40, "pending"),
    ],
    approvals: [
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "submitted",
        "",
        "2026-07-30T09:00:00+05:30",
      ),
      approval(
        "Farah Khan",
        "Procurement Manager",
        "approved",
        "",
        "2026-07-30T14:00:00+05:30",
      ),
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "released",
        "",
        "2026-07-31T09:00:00+05:30",
      ),
    ],
    releasedAt: "2026-07-31T09:00:00+05:30",
    termsNote: "Facade contractor to confirm balance quantity before dispatch.",
    createdAt: "2026-07-30T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00016",
    vendorId: "vnd-asian-paints",
    projectId: "sita-riviera",
    sourceIndentId: "IND-02423",
    status: "closed",
    items: [item("FIN-DOR-FL", 10, 6800, 18)],
    deliverySchedule: [delivery("PO-00016-D1", "2026-08-18", 10, "delivered")],
    approvals: [
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "submitted",
        "",
        "2026-07-27T09:00:00+05:30",
      ),
      approval(
        "Farah Khan",
        "Procurement Manager",
        "approved",
        "",
        "2026-07-27T13:00:00+05:30",
      ),
      approval(
        "Alok Mishra",
        "Procurement Manager",
        "released",
        "",
        "2026-07-28T09:00:00+05:30",
      ),
    ],
    releasedAt: "2026-07-28T09:00:00+05:30",
    termsNote: "Payment 30 days from delivery.",
    createdAt: "2026-07-27T09:00:00+05:30",
  }),
];
let mockPurchaseOrders = purchaseOrdersSchema.parse(RAW_PURCHASE_ORDERS);
let purchaseOrderSequence = mockPurchaseOrders.length;

function nextPurchaseOrderId() {
  purchaseOrderSequence += 1;
  return `PO-${String(purchaseOrderSequence).padStart(5, "0")}`;
}
function nowIso() {
  return new Date().toISOString();
}
function updateOrder(poId, updater) {
  let updated = null;
  mockPurchaseOrders = mockPurchaseOrders.map((record) => {
    if (record.id !== poId) return record;
    updated = updater(record);
    return updated;
  });
  return updated;
}

function matchesSearch(record, search) {
  if (!search) return true;
  const haystack = [
    record.id,
    record.projectName,
    record.vendorId,
    ...record.items.map((entry) => entry.materialName),
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
function paginate(items, params) {
  const filtered = items.filter(
    (record) =>
      (!params.status || record.status === params.status) &&
      (!params.vendorId || record.vendorId === params.vendorId) &&
      (!params.projectId || record.projectId === params.projectId) &&
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
}
export const mockPurchaseOrdersAdapter = {
  list(params, options) {
    options?.signal?.throwIfAborted();
    const filtered = mockPurchaseOrders.filter(
      (record) =>
        (!params.status || record.status === params.status) &&
        (!params.vendorId || record.vendorId === params.vendorId) &&
        (!params.projectId || record.projectId === params.projectId) &&
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
  get(poId) {
    return mockPurchaseOrders.find((record) => record.id === poId) ?? null;
  },
  listAll() {
    return mockPurchaseOrders;
  },
  listByIndent(indentId) {
    return mockPurchaseOrders.filter(
      (record) => record.sourceIndentId === indentId,
    );
  },
  create({
    vendorId,
    projectId,
    sourceIndentId,
    quotationLineIds,
    items,
    termsNote,
    approver,
    role,
  }) {
    const record = purchaseOrder({
      id: nextPurchaseOrderId(),
      vendorId,
      projectId,
      sourceIndentId,
      quotationLineIds,
      status: "pending-approval",
      items,
      deliverySchedule: [],
      approvals: [approval(approver, role, "submitted", "", nowIso())],
      termsNote,
      createdAt: nowIso(),
    });
    mockPurchaseOrders = [...mockPurchaseOrders, record];
    return record;
  },
  approve(poId, { approver, role, remarks = "" }) {
    return updateOrder(poId, (record) => ({
      ...record,
      status: "approved",
      approvals: [
        ...record.approvals,
        approval(approver, role, "approved", remarks, nowIso()),
      ],
    }));
  },
  reject(poId, { approver, role, remarks }) {
    return updateOrder(poId, (record) => ({
      ...record,
      status: "rejected",
      approvals: [
        ...record.approvals,
        approval(approver, role, "rejected", remarks, nowIso()),
      ],
    }));
  },
  sendBack(poId, { approver, role, remarks }) {
    return updateOrder(poId, (record) => ({
      ...record,
      status: "draft",
      approvals: [
        ...record.approvals,
        approval(approver, role, "sent-back", remarks, nowIso()),
      ],
    }));
  },
  release(poId, { approver, role }) {
    return updateOrder(poId, (record) => ({
      ...record,
      status: "released",
      releasedAt: nowIso(),
      approvals: [
        ...record.approvals,
        approval(approver, role, "released", "", nowIso()),
      ],
    }));
  },
};
/** Browser-safe adapter for the durable purchase-orders API. */
export const apiPurchaseOrdersAdapter = {
  async list(params, options) {
    options?.signal?.throwIfAborted();
    const items = await apiClient.get("/api/procurement/purchase-orders", {
      signal: options?.signal,
    });
    return paginate(items, params);
  },
  async get(poId) {
    try {
      return await apiClient.get(
        `/api/procurement/purchase-orders/${encodeURIComponent(poId)}`,
      );
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },
  listAll() {
    return apiClient.get("/api/procurement/purchase-orders");
  },
  async listByIndent(indentId) {
    const all = await apiClient.get("/api/procurement/purchase-orders");
    return all.filter((record) => record.sourceIndentId === indentId);
  },
  async create(input) {
    try {
      return await apiClient.post("/api/procurement/purchase-orders", { body: input });
    } catch (error) {
      if (error instanceof HttpError) {
        // Surface the server's own reason rather than "Request failed with status 400".
        const reason =
          error.body?.issues?.[0]?.message ??
          (typeof error.body?.error === "string" ? error.body.error : null);
        if (reason) {
          throw new Error(reason, { cause: error });
        }
      }
      throw error;
    }
  },
  approve(poId) {
    return apiClient.post(
      `/api/procurement/purchase-orders/${encodeURIComponent(poId)}/approve`,
    );
  },
  reject(poId, { remarks }) {
    return apiClient.post(
      `/api/procurement/purchase-orders/${encodeURIComponent(poId)}/reject`,
      { body: { remarks } },
    );
  },
  sendBack(poId, { remarks }) {
    return apiClient.post(
      `/api/procurement/purchase-orders/${encodeURIComponent(poId)}/send-back`,
      { body: { remarks } },
    );
  },
  release(poId) {
    return apiClient.post(
      `/api/procurement/purchase-orders/${encodeURIComponent(poId)}/release`,
    );
  },
};

export function createPurchaseOrdersService(adapter) {
  return {
    async list(params = {}, options = {}) {
      const normalizedParams = purchaseOrderListParamsSchema.parse(params);
      const result = await adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return purchaseOrderListResultSchema.parse(result);
    },
    async get(poId) {
      const record = await adapter.get(poId);
      return record ? purchaseOrderSchema.parse(record) : null;
    },
    async listAll() {
      return adapter.listAll();
    },
    async listByIndent(indentId) {
      return adapter.listByIndent(indentId);
    },
    async create({ approver, role, ...formInput }) {
      const normalized = purchaseOrderInputSchema.parse(formInput);
      const items = normalized.items.map((entry) => ({
        quotationLineId: entry.quotationLineId ?? null,
        materialCode: entry.materialCode,
        materialName: entry.materialName,
        unit: entry.unit,
        orderedQuantity: entry.orderedQuantity,
        unitPrice: entry.unitPrice,
        taxPercent: entry.taxPercent,
      }));
      const record = await adapter.create({
        vendorId: normalized.vendorId,
        projectId: normalized.projectId,
        sourceIndentId: normalized.sourceIndentId,
        items,
        termsNote: normalized.termsNote,
        approver,
        role,
      });
      return purchaseOrderSchema.parse(record);
    },
    async approve(poId, input) {
      const record = await adapter.approve(poId, input);
      return record ? purchaseOrderSchema.parse(record) : null;
    },
    async reject(poId, input) {
      const record = await adapter.reject(poId, input);
      return record ? purchaseOrderSchema.parse(record) : null;
    },
    async sendBack(poId, input) {
      const record = await adapter.sendBack(poId, input);
      return record ? purchaseOrderSchema.parse(record) : null;
    },
    async release(poId, input) {
      const record = await adapter.release(poId, input);
      return record ? purchaseOrderSchema.parse(record) : null;
    },
  };
}
export const purchaseOrdersService = createPurchaseOrdersService(
  apiPurchaseOrdersAdapter,
);

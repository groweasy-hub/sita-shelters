import { getMaterialByCode } from "@/lib/mock-data/materials";
import { getProjectName } from "@/lib/mock-data/projects";
import {
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
function purchaseOrder({
  id,
  vendorId,
  projectId,
  sourceIndentId = null,
  status,
  items,
  deliverySchedule = [],
  termsNote,
  createdAt,
}) {
  return {
    id,
    vendorId,
    projectId,
    projectName: getProjectName(projectId),
    sourceIndentId,
    status,
    items,
    deliverySchedule,
    termsNote,
    createdAt,
  };
}

/**
 * Sixteen hand-authored purchase orders spanning every `purchaseOrder`
 * workflow status. Six trace back to the selected quotations in
 * `quotations.service.js`; the remainder are standalone orders raised
 * directly by procurement. Four (`PO-00003`, `PO-00007`, `PO-00008`,
 * `PO-00015`) demonstrate partial supply across multiple scheduled
 * deliveries.
 */
const RAW_PURCHASE_ORDERS = [
  purchaseOrder({
    id: "PO-00001",
    vendorId: "vnd-kajaria",
    projectId: "sita-heights",
    sourceIndentId: "IND-02403",
    status: "completed",
    items: [item("FIN-TIL-600", 80, 1150, 18)],
    deliverySchedule: [delivery("PO-00001-D1", "2026-08-20", 80, "delivered")],
    termsNote: "Payment 30 days from delivery. Freight included.",
    createdAt: "2026-08-12T10:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00002",
    vendorId: "vnd-asian-paints",
    projectId: "sita-heights",
    sourceIndentId: "IND-02403",
    status: "completed",
    items: [item("FIN-PNT-EM", 280, 375, 12)],
    deliverySchedule: [delivery("PO-00002-D1", "2026-09-03", 280, "delivered")],
    termsNote: "Payment 45 days from invoice.",
    createdAt: "2026-08-13T09:30:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00003",
    vendorId: "vnd-finolex",
    projectId: "sita-enclave",
    sourceIndentId: "IND-02406",
    status: "partially-supplied",
    items: [item("PLB-PVC-110", 50, 800, 18), item("PLB-FIT-ELB", 120, 95, 18)],
    deliverySchedule: [
      delivery("PO-00003-D1", "2026-08-25", 50, "delivered"),
      delivery("PO-00003-D2", "2026-09-08", 120, "pending"),
    ],
    termsNote: "Split delivery: pipes first, fittings to follow.",
    createdAt: "2026-08-06T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00004",
    vendorId: "vnd-ultratech",
    projectId: "sita-greens",
    sourceIndentId: "IND-02408",
    status: "completed",
    items: [item("AGG-20MM", 60, 1620, 5)],
    deliverySchedule: [delivery("PO-00004-D1", "2026-09-05", 60, "delivered")],
    termsNote: "Payment 30 days from delivery.",
    createdAt: "2026-08-21T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00005",
    vendorId: "vnd-shree-sand",
    projectId: "sita-greens",
    sourceIndentId: "IND-02408",
    status: "completed",
    items: [item("SND-MFG-01", 40, 1830, 5)],
    deliverySchedule: [delivery("PO-00005-D1", "2026-09-04", 40, "delivered")],
    termsNote: "Payment on delivery.",
    createdAt: "2026-08-21T09:15:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00006",
    vendorId: "vnd-crescent-brick",
    projectId: "sita-grove",
    sourceIndentId: "IND-02412",
    status: "completed",
    items: [item("BRK-FLY-01", 20000, 7.3, 5)],
    deliverySchedule: [
      delivery("PO-00006-D1", "2026-08-08", 10000, "delivered"),
      delivery("PO-00006-D2", "2026-08-14", 10000, "delivered"),
    ],
    termsNote: "Two truckloads, payment 30 days from final delivery.",
    createdAt: "2026-08-04T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00007",
    vendorId: "vnd-ultratech",
    projectId: "sita-meridian",
    sourceIndentId: "IND-02414",
    status: "partially-supplied",
    items: [item("CEM-OPC-53", 250, 390, 28)],
    deliverySchedule: [
      delivery("PO-00007-D1", "2026-08-20", 100, "delivered"),
      delivery("PO-00007-D2", "2026-08-27", 100, "delivered"),
      delivery("PO-00007-D3", "2026-09-10", 50, "pending"),
    ],
    termsNote: "Three-batch delivery to match casting schedule.",
    createdAt: "2026-08-15T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00008",
    vendorId: "vnd-jsw-steel",
    projectId: "sita-meridian",
    sourceIndentId: "IND-02415",
    status: "partially-supplied",
    items: [
      item("STL-TMT-16", 12, 62000, 18),
      item("STL-TMT-12", 10, 62800, 18),
    ],
    deliverySchedule: [
      delivery("PO-00008-D1", "2026-08-10", 8, "delivered"),
      delivery("PO-00008-D2", "2026-08-15", 10, "delivered"),
      delivery("PO-00008-D3", "2026-09-15", 4, "pending"),
    ],
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
    termsNote: "Advance 30% on order confirmation.",
    createdAt: "2026-08-31T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00012",
    vendorId: "vnd-finolex",
    projectId: "sita-crest",
    status: "sent",
    items: [
      item("PLB-CPVC-25", 80, 310, 18),
      item("PLB-VLV-GT25", 15, 210, 18),
    ],
    deliverySchedule: [delivery("PO-00012-D1", "2026-09-14", 80, "pending")],
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
    termsNote: "Cancelled pending site restart approval.",
    createdAt: "2026-08-05T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00014",
    vendorId: "vnd-ultratech",
    projectId: "sita-orchid",
    sourceIndentId: "IND-02421",
    status: "completed",
    items: [item("CEM-OPC-53", 120, 392, 28)],
    deliverySchedule: [delivery("PO-00014-D1", "2026-08-14", 120, "delivered")],
    termsNote: "Payment 30 days from delivery.",
    createdAt: "2026-08-13T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00015",
    vendorId: "vnd-asian-paints",
    projectId: "sita-riviera",
    sourceIndentId: "IND-02424",
    status: "partially-supplied",
    items: [item("FIN-PNT-EX", 100, 420, 12)],
    deliverySchedule: [
      delivery("PO-00015-D1", "2026-08-25", 60, "delivered"),
      delivery("PO-00015-D2", "2026-09-10", 40, "pending"),
    ],
    termsNote: "Facade contractor to confirm balance quantity before dispatch.",
    createdAt: "2026-07-30T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00016",
    vendorId: "vnd-asian-paints",
    projectId: "sita-riviera",
    sourceIndentId: "IND-02423",
    status: "completed",
    items: [item("FIN-DOR-FL", 10, 6800, 18)],
    deliverySchedule: [delivery("PO-00016-D1", "2026-08-18", 10, "delivered")],
    termsNote: "Payment 30 days from delivery.",
    createdAt: "2026-07-27T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00017",
    vendorId: "vnd-ultratech",
    projectId: "sita-heights",
    sourceIndentId: "IND-02425",
    status: "completed",
    items: [item("MAT-0150", 220, 390, 28), item("MAT-0178", 3, 64000, 18)],
    deliverySchedule: [delivery("PO-00017-D1", "2026-09-12", 223, "delivered")],
    termsNote: "Imported master material sample for slab pour procurement.",
    createdAt: "2026-09-07T10:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00018",
    vendorId: "vnd-savitru-engineering",
    projectId: "sita-meridian",
    sourceIndentId: "IND-02428",
    status: "completed",
    items: [item("MAT-0920", 45, 1250, 18), item("MAT-0921", 20, 980, 18)],
    deliverySchedule: [delivery("PO-00018-D1", "2026-09-13", 65, "delivered")],
    termsNote: "Fire alarm devices supplied against imported master item codes.",
    createdAt: "2026-09-06T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00019",
    vendorId: "vnd-vibrant-facade",
    projectId: "sita-riviera",
    sourceIndentId: "IND-02430",
    status: "completed",
    items: [item("MAT-0550", 60, 210, 18)],
    deliverySchedule: [delivery("PO-00019-D1", "2026-09-03", 60, "delivered")],
    termsNote: "Sanitary snag closure materials from imported material master.",
    createdAt: "2026-08-30T09:00:00+05:30",
  }),
  purchaseOrder({
    id: "PO-00020",
    vendorId: "vnd-idigitronics",
    projectId: "sita-crest",
    sourceIndentId: "IND-02429",
    status: "partially-supplied",
    items: [item("MAT-1174", 24, 11200, 12), item("MAT-1178", 300, 85, 18)],
    deliverySchedule: [
      delivery("PO-00020-D1", "2026-09-15", 24, "delivered"),
      delivery("PO-00020-D2", "2026-09-22", 300, "pending"),
    ],
    termsNote: "Solar panels delivered first; DC cable delivery pending.",
    createdAt: "2026-09-10T09:30:00+05:30",
  }),
];
const mockPurchaseOrders = purchaseOrdersSchema.parse(RAW_PURCHASE_ORDERS);

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
};
export function createPurchaseOrdersService(adapter) {
  return {
    list(params = {}, options = {}) {
      const normalizedParams = purchaseOrderListParamsSchema.parse(params);
      const result = adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return purchaseOrderListResultSchema.parse(result);
    },
    get(poId) {
      const record = adapter.get(poId);
      return record ? purchaseOrderSchema.parse(record) : null;
    },
    listAll() {
      return adapter.listAll();
    },
    listByIndent(indentId) {
      return adapter.listByIndent(indentId);
    },
  };
}
export const purchaseOrdersService = createPurchaseOrdersService(
  mockPurchaseOrdersAdapter,
);

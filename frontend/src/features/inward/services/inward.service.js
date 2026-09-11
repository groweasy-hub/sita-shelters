import { getMaterialByCode } from "@/lib/mock-data/materials";
import { getProjectName } from "@/lib/mock-data/projects";
import {
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
  inward({
    id: "GRN-00015",
    purchaseOrderId: "PO-00017",
    vendorId: "vnd-ultratech",
    projectId: "sita-heights",
    vehicleNumber: "TS09HM1510",
    driverName: "Madhav Rao",
    transporterName: "Deccan Site Logistics",
    invoiceNumber: "INV-2026-4415",
    deliveryChallanNumber: "DC-2026-4415",
    receivedAt: "2026-09-12T10:20:00+05:30",
    status: "accepted",
    lines: [line("MAT-0150", 220, 220), line("MAT-0178", 3, 3)],
  }),
  inward({
    id: "GRN-00016",
    purchaseOrderId: "PO-00018",
    vendorId: "vnd-savitru-engineering",
    projectId: "sita-meridian",
    vehicleNumber: "TS07FS0920",
    driverName: "Praveen Kumar",
    transporterName: "Savitru Project Freight",
    invoiceNumber: "INV-2026-4416",
    deliveryChallanNumber: "DC-2026-4416",
    receivedAt: "2026-09-13T11:00:00+05:30",
    status: "under-inspection",
    lines: [line("MAT-0920", 45, 45), line("MAT-0921", 20, 20)],
  }),
  inward({
    id: "GRN-00017",
    purchaseOrderId: "PO-00019",
    vendorId: "vnd-vibrant-facade",
    projectId: "sita-riviera",
    vehicleNumber: "TS08SN0550",
    driverName: "Mahesh Naik",
    transporterName: "Vibrant Delivery Fleet",
    invoiceNumber: "INV-2026-4417",
    deliveryChallanNumber: "DC-2026-4417",
    receivedAt: "2026-09-03T15:10:00+05:30",
    status: "accepted",
    lines: [line("MAT-0550", 60, 58, 2, 0)],
  }),
  inward({
    id: "GRN-00018",
    purchaseOrderId: "PO-00020",
    vendorId: "vnd-idigitronics",
    projectId: "sita-crest",
    vehicleNumber: "TS10SL1174",
    driverName: "Naveen Reddy",
    transporterName: "Green Energy Freight",
    invoiceNumber: "INV-2026-4418",
    deliveryChallanNumber: "DC-2026-4418",
    receivedAt: "2026-09-15T09:35:00+05:30",
    status: "pending-qc",
    lines: [line("MAT-1174", 24, 24)],
  }),
];
const mockInwardRecords = inwardRecordsSchema.parse(RAW_INWARD_RECORDS);

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
};
export function createInwardService(adapter) {
  return {
    list(params = {}, options = {}) {
      const normalizedParams = inwardListParamsSchema.parse(params);
      const result = adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return inwardListResultSchema.parse(result);
    },
    get(inwardId) {
      const record = adapter.get(inwardId);
      return record ? inwardRecordSchema.parse(record) : null;
    },
    listAll() {
      return adapter.listAll();
    },
    listByPurchaseOrder(purchaseOrderId) {
      return adapter.listByPurchaseOrder(purchaseOrderId);
    },
  };
}
export const inwardService = createInwardService(mockInwardAdapter);

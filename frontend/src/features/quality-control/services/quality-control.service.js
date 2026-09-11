import { getMaterialByCode } from "@/lib/mock-data/materials";
import { getProjectName } from "@/lib/mock-data/projects";
import {
  qcInspectionSchema,
  qcInspectionsSchema,
  qcListParamsSchema,
  qcListResultSchema,
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
  inspection({
    id: "QC-00015",
    inwardId: "GRN-00015",
    projectId: "sita-heights",
    materialCode: "MAT-0150",
    receivedQuantity: 220,
    acceptedQuantity: 220,
    rejectedQuantity: 0,
    inspectorId: "usr-ritu-agarwal",
    status: "accepted",
    remarks: "Imported master cement sample accepted after bag condition check.",
    inspectedAt: "2026-09-12T15:00:00+05:30",
  }),
  inspection({
    id: "QC-00016",
    inwardId: "GRN-00015",
    projectId: "sita-heights",
    materialCode: "MAT-0178",
    receivedQuantity: 3,
    acceptedQuantity: 3,
    rejectedQuantity: 0,
    inspectorId: "usr-ritu-agarwal",
    status: "accepted",
    remarks: "6 mm TMT rebar bundle tags and bend sample verified.",
    inspectedAt: "2026-09-12T15:15:00+05:30",
  }),
  inspection({
    id: "QC-00017",
    inwardId: "GRN-00016",
    projectId: "sita-meridian",
    materialCode: "MAT-0920",
    receivedQuantity: 45,
    acceptedQuantity: 0,
    rejectedQuantity: 0,
    inspectorId: "usr-naveen-pillai",
    status: "under-inspection",
    remarks: "Fire alarm sounder strobes are under functional sample testing.",
  }),
  inspection({
    id: "QC-00018",
    inwardId: "GRN-00016",
    projectId: "sita-meridian",
    materialCode: "MAT-0921",
    receivedQuantity: 20,
    acceptedQuantity: 0,
    rejectedQuantity: 0,
    inspectorId: "usr-naveen-pillai",
    status: "pending-inspection",
    remarks: "Awaiting ELV engineer availability for device verification.",
  }),
  inspection({
    id: "QC-00019",
    inwardId: "GRN-00017",
    projectId: "sita-riviera",
    materialCode: "MAT-0550",
    receivedQuantity: 58,
    acceptedQuantity: 56,
    rejectedQuantity: 2,
    inspectorId: "usr-ritu-agarwal",
    status: "accepted",
    remarks: "Two waste couplings cracked during transport; balance accepted.",
    inspectedAt: "2026-09-04T09:30:00+05:30",
  }),
  inspection({
    id: "QC-00020",
    inwardId: "GRN-00018",
    projectId: "sita-crest",
    materialCode: "MAT-1174",
    receivedQuantity: 24,
    acceptedQuantity: 0,
    rejectedQuantity: 0,
    inspectorId: "usr-naveen-pillai",
    status: "pending-inspection",
    remarks: "Solar panel serial numbers pending verification.",
  }),
];
const mockQcInspections = qcInspectionsSchema.parse(RAW_QC_INSPECTIONS);

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
};
export function createQualityControlService(adapter) {
  return {
    list(params = {}, options = {}) {
      const normalizedParams = qcListParamsSchema.parse(params);
      const result = adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return qcListResultSchema.parse(result);
    },
    get(qcId) {
      const record = adapter.get(qcId);
      return record ? qcInspectionSchema.parse(record) : null;
    },
    listAll() {
      return adapter.listAll();
    },
    listByInward(inwardId) {
      return adapter.listByInward(inwardId);
    },
  };
}
export const qualityControlService = createQualityControlService(
  mockQualityControlAdapter,
);

import { getMaterialByCode } from "@/lib/mock-data/materials";
import { getProjectName } from "@/lib/mock-data/projects";
import {
  indentListParamsSchema,
  indentListResultSchema,
  indentSchema,
  indentsSchema,
} from "../schemas/indents.schema";

/** Resolves a mock indent line from the material master so name/unit never drift. */
function line(materialCode, requestedQuantity, approvedQuantity = null) {
  const material = getMaterialByCode(materialCode);
  return {
    materialCode,
    materialName: material?.name ?? materialCode,
    unit: material?.unit ?? "",
    requestedQuantity,
    approvedQuantity,
  };
}
function indent({
  id,
  projectId,
  requestedById,
  priority,
  status,
  requiredDate,
  purpose,
  workLocation,
  createdAt,
  updatedAt,
  lines,
  hasProcurementRequest = false,
}) {
  return {
    id,
    projectId,
    projectName: getProjectName(projectId),
    requestedById,
    priority,
    status,
    requiredDate,
    purpose,
    workLocation,
    createdAt,
    updatedAt: updatedAt ?? createdAt,
    lines,
    hasProcurementRequest,
  };
}

/**
 * Hand-authored, deterministic indent demand across all eight projects. IDs
 * (`sourceIndentId`) referenced by the procurement feature's mock purchase
 * requests come from this exact list, so keep identifiers stable.
 */
const RAW_INDENTS = [
  indent({
    id: "IND-02401",
    projectId: "sita-heights",
    requestedById: "usr-rahul-iyer",
    priority: "medium",
    status: "draft",
    requiredDate: "2026-09-20",
    purpose:
      "Replenish shuttering plywood and binding wire for Tower C slab casting",
    workLocation: "Tower C - 8th floor slab",
    createdAt: "2026-09-01T09:15:00+05:30",
    lines: [line("PLY-SHT-18", 40), line("STL-BWR-01", 150)],
  }),
  indent({
    id: "IND-02402",
    projectId: "sita-heights",
    requestedById: "usr-rahul-iyer",
    priority: "high",
    status: "submitted",
    requiredDate: "2026-09-15",
    purpose: "TMT steel for Tower D column reinforcement",
    workLocation: "Tower D - ground to 3rd floor columns",
    createdAt: "2026-08-20T10:00:00+05:30",
    updatedAt: "2026-08-21T11:30:00+05:30",
    lines: [line("STL-TMT-16", 8), line("STL-TMT-12", 5)],
  }),
  indent({
    id: "IND-02403",
    projectId: "sita-heights",
    requestedById: "usr-rahul-iyer",
    priority: "medium",
    status: "approved",
    requiredDate: "2026-09-10",
    purpose: "Vitrified tiles and emulsion paint for Tower A handover flats",
    workLocation: "Tower A - flats 101-120",
    createdAt: "2026-08-05T09:00:00+05:30",
    updatedAt: "2026-08-10T15:00:00+05:30",
    lines: [line("FIN-TIL-600", 80, 80), line("FIN-PNT-EM", 300, 280)],
    hasProcurementRequest: true,
  }),
  indent({
    id: "IND-02404",
    projectId: "sita-enclave",
    requestedById: "usr-divya-menon",
    priority: "medium",
    status: "submitted",
    requiredDate: "2026-09-25",
    purpose: "Copper cabling for retail podium electrical rough-in",
    workLocation: "Podium - retail block B",
    createdAt: "2026-08-25T09:40:00+05:30",
    lines: [line("ELE-CAB-4C", 800), line("ELE-CAB-2C", 600)],
  }),
  indent({
    id: "IND-02405",
    projectId: "sita-enclave",
    requestedById: "usr-divya-menon",
    priority: "high",
    status: "under-review",
    requiredDate: "2026-09-18",
    purpose: "Fire sprinkler pipes for podium fire fighting line",
    workLocation: "Podium - fire riser shaft",
    createdAt: "2026-08-28T11:00:00+05:30",
    lines: [line("FIR-PIP-150", 20)],
  }),
  indent({
    id: "IND-02406",
    projectId: "sita-enclave",
    requestedById: "usr-divya-menon",
    priority: "urgent",
    status: "approved",
    requiredDate: "2026-09-08",
    purpose: "UPVC drainage pipes for block B plumbing rough-in",
    workLocation: "Block B - basement drainage",
    createdAt: "2026-08-01T08:30:00+05:30",
    updatedAt: "2026-08-04T10:00:00+05:30",
    lines: [line("PLB-PVC-110", 50, 50), line("PLB-FIT-ELB", 120, 120)],
    hasProcurementRequest: true,
  }),
  indent({
    id: "IND-02407",
    projectId: "sita-greens",
    requestedById: "usr-vikram-shetty",
    priority: "low",
    status: "draft",
    requiredDate: "2026-10-05",
    purpose: "Cement and river sand for compound wall foundation",
    workLocation: "Site boundary - compound wall",
    createdAt: "2026-09-02T09:00:00+05:30",
    lines: [line("CEM-OPC-53", 100), line("SND-RIV-01", 15)],
  }),
  indent({
    id: "IND-02408",
    projectId: "sita-greens",
    requestedById: "usr-vikram-shetty",
    priority: "medium",
    status: "approved",
    requiredDate: "2026-09-12",
    purpose: "Aggregate and M-sand for site levelling works",
    workLocation: "Villa plots 1-6",
    createdAt: "2026-08-15T09:30:00+05:30",
    updatedAt: "2026-08-19T14:00:00+05:30",
    lines: [line("AGG-20MM", 60, 60), line("SND-MFG-01", 40, 40)],
    hasProcurementRequest: true,
  }),
  indent({
    id: "IND-02409",
    projectId: "sita-greens",
    requestedById: "usr-vikram-shetty",
    priority: "low",
    status: "rejected",
    requiredDate: "2026-09-30",
    purpose: "Concrete mixer machine for early site works",
    workLocation: "Site office yard",
    createdAt: "2026-08-18T10:15:00+05:30",
    updatedAt: "2026-08-22T09:00:00+05:30",
    lines: [line("EQP-MCH-CM", 1, 0)],
  }),
  indent({
    id: "IND-02410",
    projectId: "sita-grove",
    requestedById: "usr-suresh-babu",
    priority: "medium",
    status: "submitted",
    requiredDate: "2026-09-22",
    purpose: "TMT steel for Phase II Tower E slab reinforcement",
    workLocation: "Tower E - 5th floor slab",
    createdAt: "2026-08-30T09:00:00+05:30",
    lines: [line("STL-TMT-12", 6), line("STL-TMT-08", 3)],
  }),
  indent({
    id: "IND-02411",
    projectId: "sita-grove",
    requestedById: "usr-suresh-babu",
    priority: "high",
    status: "under-review",
    requiredDate: "2026-09-16",
    purpose: "Clubhouse electrical panel and switchboards",
    workLocation: "Clubhouse - electrical room",
    createdAt: "2026-08-27T09:45:00+05:30",
    lines: [line("ELE-PNL-4W", 4), line("ELE-SB-08M", 10)],
  }),
  indent({
    id: "IND-02412",
    projectId: "sita-grove",
    requestedById: "usr-suresh-babu",
    priority: "medium",
    status: "approved",
    requiredDate: "2026-09-09",
    purpose: "Fly ash bricks for Tower E masonry works",
    workLocation: "Tower E - 6th to 8th floor walls",
    createdAt: "2026-08-03T09:00:00+05:30",
    updatedAt: "2026-08-06T12:00:00+05:30",
    lines: [line("BRK-FLY-01", 20000, 20000)],
    hasProcurementRequest: true,
  }),
  indent({
    id: "IND-02413",
    projectId: "sita-meridian",
    requestedById: "usr-sneha-kapoor",
    priority: "medium",
    status: "submitted",
    requiredDate: "2026-09-28",
    purpose: "River sand and aggregate for Block 2 RCC works",
    workLocation: "Block 2 - foundation",
    createdAt: "2026-09-01T08:50:00+05:30",
    lines: [line("SND-RIV-01", 25), line("AGG-20MM", 30)],
  }),
  indent({
    id: "IND-02414",
    projectId: "sita-meridian",
    requestedById: "usr-sneha-kapoor",
    priority: "high",
    status: "approved",
    requiredDate: "2026-09-11",
    purpose: "OPC cement for Block 1 column casting",
    workLocation: "Block 1 - 4th floor columns",
    createdAt: "2026-08-10T09:20:00+05:30",
    updatedAt: "2026-08-13T10:00:00+05:30",
    lines: [line("CEM-OPC-53", 250, 250)],
    hasProcurementRequest: true,
  }),
  indent({
    id: "IND-02415",
    projectId: "sita-meridian",
    requestedById: "usr-sneha-kapoor",
    priority: "high",
    status: "partially-fulfilled",
    requiredDate: "2026-08-30",
    purpose: "TMT steel bars for Block 1 and Block 3 structural works",
    workLocation: "Block 1 & 3 - columns and beams",
    createdAt: "2026-07-20T09:00:00+05:30",
    updatedAt: "2026-08-25T16:00:00+05:30",
    lines: [line("STL-TMT-16", 12, 8), line("STL-TMT-12", 10, 10)],
    hasProcurementRequest: true,
  }),
  indent({
    id: "IND-02416",
    projectId: "sita-crest",
    requestedById: "usr-manoj-verma",
    priority: "medium",
    status: "submitted",
    requiredDate: "2026-09-24",
    purpose:
      "Fire hydrant pump and sprinklers for waterfront tower fire system",
    workLocation: "Tower 1 - terrace pump room",
    createdAt: "2026-08-29T09:10:00+05:30",
    lines: [line("FIR-PMP-01", 1), line("FIR-SPR-15", 200)],
  }),
  indent({
    id: "IND-02417",
    projectId: "sita-crest",
    requestedById: "usr-manoj-verma",
    priority: "medium",
    status: "under-review",
    requiredDate: "2026-09-19",
    purpose: "CPVC piping for Tower 1 plumbing shaft",
    workLocation: "Tower 1 - plumbing shaft",
    createdAt: "2026-08-26T09:00:00+05:30",
    lines: [line("PLB-CPVC-25", 80), line("PLB-VLV-GT25", 15)],
  }),
  indent({
    id: "IND-02418",
    projectId: "sita-crest",
    requestedById: "usr-manoj-verma",
    priority: "medium",
    status: "completed",
    requiredDate: "2026-08-15",
    purpose: "Fly ash bricks and clay bricks for Tower 1 masonry",
    workLocation: "Tower 1 - 2nd to 4th floor walls",
    createdAt: "2026-07-10T09:00:00+05:30",
    updatedAt: "2026-09-02T14:30:00+05:30",
    lines: [line("BRK-FLY-01", 15000, 15000), line("BRK-CLY-01", 5000, 5000)],
    hasProcurementRequest: true,
  }),
  indent({
    id: "IND-02419",
    projectId: "sita-orchid",
    requestedById: "usr-priyanka-das",
    priority: "low",
    status: "draft",
    requiredDate: "2026-10-15",
    purpose: "Scaffolding pipe sets pending site restart approval",
    workLocation: "Site store",
    createdAt: "2026-09-03T09:00:00+05:30",
    lines: [line("EQP-TL-SCF", 5)],
  }),
  indent({
    id: "IND-02420",
    projectId: "sita-orchid",
    requestedById: "usr-priyanka-das",
    priority: "low",
    status: "submitted",
    requiredDate: "2026-10-01",
    purpose: "Water tanker for site water supply",
    workLocation: "Site entrance",
    createdAt: "2026-08-20T09:00:00+05:30",
    lines: [line("EQP-TNK-10K", 1)],
  }),
  indent({
    id: "IND-02421",
    projectId: "sita-orchid",
    requestedById: "usr-priyanka-das",
    priority: "medium",
    status: "approved",
    requiredDate: "2026-09-14",
    purpose: "OPC cement for boundary and foundation restart works",
    workLocation: "Boundary wall and foundation",
    createdAt: "2026-08-12T09:00:00+05:30",
    updatedAt: "2026-08-15T11:00:00+05:30",
    lines: [line("CEM-OPC-53", 120, 120)],
    hasProcurementRequest: true,
  }),
  indent({
    id: "IND-02422",
    projectId: "sita-riviera",
    requestedById: "usr-manoj-verma",
    priority: "low",
    status: "submitted",
    requiredDate: "2026-09-17",
    purpose: "Touch-up emulsion paint for post-handover snag rectification",
    workLocation: "Block C - common areas",
    createdAt: "2026-08-31T09:00:00+05:30",
    lines: [line("FIN-PNT-EM", 40)],
  }),
  indent({
    id: "IND-02423",
    projectId: "sita-riviera",
    requestedById: "usr-manoj-verma",
    priority: "medium",
    status: "completed",
    requiredDate: "2026-08-20",
    purpose: "Flush doors replacement for snag list closure",
    workLocation: "Block A - flats 201-210",
    createdAt: "2026-07-25T09:00:00+05:30",
    updatedAt: "2026-08-22T13:00:00+05:30",
    lines: [line("FIN-DOR-FL", 10, 10)],
    hasProcurementRequest: true,
  }),
  indent({
    id: "IND-02424",
    projectId: "sita-riviera",
    requestedById: "usr-manoj-verma",
    priority: "medium",
    status: "partially-fulfilled",
    requiredDate: "2026-08-28",
    purpose: "Exterior weatherproof paint for facade touch-up",
    workLocation: "Tower block exterior facade",
    createdAt: "2026-07-28T09:00:00+05:30",
    updatedAt: "2026-08-29T15:00:00+05:30",
    lines: [line("FIN-PNT-EX", 100, 60)],
    hasProcurementRequest: true,
  }),
  indent({
    id: "IND-02425",
    projectId: "sita-heights",
    requestedById: "usr-ashok",
    priority: "high",
    status: "approved",
    requiredDate: "2026-09-18",
    purpose: "Imported concrete and RCC master items for next slab pour",
    workLocation: "Tower C - 9th floor slab",
    createdAt: "2026-09-05T09:00:00+05:30",
    updatedAt: "2026-09-06T12:00:00+05:30",
    lines: [line("MAT-0150", 220, 220), line("MAT-0178", 3, 3)],
    hasProcurementRequest: true,
  }),
  indent({
    id: "IND-02426",
    projectId: "sita-enclave",
    requestedById: "usr-divya-menon",
    priority: "medium",
    status: "submitted",
    requiredDate: "2026-09-21",
    purpose: "AAC block masonry from imported material master",
    workLocation: "Block B - 4th floor internal walls",
    createdAt: "2026-09-06T10:00:00+05:30",
    lines: [line("MAT-0225", 2500), line("MAT-0235", 80)],
  }),
  indent({
    id: "IND-02427",
    projectId: "sita-grove",
    requestedById: "usr-suresh-babu",
    priority: "medium",
    status: "under-review",
    requiredDate: "2026-09-24",
    purpose: "Waterproofing membrane and terrace protection materials",
    workLocation: "Clubhouse terrace",
    createdAt: "2026-09-07T09:15:00+05:30",
    lines: [line("MAT-0260", 180), line("MAT-1213", 120)],
  }),
  indent({
    id: "IND-02428",
    projectId: "sita-meridian",
    requestedById: "usr-sneha-kapoor",
    priority: "high",
    status: "approved",
    requiredDate: "2026-09-19",
    purpose: "Fire alarm devices from imported fire and life safety category",
    workLocation: "Block 1 - fire command room",
    createdAt: "2026-09-04T09:30:00+05:30",
    updatedAt: "2026-09-05T15:30:00+05:30",
    lines: [line("MAT-0920", 45, 45), line("MAT-0921", 20, 20)],
    hasProcurementRequest: true,
  }),
  indent({
    id: "IND-02429",
    projectId: "sita-crest",
    requestedById: "usr-manoj-verma",
    priority: "medium",
    status: "approved",
    requiredDate: "2026-09-25",
    purpose: "Solar PV material from imported solar category",
    workLocation: "Tower 1 - roof solar yard",
    createdAt: "2026-09-08T11:00:00+05:30",
    updatedAt: "2026-09-09T10:00:00+05:30",
    lines: [line("MAT-1174", 24, 24), line("MAT-1178", 300, 300)],
    hasProcurementRequest: true,
  }),
  indent({
    id: "IND-02430",
    projectId: "sita-riviera",
    requestedById: "usr-manoj-verma",
    priority: "low",
    status: "completed",
    requiredDate: "2026-09-05",
    purpose: "Sanitary finishing materials for handover snag closure",
    workLocation: "Block C - typical toilets",
    createdAt: "2026-08-28T09:00:00+05:30",
    updatedAt: "2026-09-06T16:00:00+05:30",
    lines: [line("MAT-0550", 60, 60)],
    hasProcurementRequest: true,
  }),
];
const mockIndents = indentsSchema.parse(RAW_INDENTS);

function matchesSearch(record, search) {
  if (!search) return true;
  const haystack = [
    record.id,
    record.projectName,
    record.purpose,
    record.workLocation,
    ...record.lines.map((entry) => entry.materialName),
  ]
    .join(" ")
    .toLocaleLowerCase();
  return haystack.includes(search.toLocaleLowerCase());
}
function compareIndents(first, second, field) {
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
export const mockIndentsAdapter = {
  list(params, options) {
    options?.signal?.throwIfAborted();
    const filtered = mockIndents.filter(
      (record) =>
        (!params.projectId || record.projectId === params.projectId) &&
        (!params.status || record.status === params.status) &&
        (!params.priority || record.priority === params.priority) &&
        matchesSearch(record, params.search),
    );
    const direction = params.sortDirection === "asc" ? 1 : -1;
    const sorted = [...filtered].sort(
      (first, second) =>
        compareIndents(first, second, params.sortBy) * direction,
    );
    const start = (params.page - 1) * params.pageSize;
    return {
      items: sorted.slice(start, start + params.pageSize),
      total: sorted.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  },
  get(indentId) {
    return mockIndents.find((record) => record.id === indentId) ?? null;
  },
  listAll() {
    return mockIndents;
  },
};
export function createIndentsService(adapter) {
  return {
    list(params = {}, options = {}) {
      const normalizedParams = indentListParamsSchema.parse(params);
      const result = adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return indentListResultSchema.parse(result);
    },
    get(indentId) {
      const record = adapter.get(indentId);
      return record ? indentSchema.parse(record) : null;
    },
    listAll() {
      return adapter.listAll();
    },
    /** Validate a locally raised indent until backend persistence is added. */
    create(payload) {
      return { ...payload, id: `IND-PENDING-${Date.now()}` };
    },
  };
}
export const indentsService = createIndentsService(mockIndentsAdapter);

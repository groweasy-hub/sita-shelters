import { getMaterialByCode } from "@/lib/mock-data/materials";
import { getProjectName } from "@/lib/mock-data/projects";
import { getUserName } from "@/lib/mock-data/users";
import {
  materialIssueListParamsSchema,
  materialIssueListResultSchema,
  materialIssuesSchema,
} from "../schemas/material-issues.schema";

function deriveStatus(issuedQuantity, consumedQuantity, returnedQuantity) {
  if (consumedQuantity === 0 && returnedQuantity === 0) return "issued";
  if (consumedQuantity >= issuedQuantity) return "consumed";
  if (
    consumedQuantity + returnedQuantity >= issuedQuantity &&
    returnedQuantity > 0
  )
    return "returned";
  return "partially-consumed";
}

/**
 * Hand-authored so the workflow numbers stay internally consistent:
 * `consumedQuantity` and `returnedQuantity` here are the running totals that
 * the Consumption and Returns datasets in their own features are authored to
 * sum to for this issue id (`consumedQuantity + returnedQuantity <=
 * issuedQuantity` always holds).
 */
const ISSUE_SEEDS = [
  {
    id: "ISS-00001",
    projectId: "sita-heights",
    materialCode: "CEM-OPC-53",
    issuedQuantity: 500,
    consumedQuantity: 500,
    returnedQuantity: 0,
    recipientName: "Foundation Crew - Team B",
    purpose: "Foundation work - raft slab",
    workLocation: "Tower A - Basement",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-06-02T09:00:00.000Z",
  },
  {
    id: "ISS-00002",
    projectId: "sita-heights",
    materialCode: "STL-TMT-16",
    issuedQuantity: 8,
    consumedQuantity: 5,
    returnedQuantity: 1,
    recipientName: "RCC Crew - Team A",
    purpose: "Column reinforcement",
    workLocation: "Tower A - Ground Floor",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-06-04T09:30:00.000Z",
  },
  {
    id: "ISS-00003",
    projectId: "sita-heights",
    materialCode: "SND-RIV-01",
    issuedQuantity: 40,
    consumedQuantity: 30,
    returnedQuantity: 10,
    recipientName: "Masonry Crew - Team C",
    purpose: "Plastering work",
    workLocation: "Tower B - 3rd Floor",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-06-06T10:00:00.000Z",
  },
  {
    id: "ISS-00004",
    projectId: "sita-heights",
    materialCode: "AGG-20MM",
    issuedQuantity: 30,
    consumedQuantity: 20,
    returnedQuantity: 7,
    recipientName: "Concrete Crew - Team A",
    purpose: "Slab casting",
    workLocation: "Tower A - 2nd Floor",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-06-09T08:45:00.000Z",
  },
  {
    id: "ISS-00005",
    projectId: "sita-heights",
    materialCode: "ELE-CAB-4C",
    issuedQuantity: 300,
    consumedQuantity: 0,
    returnedQuantity: 50,
    recipientName: "Electrical Crew - Team A",
    purpose: "Main distribution wiring",
    workLocation: "Tower A - Electrical Shaft",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-06-11T11:15:00.000Z",
  },
  {
    id: "ISS-00006",
    projectId: "sita-heights",
    materialCode: "PLB-PVC-110",
    issuedQuantity: 20,
    consumedQuantity: 20,
    returnedQuantity: 0,
    recipientName: "Plumbing Crew - Team A",
    purpose: "Soil & waste piping",
    workLocation: "Tower A - Basement",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-06-13T09:00:00.000Z",
  },
  {
    id: "ISS-00007",
    projectId: "sita-enclave",
    materialCode: "CEM-PPC-01",
    issuedQuantity: 350,
    consumedQuantity: 350,
    returnedQuantity: 0,
    recipientName: "Foundation Crew - Team D",
    purpose: "Retaining wall work",
    workLocation: "Block 2 - Podium",
    issuedById: "usr-vikram-shetty",
    issuedAt: "2026-06-20T09:00:00.000Z",
  },
  {
    id: "ISS-00008",
    projectId: "sita-enclave",
    materialCode: "STL-TMT-12",
    issuedQuantity: 6,
    consumedQuantity: 4,
    returnedQuantity: 2,
    recipientName: "RCC Crew - Team B",
    purpose: "Beam reinforcement",
    workLocation: "Block 1 - 4th Floor",
    issuedById: "usr-vikram-shetty",
    issuedAt: "2026-06-22T10:30:00.000Z",
  },
  {
    id: "ISS-00009",
    projectId: "sita-enclave",
    materialCode: "SND-MFG-01",
    issuedQuantity: 35,
    consumedQuantity: 20,
    returnedQuantity: 5,
    recipientName: "Masonry Crew - Team E",
    purpose: "Block work",
    workLocation: "Block 2 - 1st Floor",
    issuedById: "usr-vikram-shetty",
    issuedAt: "2026-06-24T09:15:00.000Z",
  },
  {
    id: "ISS-00010",
    projectId: "sita-enclave",
    materialCode: "BRK-FLY-01",
    issuedQuantity: 4000,
    consumedQuantity: 3500,
    returnedQuantity: 300,
    recipientName: "Masonry Crew - Team E",
    purpose: "External wall masonry",
    workLocation: "Block 2 - 2nd Floor",
    issuedById: "usr-vikram-shetty",
    issuedAt: "2026-06-26T08:30:00.000Z",
  },
  {
    id: "ISS-00011",
    projectId: "sita-enclave",
    materialCode: "ELE-SW-1G",
    issuedQuantity: 100,
    consumedQuantity: 0,
    returnedQuantity: 0,
    recipientName: "Electrical Crew - Team B",
    purpose: "Switch & socket installation",
    workLocation: "Block 1 - 3rd Floor",
    issuedById: "usr-vikram-shetty",
    issuedAt: "2026-06-28T11:00:00.000Z",
  },
  {
    id: "ISS-00012",
    projectId: "sita-greens",
    materialCode: "CEM-OPC-53",
    issuedQuantity: 200,
    consumedQuantity: 200,
    returnedQuantity: 0,
    recipientName: "Foundation Crew - Team F",
    purpose: "Villa foundation work",
    workLocation: "Cluster 1 - Villa 4",
    issuedById: "usr-vikram-shetty",
    issuedAt: "2026-07-05T09:00:00.000Z",
  },
  {
    id: "ISS-00013",
    projectId: "sita-greens",
    materialCode: "AGG-10MM",
    issuedQuantity: 25,
    consumedQuantity: 10,
    returnedQuantity: 5,
    recipientName: "Concrete Crew - Team F",
    purpose: "Pathway concreting",
    workLocation: "Cluster 1 - Internal Roads",
    issuedById: "usr-vikram-shetty",
    issuedAt: "2026-07-07T09:45:00.000Z",
  },
  {
    id: "ISS-00014",
    projectId: "sita-grove",
    materialCode: "STL-TMT-08",
    issuedQuantity: 5,
    consumedQuantity: 3,
    returnedQuantity: 2,
    recipientName: "RCC Crew - Team C",
    purpose: "Slab reinforcement",
    workLocation: "Phase II - 6th Floor",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-07-12T09:00:00.000Z",
  },
  {
    id: "ISS-00015",
    projectId: "sita-grove",
    materialCode: "PLY-SHT-18",
    issuedQuantity: 60,
    consumedQuantity: 50,
    returnedQuantity: 5,
    recipientName: "Carpentry Crew - Team A",
    purpose: "Shuttering work",
    workLocation: "Phase II - 7th Floor",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-07-14T10:15:00.000Z",
  },
  {
    id: "ISS-00016",
    projectId: "sita-grove",
    materialCode: "FIN-TIL-600",
    issuedQuantity: 80,
    consumedQuantity: 80,
    returnedQuantity: 0,
    recipientName: "Finishing Crew - Team A",
    purpose: "Flooring work",
    workLocation: "Phase II - 2nd Floor",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-07-16T09:30:00.000Z",
  },
  {
    id: "ISS-00017",
    projectId: "sita-grove",
    materialCode: "FIN-PNT-EM",
    issuedQuantity: 150,
    consumedQuantity: 0,
    returnedQuantity: 30,
    recipientName: "Finishing Crew - Team B",
    purpose: "Interior painting",
    workLocation: "Phase II - 1st Floor",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-07-18T09:00:00.000Z",
  },
  {
    id: "ISS-00018",
    projectId: "sita-meridian",
    materialCode: "STL-BWR-01",
    issuedQuantity: 150,
    consumedQuantity: 100,
    returnedQuantity: 30,
    recipientName: "RCC Crew - Team D",
    purpose: "Rebar tying",
    workLocation: "Block 1 - 5th Floor",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-07-25T09:00:00.000Z",
  },
  {
    id: "ISS-00019",
    projectId: "sita-meridian",
    materialCode: "PLB-CPVC-25",
    issuedQuantity: 45,
    consumedQuantity: 45,
    returnedQuantity: 0,
    recipientName: "Plumbing Crew - Team B",
    purpose: "Hot & cold water lines",
    workLocation: "Block 1 - 3rd Floor",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-07-27T10:00:00.000Z",
  },
  {
    id: "ISS-00020",
    projectId: "sita-meridian",
    materialCode: "PLB-FIT-ELB",
    issuedQuantity: 60,
    consumedQuantity: 0,
    returnedQuantity: 10,
    recipientName: "Plumbing Crew - Team B",
    purpose: "Pipe fitting work",
    workLocation: "Block 1 - 3rd Floor",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-07-29T09:00:00.000Z",
  },
  {
    id: "ISS-00021",
    projectId: "sita-crest",
    materialCode: "ELE-CAB-2C",
    issuedQuantity: 400,
    consumedQuantity: 350,
    returnedQuantity: 50,
    recipientName: "Electrical Crew - Team C",
    purpose: "Sub-circuit wiring",
    workLocation: "Tower 1 - 8th Floor",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-08-03T09:00:00.000Z",
  },
  {
    id: "ISS-00022",
    projectId: "sita-crest",
    materialCode: "ELE-SB-08M",
    issuedQuantity: 25,
    consumedQuantity: 15,
    returnedQuantity: 0,
    recipientName: "Electrical Crew - Team C",
    purpose: "Switchboard installation",
    workLocation: "Tower 1 - 8th Floor",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-08-05T10:30:00.000Z",
  },
  {
    id: "ISS-00023",
    projectId: "sita-crest",
    materialCode: "FIR-PIP-150",
    issuedQuantity: 10,
    consumedQuantity: 10,
    returnedQuantity: 0,
    recipientName: "Fire Fighting Crew - Team A",
    purpose: "Sprinkler riser installation",
    workLocation: "Tower 1 - Fire Shaft",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-08-07T09:00:00.000Z",
  },
  {
    id: "ISS-00024",
    projectId: "sita-orchid",
    materialCode: "FIR-SPR-15",
    issuedQuantity: 70,
    consumedQuantity: 0,
    returnedQuantity: 15,
    recipientName: "Fire Fighting Crew - Team B",
    purpose: "Sprinkler head installation",
    workLocation: "Block A - 2nd Floor",
    issuedById: "usr-vikram-shetty",
    issuedAt: "2026-08-12T09:00:00.000Z",
  },
  {
    id: "ISS-00025",
    projectId: "sita-orchid",
    materialCode: "FIN-DOR-FL",
    issuedQuantity: 15,
    consumedQuantity: 10,
    returnedQuantity: 5,
    recipientName: "Carpentry Crew - Team B",
    purpose: "Door installation",
    workLocation: "Block A - 1st Floor",
    issuedById: "usr-vikram-shetty",
    issuedAt: "2026-08-14T10:00:00.000Z",
  },
  {
    id: "ISS-00026",
    projectId: "sita-riviera",
    materialCode: "EQP-TL-SCF",
    issuedQuantity: 6,
    consumedQuantity: 6,
    returnedQuantity: 0,
    recipientName: "Maintenance Crew - Team A",
    purpose: "Facade touch-up scaffolding",
    workLocation: "Tower - Exterior",
    issuedById: "usr-vikram-shetty",
    issuedAt: "2026-08-20T09:00:00.000Z",
  },
  {
    id: "ISS-00027",
    projectId: "sita-heights",
    materialCode: "MAT-0150",
    issuedQuantity: 160,
    consumedQuantity: 150,
    returnedQuantity: 10,
    recipientName: "RCC Crew - Imported Master Sample",
    purpose: "Tower C slab pour using imported material master cement",
    workLocation: "Tower C - 9th floor slab",
    issuedById: "usr-bharathi-store-manager",
    issuedAt: "2026-09-13T09:00:00.000Z",
  },
  {
    id: "ISS-00028",
    projectId: "sita-heights",
    materialCode: "MAT-0178",
    issuedQuantity: 3,
    consumedQuantity: 2,
    returnedQuantity: 1,
    recipientName: "RCC Crew - Imported Master Sample",
    purpose: "Slab reinforcement tying with 6 mm TMT",
    workLocation: "Tower C - 9th floor slab",
    issuedById: "usr-bharathi-store-manager",
    issuedAt: "2026-09-13T09:30:00.000Z",
  },
  {
    id: "ISS-00029",
    projectId: "sita-enclave",
    materialCode: "MAT-0225",
    issuedQuantity: 1800,
    consumedQuantity: 1500,
    returnedQuantity: 200,
    recipientName: "Masonry Crew - AAC Team",
    purpose: "Internal wall blockwork using imported AAC block material",
    workLocation: "Block B - 4th floor",
    issuedById: "usr-vikram-shetty",
    issuedAt: "2026-09-10T09:00:00.000Z",
  },
  {
    id: "ISS-00030",
    projectId: "sita-grove",
    materialCode: "MAT-0260",
    issuedQuantity: 120,
    consumedQuantity: 90,
    returnedQuantity: 20,
    recipientName: "Waterproofing Crew - Terrace Team",
    purpose: "Clubhouse terrace membrane application",
    workLocation: "Clubhouse terrace",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-09-11T10:00:00.000Z",
  },
  {
    id: "ISS-00031",
    projectId: "sita-meridian",
    materialCode: "MAT-0920",
    issuedQuantity: 25,
    consumedQuantity: 15,
    returnedQuantity: 5,
    recipientName: "Fire Alarm Crew - ELV Team",
    purpose: "Fire alarm sounder strobe installation",
    workLocation: "Block 1 - fire command room",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-09-14T09:00:00.000Z",
  },
  {
    id: "ISS-00032",
    projectId: "sita-riviera",
    materialCode: "MAT-0550",
    issuedQuantity: 50,
    consumedQuantity: 45,
    returnedQuantity: 5,
    recipientName: "Plumbing Snag Crew",
    purpose: "Waste coupling replacement for handover snag list",
    workLocation: "Block C - toilets",
    issuedById: "usr-vikram-shetty",
    issuedAt: "2026-09-04T10:00:00.000Z",
  },
  {
    id: "ISS-00033",
    projectId: "sita-crest",
    materialCode: "MAT-1174",
    issuedQuantity: 12,
    consumedQuantity: 8,
    returnedQuantity: 0,
    recipientName: "Solar Installation Crew",
    purpose: "Solar PV module installation",
    workLocation: "Tower 1 - roof solar yard",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-09-16T09:00:00.000Z",
  },
  {
    id: "ISS-00034",
    projectId: "sita-crest",
    materialCode: "MAT-1178",
    issuedQuantity: 120,
    consumedQuantity: 0,
    returnedQuantity: 0,
    recipientName: "Solar Installation Crew",
    purpose: "DC cable routing for PV modules",
    workLocation: "Tower 1 - roof solar yard",
    issuedById: "usr-priyanka-das",
    issuedAt: "2026-09-17T09:00:00.000Z",
  },
];

function buildMaterialIssues() {
  return ISSUE_SEEDS.map((seed) => {
    const material = getMaterialByCode(seed.materialCode);
    return {
      id: seed.id,
      projectId: seed.projectId,
      projectName: getProjectName(seed.projectId),
      materialCode: seed.materialCode,
      materialName: material?.name ?? seed.materialCode,
      unit: material?.unit ?? "",
      issuedQuantity: seed.issuedQuantity,
      consumedQuantity: seed.consumedQuantity,
      returnedQuantity: seed.returnedQuantity,
      recipientName: seed.recipientName,
      department: material?.category ?? "civil",
      purpose: seed.purpose,
      workLocation: seed.workLocation,
      issuedById: seed.issuedById,
      issuedByName: getUserName(seed.issuedById),
      issuedAt: seed.issuedAt,
      status: deriveStatus(
        seed.issuedQuantity,
        seed.consumedQuantity,
        seed.returnedQuantity,
      ),
    };
  });
}
const mockMaterialIssues = materialIssuesSchema.parse(buildMaterialIssues());

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

/**
 * Deterministic in-memory placeholder. Replace it with an HTTP implementation
 * mirroring the inventory adapter's shape; the service and query hook need no
 * transport changes.
 */
export const mockMaterialIssuesAdapter = {
  list(params, options) {
    options?.signal?.throwIfAborted();
    const filteredItems = mockMaterialIssues.filter(
      (item) =>
        (params.projectId === null || item.projectId === params.projectId) &&
        (params.status === null || item.status === params.status) &&
        (params.department === null || item.department === params.department) &&
        matchesSearch(item, params.search),
    );
    const direction = params.sortDirection === "asc" ? 1 : -1;
    const sortedItems = [...filteredItems].sort(
      (first, second) =>
        compareIssues(first, second, params.sortBy) * direction,
    );
    const start = (params.page - 1) * params.pageSize;
    return {
      items: sortedItems.slice(start, start + params.pageSize),
      total: sortedItems.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  },
  /** Non-paginated accessor used by the Consumption and Returns features to
   * resolve their `materialIssueId` references without duplicating data. */
  listAll() {
    return mockMaterialIssues;
  },
  getById(issueId) {
    return mockMaterialIssues.find((item) => item.id === issueId) ?? null;
  },
};
export function createMaterialIssuesService(adapter) {
  return {
    list(params = {}, options = {}) {
      const normalizedParams = materialIssueListParamsSchema.parse(params);
      const result = adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return materialIssueListResultSchema.parse(result);
    },
    listAll() {
      return adapter.listAll();
    },
    getById(issueId) {
      return adapter.getById(issueId);
    },
  };
}
export const materialIssuesService = createMaterialIssuesService(
  mockMaterialIssuesAdapter,
);

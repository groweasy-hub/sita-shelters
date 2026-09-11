import { materialIssuesService } from "@/features/material-issues";
import { getMaterialByCode } from "@/lib/mock-data/materials";
import { getSubcategoryName } from "@/lib/mock-data/material-categories";
import { getUserName } from "@/lib/mock-data/users";
import {
  consumptionEntriesSchema,
  consumptionListParamsSchema,
  consumptionListResultSchema,
} from "../schemas/consumption.schema";

/** Adds a whole number of days to a static ISO date. Deterministic; safe at module scope. */
function addDays(isoDate, days) {
  const date = new Date(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

/**
 * Hand-authored against the Material Issues dataset: for every
 * `materialIssueId`, the sum of `quantityConsumed` across these entries
 * equals that issue's `consumedQuantity` running total, so consumption never
 * exceeds what was issued.
 */
const CONSUMPTION_SEEDS = [
  {
    id: "CON-00001",
    materialIssueId: "ISS-00001",
    quantityConsumed: 300,
    activity: "Raft foundation casting - Phase 1",
    location: "Tower A - Basement",
    recordedById: "usr-rahul-iyer",
    consumedAtOffsetDays: 3,
  },
  {
    id: "CON-00002",
    materialIssueId: "ISS-00001",
    quantityConsumed: 200,
    activity: "Raft foundation casting - Phase 2",
    location: "Tower A - Basement",
    recordedById: "usr-rahul-iyer",
    consumedAtOffsetDays: 6,
  },
  {
    id: "CON-00003",
    materialIssueId: "ISS-00002",
    quantityConsumed: 3,
    activity: "Column reinforcement - Grid A1-A4",
    location: "Tower A - Ground Floor",
    recordedById: "usr-rahul-iyer",
    consumedAtOffsetDays: 4,
  },
  {
    id: "CON-00004",
    materialIssueId: "ISS-00002",
    quantityConsumed: 2,
    activity: "Column reinforcement - Grid A5-A8",
    location: "Tower A - Ground Floor",
    recordedById: "usr-rahul-iyer",
    consumedAtOffsetDays: 9,
  },
  {
    id: "CON-00005",
    materialIssueId: "ISS-00003",
    quantityConsumed: 15,
    activity: "Plastering - Tower B 3rd floor east wing",
    location: "Tower B - 3rd Floor",
    recordedById: "usr-rahul-iyer",
    consumedAtOffsetDays: 5,
  },
  {
    id: "CON-00006",
    materialIssueId: "ISS-00003",
    quantityConsumed: 15,
    activity: "Plastering - Tower B 3rd floor west wing",
    location: "Tower B - 3rd Floor",
    recordedById: "usr-rahul-iyer",
    consumedAtOffsetDays: 9,
  },
  {
    id: "CON-00007",
    materialIssueId: "ISS-00004",
    quantityConsumed: 12,
    activity: "Slab casting - Tower A 2nd floor Bay 1",
    location: "Tower A - 2nd Floor",
    recordedById: "usr-rahul-iyer",
    consumedAtOffsetDays: 3,
  },
  {
    id: "CON-00008",
    materialIssueId: "ISS-00004",
    quantityConsumed: 8,
    activity: "Slab casting - Tower A 2nd floor Bay 2",
    location: "Tower A - 2nd Floor",
    recordedById: "usr-rahul-iyer",
    consumedAtOffsetDays: 7,
  },
  {
    id: "CON-00009",
    materialIssueId: "ISS-00006",
    quantityConsumed: 12,
    activity: "Soil pipe laying - Basement Zone 1",
    location: "Tower A - Basement",
    recordedById: "usr-rahul-iyer",
    consumedAtOffsetDays: 4,
  },
  {
    id: "CON-00010",
    materialIssueId: "ISS-00006",
    quantityConsumed: 8,
    activity: "Soil pipe laying - Basement Zone 2",
    location: "Tower A - Basement",
    recordedById: "usr-rahul-iyer",
    consumedAtOffsetDays: 8,
  },
  {
    id: "CON-00011",
    materialIssueId: "ISS-00007",
    quantityConsumed: 200,
    activity: "Retaining wall casting - Segment 1",
    location: "Block 2 - Podium",
    recordedById: "usr-divya-menon",
    consumedAtOffsetDays: 4,
  },
  {
    id: "CON-00012",
    materialIssueId: "ISS-00007",
    quantityConsumed: 150,
    activity: "Retaining wall casting - Segment 2",
    location: "Block 2 - Podium",
    recordedById: "usr-divya-menon",
    consumedAtOffsetDays: 8,
  },
  {
    id: "CON-00013",
    materialIssueId: "ISS-00008",
    quantityConsumed: 4,
    activity: "Beam reinforcement - Block 1 4th floor",
    location: "Block 1 - 4th Floor",
    recordedById: "usr-divya-menon",
    consumedAtOffsetDays: 5,
  },
  {
    id: "CON-00014",
    materialIssueId: "ISS-00009",
    quantityConsumed: 12,
    activity: "Block work - Block 2 1st floor North",
    location: "Block 2 - 1st Floor",
    recordedById: "usr-divya-menon",
    consumedAtOffsetDays: 3,
  },
  {
    id: "CON-00015",
    materialIssueId: "ISS-00009",
    quantityConsumed: 8,
    activity: "Block work - Block 2 1st floor South",
    location: "Block 2 - 1st Floor",
    recordedById: "usr-divya-menon",
    consumedAtOffsetDays: 7,
  },
  {
    id: "CON-00016",
    materialIssueId: "ISS-00010",
    quantityConsumed: 2500,
    activity: "External wall masonry - Elevation A",
    location: "Block 2 - 2nd Floor",
    recordedById: "usr-divya-menon",
    consumedAtOffsetDays: 4,
  },
  {
    id: "CON-00017",
    materialIssueId: "ISS-00010",
    quantityConsumed: 1000,
    activity: "External wall masonry - Elevation B",
    location: "Block 2 - 2nd Floor",
    recordedById: "usr-divya-menon",
    consumedAtOffsetDays: 9,
  },
  {
    id: "CON-00018",
    materialIssueId: "ISS-00012",
    quantityConsumed: 200,
    activity: "Villa foundation casting - Villa 4",
    location: "Cluster 1 - Villa 4",
    recordedById: "usr-suresh-babu",
    consumedAtOffsetDays: 4,
  },
  {
    id: "CON-00019",
    materialIssueId: "ISS-00013",
    quantityConsumed: 6,
    activity: "Pathway concreting - Segment 1",
    location: "Cluster 1 - Internal Roads",
    recordedById: "usr-suresh-babu",
    consumedAtOffsetDays: 3,
  },
  {
    id: "CON-00020",
    materialIssueId: "ISS-00013",
    quantityConsumed: 4,
    activity: "Pathway concreting - Segment 2",
    location: "Cluster 1 - Internal Roads",
    recordedById: "usr-suresh-babu",
    consumedAtOffsetDays: 6,
  },
  {
    id: "CON-00021",
    materialIssueId: "ISS-00014",
    quantityConsumed: 3,
    activity: "Slab reinforcement - Phase II 6th floor",
    location: "Phase II - 6th Floor",
    recordedById: "usr-suresh-babu",
    consumedAtOffsetDays: 4,
  },
  {
    id: "CON-00022",
    materialIssueId: "ISS-00015",
    quantityConsumed: 30,
    activity: "Shuttering - Phase II 7th floor Bay 1",
    location: "Phase II - 7th Floor",
    recordedById: "usr-suresh-babu",
    consumedAtOffsetDays: 3,
  },
  {
    id: "CON-00023",
    materialIssueId: "ISS-00015",
    quantityConsumed: 20,
    activity: "Shuttering - Phase II 7th floor Bay 2",
    location: "Phase II - 7th Floor",
    recordedById: "usr-suresh-babu",
    consumedAtOffsetDays: 7,
  },
  {
    id: "CON-00024",
    materialIssueId: "ISS-00016",
    quantityConsumed: 80,
    activity: "Flooring - Phase II 2nd floor",
    location: "Phase II - 2nd Floor",
    recordedById: "usr-suresh-babu",
    consumedAtOffsetDays: 5,
  },
  {
    id: "CON-00025",
    materialIssueId: "ISS-00018",
    quantityConsumed: 60,
    activity: "Rebar tying - Block 1 5th floor Grid 1-4",
    location: "Block 1 - 5th Floor",
    recordedById: "usr-sneha-kapoor",
    consumedAtOffsetDays: 3,
  },
  {
    id: "CON-00026",
    materialIssueId: "ISS-00018",
    quantityConsumed: 40,
    activity: "Rebar tying - Block 1 5th floor Grid 5-8",
    location: "Block 1 - 5th Floor",
    recordedById: "usr-sneha-kapoor",
    consumedAtOffsetDays: 7,
  },
  {
    id: "CON-00027",
    materialIssueId: "ISS-00019",
    quantityConsumed: 45,
    activity: "Hot & cold water piping - Block 1 3rd floor",
    location: "Block 1 - 3rd Floor",
    recordedById: "usr-sneha-kapoor",
    consumedAtOffsetDays: 4,
  },
  {
    id: "CON-00028",
    materialIssueId: "ISS-00021",
    quantityConsumed: 250,
    activity: "Sub-circuit wiring - 8th floor East",
    location: "Tower 1 - 8th Floor",
    recordedById: "usr-manoj-verma",
    consumedAtOffsetDays: 4,
  },
  {
    id: "CON-00029",
    materialIssueId: "ISS-00021",
    quantityConsumed: 100,
    activity: "Sub-circuit wiring - 8th floor West",
    location: "Tower 1 - 8th Floor",
    recordedById: "usr-manoj-verma",
    consumedAtOffsetDays: 8,
  },
  {
    id: "CON-00030",
    materialIssueId: "ISS-00022",
    quantityConsumed: 9,
    activity: "Switchboard installation - 8th floor Wing A",
    location: "Tower 1 - 8th Floor",
    recordedById: "usr-manoj-verma",
    consumedAtOffsetDays: 3,
  },
  {
    id: "CON-00031",
    materialIssueId: "ISS-00022",
    quantityConsumed: 6,
    activity: "Switchboard installation - 8th floor Wing B",
    location: "Tower 1 - 8th Floor",
    recordedById: "usr-manoj-verma",
    consumedAtOffsetDays: 6,
  },
  {
    id: "CON-00032",
    materialIssueId: "ISS-00023",
    quantityConsumed: 10,
    activity: "Sprinkler riser installation - Fire shaft",
    location: "Tower 1 - Fire Shaft",
    recordedById: "usr-manoj-verma",
    consumedAtOffsetDays: 3,
  },
  {
    id: "CON-00033",
    materialIssueId: "ISS-00025",
    quantityConsumed: 10,
    activity: "Door installation - Block A 1st floor",
    location: "Block A - 1st Floor",
    recordedById: "usr-sneha-kapoor",
    consumedAtOffsetDays: 4,
  },
  {
    id: "CON-00034",
    materialIssueId: "ISS-00026",
    quantityConsumed: 6,
    activity: "Facade scaffolding erection",
    location: "Tower - Exterior",
    recordedById: "usr-manoj-verma",
    consumedAtOffsetDays: 3,
  },
  {
    id: "CON-00035",
    materialIssueId: "ISS-00027",
    quantityConsumed: 90,
    activity: "Imported cement used in slab pour - bay 1",
    location: "Tower C - 9th floor slab",
    recordedById: "usr-ashok",
    consumedAtOffsetDays: 1,
  },
  {
    id: "CON-00036",
    materialIssueId: "ISS-00027",
    quantityConsumed: 60,
    activity: "Imported cement used in slab pour - bay 2",
    location: "Tower C - 9th floor slab",
    recordedById: "usr-ashok",
    consumedAtOffsetDays: 2,
  },
  {
    id: "CON-00037",
    materialIssueId: "ISS-00028",
    quantityConsumed: 2,
    activity: "6 mm TMT used for slab distribution steel",
    location: "Tower C - 9th floor slab",
    recordedById: "usr-ashok",
    consumedAtOffsetDays: 2,
  },
  {
    id: "CON-00038",
    materialIssueId: "ISS-00029",
    quantityConsumed: 1500,
    activity: "AAC blockwork for internal partitions",
    location: "Block B - 4th floor",
    recordedById: "usr-divya-menon",
    consumedAtOffsetDays: 3,
  },
  {
    id: "CON-00039",
    materialIssueId: "ISS-00030",
    quantityConsumed: 90,
    activity: "APP membrane application on clubhouse terrace",
    location: "Clubhouse terrace",
    recordedById: "usr-suresh-babu",
    consumedAtOffsetDays: 2,
  },
  {
    id: "CON-00040",
    materialIssueId: "ISS-00031",
    quantityConsumed: 15,
    activity: "Sounder strobe installation and device mounting",
    location: "Block 1 - fire command room",
    recordedById: "usr-sneha-kapoor",
    consumedAtOffsetDays: 2,
  },
  {
    id: "CON-00041",
    materialIssueId: "ISS-00032",
    quantityConsumed: 45,
    activity: "Waste coupling replacement for snag closure",
    location: "Block C - toilets",
    recordedById: "usr-manoj-verma",
    consumedAtOffsetDays: 1,
  },
  {
    id: "CON-00042",
    materialIssueId: "ISS-00033",
    quantityConsumed: 8,
    activity: "Solar panel mounting on roof frame",
    location: "Tower 1 - roof solar yard",
    recordedById: "usr-manoj-verma",
    consumedAtOffsetDays: 2,
  },
];

function buildConsumptionEntries() {
  return CONSUMPTION_SEEDS.map((seed) => {
    const issue = materialIssuesService.getById(seed.materialIssueId);
    const material = getMaterialByCode(issue?.materialCode ?? "");
    return {
      id: seed.id,
      materialIssueId: seed.materialIssueId,
      projectId: issue?.projectId ?? "",
      projectName: issue?.projectName ?? "",
      materialCode: issue?.materialCode ?? "",
      materialName: issue?.materialName ?? "",
      categoryId: material?.category ?? "civil",
      category: material
        ? getSubcategoryName(material.category, material.subcategory)
        : "",
      unit: issue?.unit ?? "",
      quantityConsumed: seed.quantityConsumed,
      activity: seed.activity,
      location: seed.location,
      recordedById: seed.recordedById,
      recordedByName: getUserName(seed.recordedById),
      consumedAt: addDays(
        issue?.issuedAt ?? "2026-01-01T00:00:00.000Z",
        seed.consumedAtOffsetDays,
      ),
    };
  });
}
const mockConsumptionEntries = consumptionEntriesSchema.parse(
  buildConsumptionEntries(),
);

function compareEntries(first, second, field) {
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
    item.activity,
    item.location,
    item.recordedByName,
  ]
    .join(" ")
    .toLocaleLowerCase();
  return searchableText.includes(search.toLocaleLowerCase());
}

/** Deterministic in-memory placeholder mirroring the inventory adapter shape. */
export const mockConsumptionAdapter = {
  list(params, options) {
    options?.signal?.throwIfAborted();
    const filteredItems = mockConsumptionEntries.filter(
      (item) =>
        (params.projectId === null || item.projectId === params.projectId) &&
        (params.categoryId === null || item.categoryId === params.categoryId) &&
        matchesSearch(item, params.search),
    );
    const direction = params.sortDirection === "asc" ? 1 : -1;
    const sortedItems = [...filteredItems].sort(
      (first, second) =>
        compareEntries(first, second, params.sortBy) * direction,
    );
    const start = (params.page - 1) * params.pageSize;
    return {
      items: sortedItems.slice(start, start + params.pageSize),
      total: sortedItems.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  },
  /** Non-paginated accessor used by trend panels and cross-feature reads. */
  listAll() {
    return mockConsumptionEntries;
  },
};
export function createConsumptionService(adapter) {
  return {
    list(params = {}, options = {}) {
      const normalizedParams = consumptionListParamsSchema.parse(params);
      const result = adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return consumptionListResultSchema.parse(result);
    },
    listAll() {
      return adapter.listAll();
    },
  };
}
export const consumptionService = createConsumptionService(
  mockConsumptionAdapter,
);

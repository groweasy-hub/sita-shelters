import { materialIssuesService } from "@/features/material-issues";
import { getUserName } from "@/lib/mock-data/users";
import {
  returnListParamsSchema,
  returnListResultSchema,
  returnRecordsSchema,
} from "../schemas/returns.schema";

/** Adds a whole number of days to a static ISO date. Deterministic; safe at module scope. */
function addDays(isoDate, days) {
  const date = new Date(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

/**
 * Hand-authored against the Material Issues dataset: for every
 * `materialIssueId`, the sum of `returningQuantity` across these records
 * equals that issue's `returnedQuantity` running total, and every
 * `goodQuantity + damagedQuantity` stays within its own `returningQuantity`.
 */
const RETURN_SEEDS = [
  {
    id: "RET-00001",
    materialIssueId: "ISS-00002",
    returningQuantity: 1,
    reason: "unused-material",
    returnedById: "usr-rahul-iyer",
    returnedAtOffsetDays: 12,
    inspection: {
      status: "good",
      goodQuantity: 1,
      damagedQuantity: 0,
      inspectedById: "usr-ritu-agarwal",
      inspectedAtOffsetDays: 15,
      remarks:
        "Received in original condition; restocked to available inventory.",
    },
  },
  {
    id: "RET-00002",
    materialIssueId: "ISS-00003",
    returningQuantity: 10,
    reason: "work-completed",
    returnedById: "usr-rahul-iyer",
    returnedAtOffsetDays: 12,
    inspection: {
      status: "good",
      goodQuantity: 10,
      damagedQuantity: 0,
      inspectedById: "usr-ritu-agarwal",
      inspectedAtOffsetDays: 15,
      remarks: "Sand bags intact and dry; restocked to available inventory.",
    },
  },
  {
    id: "RET-00003",
    materialIssueId: "ISS-00004",
    returningQuantity: 5,
    reason: "excess-material",
    returnedById: "usr-rahul-iyer",
    returnedAtOffsetDays: 10,
    inspection: {
      status: "damaged",
      goodQuantity: 3,
      damagedQuantity: 2,
      inspectedById: "usr-ritu-agarwal",
      inspectedAtOffsetDays: 14,
      remarks: "Part of the load contaminated with debris during site storage.",
    },
  },
  {
    id: "RET-00004",
    materialIssueId: "ISS-00004",
    returningQuantity: 2,
    reason: "unused-material",
    returnedById: "usr-rahul-iyer",
    returnedAtOffsetDays: 13,
    inspection: {
      status: "pending-inspection",
      goodQuantity: 0,
      damagedQuantity: 0,
      inspectedById: null,
      inspectedAtOffsetDays: null,
      remarks: "Awaiting quality inspector sign-off.",
    },
  },
  {
    id: "RET-00005",
    materialIssueId: "ISS-00005",
    returningQuantity: 50,
    reason: "excess-material",
    returnedById: "usr-rahul-iyer",
    returnedAtOffsetDays: 6,
    inspection: {
      status: "good",
      goodQuantity: 50,
      damagedQuantity: 0,
      inspectedById: "usr-ritu-agarwal",
      inspectedAtOffsetDays: 9,
      remarks: "Cable coil unopened; restocked to available inventory.",
    },
  },
  {
    id: "RET-00006",
    materialIssueId: "ISS-00008",
    returningQuantity: 2,
    reason: "work-completed",
    returnedById: "usr-divya-menon",
    returnedAtOffsetDays: 8,
    inspection: {
      status: "damaged",
      goodQuantity: 1,
      damagedQuantity: 1,
      inspectedById: "usr-ritu-agarwal",
      inspectedAtOffsetDays: 12,
      remarks: "One bar bent during handling; written off as damaged stock.",
    },
  },
  {
    id: "RET-00007",
    materialIssueId: "ISS-00009",
    returningQuantity: 5,
    reason: "unused-material",
    returnedById: "usr-divya-menon",
    returnedAtOffsetDays: 10,
    inspection: {
      status: "pending-inspection",
      goodQuantity: 0,
      damagedQuantity: 0,
      inspectedById: null,
      inspectedAtOffsetDays: null,
      remarks: "Awaiting quality inspector sign-off.",
    },
  },
  {
    id: "RET-00008",
    materialIssueId: "ISS-00010",
    returningQuantity: 300,
    reason: "excess-material",
    returnedById: "usr-divya-menon",
    returnedAtOffsetDays: 12,
    inspection: {
      status: "good",
      goodQuantity: 300,
      damagedQuantity: 0,
      inspectedById: "usr-ritu-agarwal",
      inspectedAtOffsetDays: 15,
      remarks: "Bricks unbroken; restocked to available inventory.",
    },
  },
  {
    id: "RET-00009",
    materialIssueId: "ISS-00013",
    returningQuantity: 3,
    reason: "change-in-plan",
    returnedById: "usr-suresh-babu",
    returnedAtOffsetDays: 9,
    inspection: {
      status: "good",
      goodQuantity: 3,
      damagedQuantity: 0,
      inspectedById: "usr-naveen-pillai",
      inspectedAtOffsetDays: 12,
      remarks:
        "Aggregate clean and reusable; restocked to available inventory.",
    },
  },
  {
    id: "RET-00010",
    materialIssueId: "ISS-00013",
    returningQuantity: 2,
    reason: "unused-material",
    returnedById: "usr-suresh-babu",
    returnedAtOffsetDays: 12,
    inspection: {
      status: "pending-inspection",
      goodQuantity: 0,
      damagedQuantity: 0,
      inspectedById: null,
      inspectedAtOffsetDays: null,
      remarks: "Awaiting quality inspector sign-off.",
    },
  },
  {
    id: "RET-00011",
    materialIssueId: "ISS-00014",
    returningQuantity: 2,
    reason: "work-completed",
    returnedById: "usr-suresh-babu",
    returnedAtOffsetDays: 7,
    inspection: {
      status: "damaged",
      goodQuantity: 1,
      damagedQuantity: 1,
      inspectedById: "usr-ritu-agarwal",
      inspectedAtOffsetDays: 11,
      remarks: "One bar showed surface rust; written off as damaged stock.",
    },
  },
  {
    id: "RET-00012",
    materialIssueId: "ISS-00015",
    returningQuantity: 5,
    reason: "excess-material",
    returnedById: "usr-suresh-babu",
    returnedAtOffsetDays: 10,
    inspection: {
      status: "good",
      goodQuantity: 5,
      damagedQuantity: 0,
      inspectedById: "usr-ritu-agarwal",
      inspectedAtOffsetDays: 13,
      remarks: "Plywood sheets undamaged; restocked to available inventory.",
    },
  },
  {
    id: "RET-00013",
    materialIssueId: "ISS-00017",
    returningQuantity: 30,
    reason: "change-in-plan",
    returnedById: "usr-suresh-babu",
    returnedAtOffsetDays: 6,
    inspection: {
      status: "pending-inspection",
      goodQuantity: 0,
      damagedQuantity: 0,
      inspectedById: null,
      inspectedAtOffsetDays: null,
      remarks: "Awaiting quality inspector sign-off.",
    },
  },
  {
    id: "RET-00014",
    materialIssueId: "ISS-00018",
    returningQuantity: 30,
    reason: "unused-material",
    returnedById: "usr-sneha-kapoor",
    returnedAtOffsetDays: 10,
    inspection: {
      status: "damaged",
      goodQuantity: 20,
      damagedQuantity: 10,
      inspectedById: "usr-naveen-pillai",
      inspectedAtOffsetDays: 14,
      remarks:
        "Part of the coil rusted from exposure to rain; written off as damaged stock.",
    },
  },
  {
    id: "RET-00015",
    materialIssueId: "ISS-00020",
    returningQuantity: 10,
    reason: "change-in-plan",
    returnedById: "usr-sneha-kapoor",
    returnedAtOffsetDays: 6,
    inspection: {
      status: "good",
      goodQuantity: 10,
      damagedQuantity: 0,
      inspectedById: "usr-naveen-pillai",
      inspectedAtOffsetDays: 9,
      remarks: "Fittings unused and boxed; restocked to available inventory.",
    },
  },
  {
    id: "RET-00016",
    materialIssueId: "ISS-00021",
    returningQuantity: 50,
    reason: "work-completed",
    returnedById: "usr-manoj-verma",
    returnedAtOffsetDays: 11,
    inspection: {
      status: "good",
      goodQuantity: 50,
      damagedQuantity: 0,
      inspectedById: "usr-naveen-pillai",
      inspectedAtOffsetDays: 14,
      remarks: "Cable coil intact; restocked to available inventory.",
    },
  },
  {
    id: "RET-00017",
    materialIssueId: "ISS-00024",
    returningQuantity: 15,
    reason: "unused-material",
    returnedById: "usr-sneha-kapoor",
    returnedAtOffsetDays: 6,
    inspection: {
      status: "pending-inspection",
      goodQuantity: 0,
      damagedQuantity: 0,
      inspectedById: null,
      inspectedAtOffsetDays: null,
      remarks: "Awaiting quality inspector sign-off.",
    },
  },
  {
    id: "RET-00018",
    materialIssueId: "ISS-00025",
    returningQuantity: 5,
    reason: "work-completed",
    returnedById: "usr-sneha-kapoor",
    returnedAtOffsetDays: 7,
    inspection: {
      status: "damaged",
      goodQuantity: 3,
      damagedQuantity: 2,
      inspectedById: "usr-naveen-pillai",
      inspectedAtOffsetDays: 11,
      remarks:
        "Two door leaves chipped during transport; written off as damaged stock.",
    },
  },
  {
    id: "RET-00019",
    materialIssueId: "ISS-00027",
    returningQuantity: 10,
    reason: "unused-material",
    returnedById: "usr-ashok",
    returnedAtOffsetDays: 4,
    inspection: {
      status: "good",
      goodQuantity: 10,
      damagedQuantity: 0,
      inspectedById: "usr-ritu-agarwal",
      inspectedAtOffsetDays: 5,
      remarks: "Unopened cement bags returned from slab pour and restocked.",
    },
  },
  {
    id: "RET-00020",
    materialIssueId: "ISS-00028",
    returningQuantity: 1,
    reason: "work-completed",
    returnedById: "usr-ashok",
    returnedAtOffsetDays: 4,
    inspection: {
      status: "good",
      goodQuantity: 1,
      damagedQuantity: 0,
      inspectedById: "usr-ritu-agarwal",
      inspectedAtOffsetDays: 5,
      remarks: "Unused TMT bundle returned in reusable condition.",
    },
  },
  {
    id: "RET-00021",
    materialIssueId: "ISS-00029",
    returningQuantity: 200,
    reason: "excess-material",
    returnedById: "usr-divya-menon",
    returnedAtOffsetDays: 7,
    inspection: {
      status: "damaged",
      goodQuantity: 180,
      damagedQuantity: 20,
      inspectedById: "usr-naveen-pillai",
      inspectedAtOffsetDays: 8,
      remarks: "Some AAC blocks chipped during shifting; usable balance restocked.",
    },
  },
  {
    id: "RET-00022",
    materialIssueId: "ISS-00030",
    returningQuantity: 20,
    reason: "change-in-plan",
    returnedById: "usr-suresh-babu",
    returnedAtOffsetDays: 5,
    inspection: {
      status: "pending-inspection",
      goodQuantity: 0,
      damagedQuantity: 0,
      inspectedById: null,
      inspectedAtOffsetDays: null,
      remarks: "Returned membrane rolls awaiting waterproofing lead check.",
    },
  },
  {
    id: "RET-00023",
    materialIssueId: "ISS-00031",
    returningQuantity: 5,
    reason: "unused-material",
    returnedById: "usr-sneha-kapoor",
    returnedAtOffsetDays: 5,
    inspection: {
      status: "good",
      goodQuantity: 5,
      damagedQuantity: 0,
      inspectedById: "usr-naveen-pillai",
      inspectedAtOffsetDays: 6,
      remarks: "Unused sounder strobes returned in sealed boxes.",
    },
  },
  {
    id: "RET-00024",
    materialIssueId: "ISS-00032",
    returningQuantity: 5,
    reason: "work-completed",
    returnedById: "usr-manoj-verma",
    returnedAtOffsetDays: 3,
    inspection: {
      status: "good",
      goodQuantity: 5,
      damagedQuantity: 0,
      inspectedById: "usr-ritu-agarwal",
      inspectedAtOffsetDays: 4,
      remarks: "Waste couplings returned unused after snag closure.",
    },
  },
];

function buildReturns() {
  return RETURN_SEEDS.map((seed) => {
    const issue = materialIssuesService.getById(seed.materialIssueId);
    const returnedAt = addDays(
      issue?.issuedAt ?? "2026-01-01T00:00:00.000Z",
      seed.returnedAtOffsetDays,
    );
    return {
      id: seed.id,
      materialIssueId: seed.materialIssueId,
      projectId: issue?.projectId ?? "",
      projectName: issue?.projectName ?? "",
      materialCode: issue?.materialCode ?? "",
      materialName: issue?.materialName ?? "",
      unit: issue?.unit ?? "",
      returningQuantity: seed.returningQuantity,
      reason: seed.reason,
      returnedById: seed.returnedById,
      returnedByName: getUserName(seed.returnedById),
      returnedAt,
      inspection: {
        status: seed.inspection.status,
        goodQuantity: seed.inspection.goodQuantity,
        damagedQuantity: seed.inspection.damagedQuantity,
        inspectedById: seed.inspection.inspectedById,
        inspectedByName: seed.inspection.inspectedById
          ? getUserName(seed.inspection.inspectedById)
          : null,
        inspectedAt:
          seed.inspection.inspectedAtOffsetDays === null
            ? null
            : addDays(
                issue?.issuedAt ?? "2026-01-01T00:00:00.000Z",
                seed.inspection.inspectedAtOffsetDays,
              ),
        remarks: seed.inspection.remarks,
      },
    };
  });
}
const mockReturns = returnRecordsSchema.parse(buildReturns());

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

/** Deterministic in-memory placeholder mirroring the inventory adapter shape. */
export const mockReturnsAdapter = {
  list(params, options) {
    options?.signal?.throwIfAborted();
    const filteredItems = mockReturns.filter(
      (item) =>
        (params.projectId === null || item.projectId === params.projectId) &&
        (params.inspectionStatus === null ||
          item.inspection.status === params.inspectionStatus) &&
        (params.reason === null || item.reason === params.reason) &&
        matchesSearch(item, params.search),
    );
    const direction = params.sortDirection === "asc" ? 1 : -1;
    const sortedItems = [...filteredItems].sort(
      (first, second) =>
        compareReturns(first, second, params.sortBy) * direction,
    );
    const start = (params.page - 1) * params.pageSize;
    return {
      items: sortedItems.slice(start, start + params.pageSize),
      total: sortedItems.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  },
  listAll() {
    return mockReturns;
  },
};
export function createReturnsService(adapter) {
  return {
    list(params = {}, options = {}) {
      const normalizedParams = returnListParamsSchema.parse(params);
      const result = adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return returnListResultSchema.parse(result);
    },
    listAll() {
      return adapter.listAll();
    },
  };
}
export const returnsService = createReturnsService(mockReturnsAdapter);

import { getMaterialByCode } from "@/lib/mock-data/materials";
import { getProjectName } from "@/lib/mock-data/projects";
import { getUserName } from "@/lib/mock-data/users";
import {
  stockTransfersSchema,
  transferListParamsSchema,
  transferListResultSchema,
} from "../schemas/stock-transfers.schema";

/**
 * Hand-authored, deterministic transfer records. Each row carries only the
 * raw facts (ids, quantity, workflow timestamps); project/material/user
 * display names are enriched in `buildStockTransfers()` below, mirroring how
 * `inventory.service.js` derives `projectName` from `projectId`.
 *
 * Status distribution (22 records): draft x2, requested x3, approved x2,
 * ready-for-dispatch x2, dispatched x3, in-transit x3, received x5,
 * rejected x2.
 */
const TRANSFER_SEEDS = [
  {
    id: "TRF-00601",
    sourceProjectId: "sita-heights",
    destinationProjectId: "sita-enclave",
    materialCode: "CEM-OPC-53",
    quantity: 250,
    status: "draft",
    requestedById: "usr-priyanka-das",
    approvedById: null,
    requestedAt: "2026-08-28T09:15:00+05:30",
    dispatchedAt: null,
    receivedAt: null,
    vehicleNumber: null,
    remarks:
      "Draft prepared ahead of Enclave slab pour schedule; pending final quantity confirmation.",
    rejectionReason: null,
  },
  {
    id: "TRF-00602",
    sourceProjectId: "sita-grove",
    destinationProjectId: "sita-greens",
    materialCode: "AGG-20MM",
    quantity: 40,
    status: "draft",
    requestedById: "usr-suresh-babu",
    approvedById: null,
    requestedAt: "2026-08-30T11:00:00+05:30",
    dispatchedAt: null,
    receivedAt: null,
    vehicleNumber: null,
    remarks:
      "Awaiting Greens access-road completion before submitting for approval.",
    rejectionReason: null,
  },
  {
    id: "TRF-00603",
    sourceProjectId: "sita-enclave",
    destinationProjectId: "sita-heights",
    materialCode: "STL-TMT-16",
    quantity: 8,
    status: "requested",
    requestedById: "usr-vikram-shetty",
    approvedById: null,
    requestedAt: "2026-08-20T10:30:00+05:30",
    dispatchedAt: null,
    receivedAt: null,
    vehicleNumber: null,
    remarks:
      "Heights Tower C rebar consumption is running ahead of the procurement PO.",
    rejectionReason: null,
  },
  {
    id: "TRF-00604",
    sourceProjectId: "sita-crest",
    destinationProjectId: "sita-meridian",
    materialCode: "SND-RIV-01",
    quantity: 25,
    status: "requested",
    requestedById: "usr-rahul-iyer",
    approvedById: null,
    requestedAt: "2026-08-22T14:00:00+05:30",
    dispatchedAt: null,
    receivedAt: null,
    vehicleNumber: null,
    remarks: "Meridian block 2 plastering is short of river sand this week.",
    rejectionReason: null,
  },
  {
    id: "TRF-00605",
    sourceProjectId: "sita-riviera",
    destinationProjectId: "sita-heights",
    materialCode: "FIN-TIL-600",
    quantity: 45,
    status: "requested",
    requestedById: "usr-manoj-verma",
    approvedById: null,
    requestedAt: "2026-08-24T09:45:00+05:30",
    dispatchedAt: null,
    receivedAt: null,
    vehicleNumber: null,
    remarks:
      "Riviera handover surplus tiling stock proposed for Heights lobby finishing.",
    rejectionReason: null,
  },
  {
    id: "TRF-00606",
    sourceProjectId: "sita-greens",
    destinationProjectId: "sita-grove",
    materialCode: "SND-MFG-01",
    quantity: 35,
    status: "approved",
    requestedById: "usr-vikram-shetty",
    approvedById: "usr-sneha-kapoor",
    requestedAt: "2026-08-10T08:30:00+05:30",
    dispatchedAt: null,
    receivedAt: null,
    vehicleNumber: null,
    remarks:
      "Approved for release once Grove clears space in the aggregate yard.",
    rejectionReason: null,
  },
  {
    id: "TRF-00607",
    sourceProjectId: "sita-heights",
    destinationProjectId: "sita-crest",
    materialCode: "CEM-PPC-01",
    quantity: 120,
    status: "approved",
    requestedById: "usr-priyanka-das",
    approvedById: "usr-alok-mishra",
    requestedAt: "2026-08-12T09:00:00+05:30",
    dispatchedAt: null,
    receivedAt: null,
    vehicleNumber: null,
    remarks:
      "Crest foundation pour scheduled next week; approved pending vehicle booking.",
    rejectionReason: null,
  },
  {
    id: "TRF-00608",
    sourceProjectId: "sita-enclave",
    destinationProjectId: "sita-greens",
    materialCode: "PLY-SHT-18",
    quantity: 25,
    status: "ready-for-dispatch",
    requestedById: "usr-divya-menon",
    approvedById: "usr-manoj-verma",
    requestedAt: "2026-08-05T10:00:00+05:30",
    dispatchedAt: null,
    receivedAt: null,
    vehicleNumber: null,
    remarks:
      "Shuttering plywood staged at the Enclave store, ready for outbound loading.",
    rejectionReason: null,
  },
  {
    id: "TRF-00609",
    sourceProjectId: "sita-meridian",
    destinationProjectId: "sita-crest",
    materialCode: "STL-TMT-12",
    quantity: 6,
    status: "ready-for-dispatch",
    requestedById: "usr-sneha-kapoor",
    approvedById: "usr-farah-khan",
    requestedAt: "2026-08-06T11:30:00+05:30",
    dispatchedAt: null,
    receivedAt: null,
    vehicleNumber: null,
    remarks: "Reserved and palletised; awaiting transporter allocation.",
    rejectionReason: null,
  },
  {
    id: "TRF-00610",
    sourceProjectId: "sita-heights",
    destinationProjectId: "sita-greens",
    materialCode: "BRK-FLY-01",
    quantity: 1500,
    status: "dispatched",
    requestedById: "usr-rahul-iyer",
    approvedById: "usr-manoj-verma",
    requestedAt: "2026-07-28T08:00:00+05:30",
    dispatchedAt: "2026-07-30T07:30:00+05:30",
    receivedAt: null,
    vehicleNumber: "TS09FA2210",
    remarks: "Loaded on truck TS09FA2210, expected at Greens within the day.",
    rejectionReason: null,
  },
  {
    id: "TRF-00611",
    sourceProjectId: "sita-crest",
    destinationProjectId: "sita-orchid",
    materialCode: "AGG-10MM",
    quantity: 30,
    status: "dispatched",
    requestedById: "usr-divya-menon",
    approvedById: "usr-kavita-nair",
    requestedAt: "2026-07-29T09:00:00+05:30",
    dispatchedAt: "2026-07-31T08:15:00+05:30",
    receivedAt: null,
    vehicleNumber: "TN22BZ5541",
    remarks:
      "Aggregate surplus at Crest moved to Orchid ahead of site remobilisation.",
    rejectionReason: null,
  },
  {
    id: "TRF-00612",
    sourceProjectId: "sita-enclave",
    destinationProjectId: "sita-meridian",
    materialCode: "ELE-CAB-4C",
    quantity: 200,
    status: "dispatched",
    requestedById: "usr-vikram-shetty",
    approvedById: "usr-sneha-kapoor",
    requestedAt: "2026-08-01T10:00:00+05:30",
    dispatchedAt: "2026-08-03T09:00:00+05:30",
    receivedAt: null,
    vehicleNumber: "KA05CK7788",
    remarks: "Electrical first-fix cable moved to Meridian block 3.",
    rejectionReason: null,
  },
  {
    id: "TRF-00613",
    sourceProjectId: "sita-heights",
    destinationProjectId: "sita-enclave",
    materialCode: "STL-BWR-01",
    quantity: 80,
    status: "in-transit",
    requestedById: "usr-priyanka-das",
    approvedById: "usr-manoj-verma",
    requestedAt: "2026-08-15T09:30:00+05:30",
    dispatchedAt: "2026-08-17T07:45:00+05:30",
    receivedAt: null,
    vehicleNumber: "TS08GH3391",
    remarks: "Binding wire en route to the Enclave rebar yard.",
    rejectionReason: null,
  },
  {
    id: "TRF-00614",
    sourceProjectId: "sita-grove",
    destinationProjectId: "sita-heights",
    materialCode: "ELE-SW-1G",
    quantity: 45,
    status: "in-transit",
    requestedById: "usr-suresh-babu",
    approvedById: "usr-manoj-verma",
    requestedAt: "2026-08-16T10:15:00+05:30",
    dispatchedAt: "2026-08-18T08:00:00+05:30",
    receivedAt: null,
    vehicleNumber: "KA51DP1027",
    remarks: "Modular switches redirected to Heights electrical first-fix.",
    rejectionReason: null,
  },
  {
    id: "TRF-00615",
    sourceProjectId: "sita-meridian",
    destinationProjectId: "sita-crest",
    materialCode: "PLB-PVC-110",
    quantity: 12,
    status: "in-transit",
    requestedById: "usr-sneha-kapoor",
    approvedById: "usr-farah-khan",
    requestedAt: "2026-08-17T09:00:00+05:30",
    dispatchedAt: "2026-08-19T07:30:00+05:30",
    receivedAt: null,
    vehicleNumber: "MH14EF6620",
    remarks: "SWR pipe surplus routed to Crest plumbing first-fix.",
    rejectionReason: null,
  },
  {
    id: "TRF-00616",
    sourceProjectId: "sita-heights",
    destinationProjectId: "sita-greens",
    materialCode: "CEM-OPC-53",
    quantity: 300,
    status: "received",
    requestedById: "usr-priyanka-das",
    approvedById: "usr-manoj-verma",
    requestedAt: "2026-06-05T09:00:00+05:30",
    dispatchedAt: "2026-06-07T07:00:00+05:30",
    receivedAt: "2026-06-07T15:30:00+05:30",
    vehicleNumber: "TS07AA1123",
    remarks:
      "Received and stacked at the Greens central store; GRN logged manually.",
    rejectionReason: null,
  },
  {
    id: "TRF-00617",
    sourceProjectId: "sita-enclave",
    destinationProjectId: "sita-grove",
    materialCode: "SND-MFG-01",
    quantity: 45,
    status: "received",
    requestedById: "usr-vikram-shetty",
    approvedById: "usr-sneha-kapoor",
    requestedAt: "2026-06-10T08:30:00+05:30",
    dispatchedAt: "2026-06-12T07:00:00+05:30",
    receivedAt: "2026-06-12T16:00:00+05:30",
    vehicleNumber: "KA03BX9987",
    remarks: "M-Sand received; quality matched the Enclave batch reference.",
    rejectionReason: null,
  },
  {
    id: "TRF-00618",
    sourceProjectId: "sita-crest",
    destinationProjectId: "sita-orchid",
    materialCode: "AGG-20MM",
    quantity: 50,
    status: "received",
    requestedById: "usr-rahul-iyer",
    approvedById: "usr-kavita-nair",
    requestedAt: "2026-06-15T09:00:00+05:30",
    dispatchedAt: "2026-06-17T07:15:00+05:30",
    receivedAt: "2026-06-17T17:45:00+05:30",
    vehicleNumber: "TN09CJ4432",
    remarks:
      "Aggregate received at Orchid for retaining-wall work resumed post hold.",
    rejectionReason: null,
  },
  {
    id: "TRF-00619",
    sourceProjectId: "sita-heights",
    destinationProjectId: "sita-meridian",
    materialCode: "STL-TMT-08",
    quantity: 5,
    status: "received",
    requestedById: "usr-priyanka-das",
    approvedById: "usr-manoj-verma",
    requestedAt: "2026-06-20T09:30:00+05:30",
    dispatchedAt: "2026-06-22T07:00:00+05:30",
    receivedAt: "2026-06-22T18:00:00+05:30",
    vehicleNumber: "TS10KL5567",
    remarks: "8 mm TMT received at Meridian for slab reinforcement top-up.",
    rejectionReason: null,
  },
  {
    id: "TRF-00620",
    sourceProjectId: "sita-greens",
    destinationProjectId: "sita-enclave",
    materialCode: "FIN-PNT-EM",
    quantity: 60,
    status: "received",
    requestedById: "usr-vikram-shetty",
    approvedById: "usr-sneha-kapoor",
    requestedAt: "2026-06-25T10:00:00+05:30",
    dispatchedAt: "2026-06-27T07:30:00+05:30",
    receivedAt: "2026-06-27T15:15:00+05:30",
    vehicleNumber: "KA41MN2290",
    remarks: "Emulsion paint received at Enclave for show-flat finishing.",
    rejectionReason: null,
  },
  {
    id: "TRF-00621",
    sourceProjectId: "sita-enclave",
    destinationProjectId: "sita-crest",
    materialCode: "FIR-SPR-15",
    quantity: 40,
    status: "rejected",
    requestedById: "usr-divya-menon",
    approvedById: null,
    requestedAt: "2026-08-08T09:00:00+05:30",
    dispatchedAt: null,
    receivedAt: null,
    vehicleNumber: null,
    remarks:
      "Requested ahead of schedule; resubmit once Crest fire-safety drawings are approved.",
    rejectionReason:
      "Crest fire-safety scope is still under design freeze; sprinkler heads are not required this quarter.",
  },
  {
    id: "TRF-00622",
    sourceProjectId: "sita-grove",
    destinationProjectId: "sita-orchid",
    materialCode: "PLB-PVC-75",
    quantity: 10,
    status: "rejected",
    requestedById: "usr-suresh-babu",
    approvedById: null,
    requestedAt: "2026-08-09T10:00:00+05:30",
    dispatchedAt: null,
    receivedAt: null,
    vehicleNumber: null,
    remarks:
      "Hold until Orchid remobilisation is confirmed by project management.",
    rejectionReason:
      "Orchid project is on hold; there is no active plumbing work order to consume this material.",
  },
  {
    id: "TRF-00623",
    sourceProjectId: "sita-heights",
    destinationProjectId: "sita-enclave",
    materialCode: "MAT-0150",
    quantity: 40,
    status: "requested",
    requestedById: "usr-bharathi-store-manager",
    approvedById: null,
    requestedAt: "2026-09-14T10:00:00+05:30",
    dispatchedAt: null,
    receivedAt: null,
    vehicleNumber: null,
    remarks: "Imported master cement surplus requested for Enclave blockwork.",
    rejectionReason: null,
  },
  {
    id: "TRF-00624",
    sourceProjectId: "sita-enclave",
    destinationProjectId: "sita-grove",
    materialCode: "MAT-0225",
    quantity: 500,
    status: "approved",
    requestedById: "usr-vikram-shetty",
    approvedById: "usr-sneha-kapoor",
    requestedAt: "2026-09-12T09:00:00+05:30",
    dispatchedAt: null,
    receivedAt: null,
    vehicleNumber: null,
    remarks: "AAC block transfer approved for Grove clubhouse partitions.",
    rejectionReason: null,
  },
  {
    id: "TRF-00625",
    sourceProjectId: "sita-grove",
    destinationProjectId: "sita-heights",
    materialCode: "MAT-0260",
    quantity: 30,
    status: "in-transit",
    requestedById: "usr-suresh-babu",
    approvedById: "usr-manoj-verma",
    requestedAt: "2026-09-11T09:00:00+05:30",
    dispatchedAt: "2026-09-12T07:30:00+05:30",
    receivedAt: null,
    vehicleNumber: "TS09WP0260",
    remarks: "Waterproofing membrane rolls in transit to Heights terrace work.",
    rejectionReason: null,
  },
  {
    id: "TRF-00626",
    sourceProjectId: "sita-meridian",
    destinationProjectId: "sita-crest",
    materialCode: "MAT-0920",
    quantity: 10,
    status: "received",
    requestedById: "usr-sneha-kapoor",
    approvedById: "usr-farah-khan",
    requestedAt: "2026-09-08T09:30:00+05:30",
    dispatchedAt: "2026-09-09T08:00:00+05:30",
    receivedAt: "2026-09-09T16:30:00+05:30",
    vehicleNumber: "TS10FA0920",
    remarks: "Sounder strobes received at Crest for fire alarm mock-up.",
    rejectionReason: null,
  },
  {
    id: "TRF-00627",
    sourceProjectId: "sita-crest",
    destinationProjectId: "sita-riviera",
    materialCode: "MAT-1174",
    quantity: 4,
    status: "ready-for-dispatch",
    requestedById: "usr-priyanka-das",
    approvedById: "usr-manoj-verma",
    requestedAt: "2026-09-16T11:00:00+05:30",
    dispatchedAt: null,
    receivedAt: null,
    vehicleNumber: null,
    remarks: "Solar panel samples reserved for Riviera terrace mock-up.",
    rejectionReason: null,
  },
];

function buildStockTransfers() {
  return TRANSFER_SEEDS.map((seed) => {
    const material = getMaterialByCode(seed.materialCode);
    return {
      ...seed,
      sourceProjectName: getProjectName(seed.sourceProjectId),
      destinationProjectName: getProjectName(seed.destinationProjectId),
      materialName: material?.name ?? seed.materialCode,
      unit: material?.unit ?? "",
      requestedByName: getUserName(seed.requestedById),
      approvedByName: seed.approvedById ? getUserName(seed.approvedById) : null,
    };
  });
}
const mockStockTransfers = stockTransfersSchema.parse(buildStockTransfers());

function matchesSearch(transfer, search) {
  if (!search) {
    return true;
  }
  const searchableText = [
    transfer.id,
    transfer.sourceProjectName,
    transfer.destinationProjectName,
    transfer.materialCode,
    transfer.materialName,
    transfer.status.replaceAll("-", " "),
    transfer.vehicleNumber,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
  return searchableText.includes(search.toLocaleLowerCase());
}
function compareTransfers(first, second, field) {
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

/**
 * Deterministic in-memory placeholder. Replace it with an HTTP implementation
 * of the same shape; the service and query hooks need no transport changes.
 */
export const mockStockTransfersAdapter = {
  list(params, options) {
    options?.signal?.throwIfAborted();
    const filteredItems = mockStockTransfers.filter(
      (transfer) =>
        (!params.status || transfer.status === params.status) &&
        (!params.sourceProjectId ||
          transfer.sourceProjectId === params.sourceProjectId) &&
        (!params.destinationProjectId ||
          transfer.destinationProjectId === params.destinationProjectId) &&
        matchesSearch(transfer, params.search),
    );
    const direction = params.sortDirection === "asc" ? 1 : -1;
    const sortedItems = [...filteredItems].sort(
      (first, second) =>
        compareTransfers(first, second, params.sortBy) * direction,
    );
    const start = (params.page - 1) * params.pageSize;
    return {
      items: sortedItems.slice(start, start + params.pageSize),
      total: sortedItems.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  },
  get(transferId) {
    return (
      mockStockTransfers.find((transfer) => transfer.id === transferId) ?? null
    );
  },
  listAll() {
    return mockStockTransfers;
  },
};

export function createStockTransfersService(adapter) {
  return {
    list(params = {}, options = {}) {
      const normalizedParams = transferListParamsSchema.parse(params);
      const result = adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return transferListResultSchema.parse(result);
    },
    get(transferId) {
      const transfer = adapter.get(transferId);
      return transfer ? stockTransfersSchema.element.parse(transfer) : null;
    },
    listAll() {
      return adapter.listAll();
    },
  };
}
export const stockTransfersService = createStockTransfersService(
  mockStockTransfersAdapter,
);

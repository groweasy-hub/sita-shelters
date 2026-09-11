import { getProjectName } from "@/lib/mock-data/projects";
import { getMaterialByCode } from "@/lib/mock-data/materials";
import {
  purchaseRequestSchema,
  purchaseRequestsSchema,
} from "../schemas/procurement.schema";

function material(code, requiredQuantity) {
  const record = getMaterialByCode(code);
  return {
    materialCode: code,
    materialName: record?.name ?? code,
    requiredQuantity,
    unit: record?.unit ?? "",
  };
}
function purchaseRequest({
  id,
  sourceIndentId,
  projectId,
  materials,
  requiredDeliveryDate,
  status,
  createdAt,
}) {
  return {
    id,
    sourceIndentId,
    projectId,
    projectName: getProjectName(projectId),
    materials,
    requiredDeliveryDate,
    status,
    createdAt,
  };
}

/**
 * Ten purchase requests, one per approved indent flagged with
 * `hasProcurementRequest` in the indents feature's mock data. `sourceIndentId`
 * is a literal reference to those indent identifiers; it does not resolve
 * through a live cross-feature query.
 */
const RAW_PURCHASE_REQUESTS = [
  purchaseRequest({
    id: "PR-00001",
    sourceIndentId: "IND-02403",
    projectId: "sita-heights",
    materials: [material("FIN-TIL-600", 80), material("FIN-PNT-EM", 280)],
    requiredDeliveryDate: "2026-09-08",
    status: "approved",
    createdAt: "2026-08-11T10:00:00+05:30",
  }),
  purchaseRequest({
    id: "PR-00002",
    sourceIndentId: "IND-02406",
    projectId: "sita-enclave",
    materials: [material("PLB-PVC-110", 50), material("PLB-FIT-ELB", 120)],
    requiredDeliveryDate: "2026-09-06",
    status: "approved",
    createdAt: "2026-08-05T09:30:00+05:30",
  }),
  purchaseRequest({
    id: "PR-00003",
    sourceIndentId: "IND-02408",
    projectId: "sita-greens",
    materials: [material("AGG-20MM", 60), material("SND-MFG-01", 40)],
    requiredDeliveryDate: "2026-09-10",
    status: "submitted",
    createdAt: "2026-08-20T09:00:00+05:30",
  }),
  purchaseRequest({
    id: "PR-00004",
    sourceIndentId: "IND-02412",
    projectId: "sita-grove",
    materials: [material("BRK-FLY-01", 20000)],
    requiredDeliveryDate: "2026-09-07",
    status: "approved",
    createdAt: "2026-08-07T09:15:00+05:30",
  }),
  purchaseRequest({
    id: "PR-00005",
    sourceIndentId: "IND-02414",
    projectId: "sita-meridian",
    materials: [material("CEM-OPC-53", 250)],
    requiredDeliveryDate: "2026-09-09",
    status: "approved",
    createdAt: "2026-08-14T09:00:00+05:30",
  }),
  purchaseRequest({
    id: "PR-00006",
    sourceIndentId: "IND-02415",
    projectId: "sita-meridian",
    materials: [material("STL-TMT-16", 12), material("STL-TMT-12", 10)],
    requiredDeliveryDate: "2026-08-28",
    status: "approved",
    createdAt: "2026-07-22T09:00:00+05:30",
  }),
  purchaseRequest({
    id: "PR-00007",
    sourceIndentId: "IND-02418",
    projectId: "sita-crest",
    materials: [material("BRK-FLY-01", 15000), material("BRK-CLY-01", 5000)],
    requiredDeliveryDate: "2026-08-12",
    status: "approved",
    createdAt: "2026-07-12T09:00:00+05:30",
  }),
  purchaseRequest({
    id: "PR-00008",
    sourceIndentId: "IND-02421",
    projectId: "sita-orchid",
    materials: [material("CEM-OPC-53", 120)],
    requiredDeliveryDate: "2026-09-12",
    status: "draft",
    createdAt: "2026-08-13T09:00:00+05:30",
  }),
  purchaseRequest({
    id: "PR-00009",
    sourceIndentId: "IND-02423",
    projectId: "sita-riviera",
    materials: [material("FIN-DOR-FL", 10)],
    requiredDeliveryDate: "2026-08-18",
    status: "approved",
    createdAt: "2026-07-26T09:00:00+05:30",
  }),
  purchaseRequest({
    id: "PR-00010",
    sourceIndentId: "IND-02424",
    projectId: "sita-riviera",
    materials: [material("FIN-PNT-EX", 100)],
    requiredDeliveryDate: "2026-08-26",
    status: "approved",
    createdAt: "2026-07-29T09:00:00+05:30",
  }),
];
const mockPurchaseRequests = purchaseRequestsSchema.parse(
  RAW_PURCHASE_REQUESTS,
);

export const mockPurchaseRequestsAdapter = {
  listAll() {
    return mockPurchaseRequests;
  },
  get(purchaseRequestId) {
    return (
      mockPurchaseRequests.find((record) => record.id === purchaseRequestId) ??
      null
    );
  },
};
export function createPurchaseRequestsService(adapter) {
  return {
    listAll() {
      return adapter.listAll();
    },
    get(purchaseRequestId) {
      const record = adapter.get(purchaseRequestId);
      return record ? purchaseRequestSchema.parse(record) : null;
    },
  };
}
export const purchaseRequestsService = createPurchaseRequestsService(
  mockPurchaseRequestsAdapter,
);

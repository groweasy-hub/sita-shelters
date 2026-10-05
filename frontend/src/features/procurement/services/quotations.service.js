import { apiClient } from "@/lib/api-client";
import {
  quotationInputSchema,
  quotationSchema,
  quotationsSchema,
} from "../schemas/procurement.schema";

/**
 * Vendor quotations for six of the ten purchase requests. Grouped by
 * `purchaseRequestId` (and, within a request, by `materialCode`) the
 * comparison screen renders these side by side per the product spec's
 * item-wise RFQ comparison table. `status: "selected"` marks whichever
 * line the procurement user has chosen for that item; siblings for the
 * same item are `"rejected"` once a selection is made.
 */
const RAW_QUOTATIONS = [
  {
    id: "QT-00001",
    purchaseRequestId: "PR-00001",
    vendorId: "vnd-kajaria",
    materialCode: "FIN-TIL-600",
    quotationNumber: "KAJ/QT/2026/0114",
    quotationDate: "2026-08-12",
    validUntil: "2026-09-30",
    unitPrice: 1150,
    moq: 40,
    discountPercent: 2,
    taxPercent: 18,
    deliveryDays: 7,
    paymentTerms: "50% advance, balance on delivery",
    deliveryTerms: "Door delivery, freight included",
    remarks: "",
    documentName: "kajaria-quote-0114.pdf",
    qualityRating: "high",
    status: "selected",
  },
  {
    id: "QT-00002",
    purchaseRequestId: "PR-00001",
    vendorId: "vnd-asian-paints",
    materialCode: "FIN-TIL-600",
    quotationNumber: "AP/TIL/2026/0087",
    quotationDate: "2026-08-12",
    validUntil: "2026-09-15",
    unitPrice: 1210,
    moq: 50,
    discountPercent: 0,
    taxPercent: 18,
    deliveryDays: 10,
    paymentTerms: "100% advance",
    deliveryTerms: "Ex-warehouse, buyer arranges transport",
    remarks: "",
    documentName: "asian-paints-tile-quote.pdf",
    qualityRating: "medium",
    status: "rejected",
  },
  {
    id: "QT-00003",
    purchaseRequestId: "PR-00001",
    vendorId: "vnd-asian-paints",
    materialCode: "FIN-PNT-EM",
    quotationNumber: "AP/PNT/2026/0088",
    quotationDate: "2026-08-12",
    validUntil: "2026-10-05",
    unitPrice: 375,
    moq: 100,
    discountPercent: 3,
    taxPercent: 12,
    deliveryDays: 5,
    paymentTerms: "30 days credit",
    deliveryTerms: "Door delivery",
    remarks: "",
    documentName: "asian-paints-paint-quote.pdf",
    qualityRating: "high",
    status: "selected",
  },
  {
    id: "QT-00004",
    purchaseRequestId: "PR-00002",
    vendorId: "vnd-finolex",
    materialCode: "PLB-PVC-110",
    quotationNumber: "FNX/QT/2026/0212",
    quotationDate: "2026-08-06",
    validUntil: "2026-09-20",
    unitPrice: 800,
    moq: 20,
    discountPercent: 1.5,
    taxPercent: 18,
    deliveryDays: 6,
    paymentTerms: "30 days credit",
    deliveryTerms: "Door delivery, freight included",
    remarks: "",
    documentName: "finolex-pvc-quote.pdf",
    qualityRating: "high",
    status: "selected",
  },
  {
    id: "QT-00005",
    purchaseRequestId: "PR-00002",
    vendorId: "vnd-havells",
    materialCode: "PLB-PVC-110",
    quotationNumber: "HVL/QT/2026/0341",
    quotationDate: "2026-08-06",
    validUntil: "2026-09-10",
    unitPrice: 845,
    moq: 25,
    discountPercent: 0,
    taxPercent: 18,
    deliveryDays: 9,
    paymentTerms: "Advance with PO",
    deliveryTerms: "Ex-warehouse",
    remarks: "",
    documentName: null,
    qualityRating: "medium",
    status: "rejected",
  },
  {
    id: "QT-00006",
    purchaseRequestId: "PR-00003",
    vendorId: "vnd-ultratech",
    materialCode: "AGG-20MM",
    quotationNumber: "UT/AGG/2026/0501",
    quotationDate: "2026-08-21",
    validUntil: "2026-09-25",
    unitPrice: 1620,
    moq: 20,
    discountPercent: 0,
    taxPercent: 5,
    deliveryDays: 4,
    paymentTerms: "Payment on delivery",
    deliveryTerms: "Door delivery",
    remarks: "",
    documentName: "ultratech-aggregate-quote.pdf",
    qualityRating: "high",
    status: "selected",
  },
  {
    id: "QT-00007",
    purchaseRequestId: "PR-00003",
    vendorId: "vnd-shree-sand",
    materialCode: "AGG-20MM",
    quotationNumber: "SS/AGG/2026/0177",
    quotationDate: "2026-08-21",
    validUntil: "2026-09-18",
    unitPrice: 1590,
    moq: 15,
    discountPercent: 0,
    taxPercent: 5,
    deliveryDays: 6,
    paymentTerms: "Payment on delivery",
    deliveryTerms: "Door delivery",
    remarks: "Lower MOQ, useful for smaller top-up orders.",
    documentName: "shree-sand-aggregate-quote.pdf",
    qualityRating: "medium",
    status: "received",
  },
  {
    id: "QT-00008",
    purchaseRequestId: "PR-00003",
    vendorId: "vnd-shree-sand",
    materialCode: "SND-MFG-01",
    quotationNumber: "SS/SND/2026/0178",
    quotationDate: "2026-08-21",
    validUntil: "2026-09-18",
    unitPrice: 1830,
    moq: 10,
    discountPercent: 2,
    taxPercent: 5,
    deliveryDays: 5,
    paymentTerms: "Payment on delivery",
    deliveryTerms: "Door delivery",
    remarks: "",
    documentName: "shree-sand-msand-quote.pdf",
    qualityRating: "high",
    status: "selected",
  },
  {
    id: "QT-00009",
    purchaseRequestId: "PR-00004",
    vendorId: "vnd-crescent-brick",
    materialCode: "BRK-FLY-01",
    quotationNumber: "CB/QT/2026/0091",
    quotationDate: "2026-08-07",
    validUntil: "2026-09-15",
    unitPrice: 7.3,
    moq: 5000,
    discountPercent: 0,
    taxPercent: 5,
    deliveryDays: 8,
    paymentTerms: "30 days credit",
    deliveryTerms: "Door delivery, staggered truckloads",
    remarks: "",
    documentName: "crescent-brick-quote.pdf",
    qualityRating: "high",
    status: "selected",
  },
  {
    id: "QT-00010",
    purchaseRequestId: "PR-00004",
    vendorId: "vnd-shree-sand",
    materialCode: "BRK-FLY-01",
    quotationNumber: "SS/BRK/2026/0179",
    quotationDate: "2026-08-07",
    validUntil: "2026-09-05",
    unitPrice: 7.6,
    moq: 5000,
    discountPercent: 0,
    taxPercent: 5,
    deliveryDays: 5,
    paymentTerms: "Payment on delivery",
    deliveryTerms: "Door delivery",
    remarks: "",
    documentName: null,
    qualityRating: "medium",
    status: "rejected",
  },
  {
    id: "QT-00011",
    purchaseRequestId: "PR-00005",
    vendorId: "vnd-ultratech",
    materialCode: "CEM-OPC-53",
    quotationNumber: "UT/CEM/2026/0502",
    quotationDate: "2026-08-14",
    validUntil: "2026-09-20",
    unitPrice: 390,
    moq: 100,
    discountPercent: 1,
    taxPercent: 28,
    deliveryDays: 3,
    paymentTerms: "30 days credit",
    deliveryTerms: "Door delivery, freight included",
    remarks: "",
    documentName: "ultratech-cement-quote.pdf",
    qualityRating: "high",
    status: "selected",
  },
  {
    id: "QT-00012",
    purchaseRequestId: "PR-00005",
    vendorId: "vnd-shree-sand",
    materialCode: "CEM-OPC-53",
    quotationNumber: "SS/CEM/2026/0180",
    quotationDate: "2026-08-14",
    validUntil: "2026-09-01",
    unitPrice: 402,
    moq: 50,
    discountPercent: 0,
    taxPercent: 28,
    deliveryDays: 6,
    paymentTerms: "Payment on delivery",
    deliveryTerms: "Door delivery",
    remarks: "",
    documentName: null,
    qualityRating: "medium",
    status: "rejected",
  },
  {
    id: "QT-00013",
    purchaseRequestId: "PR-00006",
    vendorId: "vnd-jsw-steel",
    materialCode: "STL-TMT-16",
    quotationNumber: "JSW/QT/2026/0620",
    quotationDate: "2026-07-23",
    validUntil: "2026-08-31",
    unitPrice: 62000,
    moq: 5,
    discountPercent: 0.5,
    taxPercent: 18,
    deliveryDays: 10,
    paymentTerms: "50% advance, balance before dispatch",
    deliveryTerms: "Door delivery, freight included",
    remarks: "",
    documentName: "jsw-steel-tmt16-quote.pdf",
    qualityRating: "high",
    status: "selected",
  },
  {
    id: "QT-00014",
    purchaseRequestId: "PR-00006",
    vendorId: "vnd-larsen-equip",
    materialCode: "STL-TMT-16",
    quotationNumber: "LE/STL/2026/0043",
    quotationDate: "2026-07-23",
    validUntil: "2026-08-20",
    unitPrice: 63500,
    moq: 5,
    discountPercent: 0,
    taxPercent: 18,
    deliveryDays: 14,
    paymentTerms: "Advance with PO",
    deliveryTerms: "Ex-warehouse",
    remarks: "",
    documentName: null,
    qualityRating: "medium",
    status: "rejected",
  },
  {
    id: "QT-00015",
    purchaseRequestId: "PR-00006",
    vendorId: "vnd-jsw-steel",
    materialCode: "STL-TMT-12",
    quotationNumber: "JSW/QT/2026/0621",
    quotationDate: "2026-07-23",
    validUntil: "2026-08-31",
    unitPrice: 62800,
    moq: 5,
    discountPercent: 0.5,
    taxPercent: 18,
    deliveryDays: 10,
    paymentTerms: "50% advance, balance before dispatch",
    deliveryTerms: "Door delivery, freight included",
    remarks: "",
    documentName: "jsw-steel-tmt12-quote.pdf",
    qualityRating: "high",
    status: "selected",
  },
];
let mockQuotations = quotationsSchema.parse(RAW_QUOTATIONS);
let quotationSequence = mockQuotations.length;

function nextQuotationId() {
  quotationSequence += 1;
  return `QT-${String(quotationSequence).padStart(5, "0")}`;
}

export const mockQuotationsAdapter = {
  listAll() {
    return mockQuotations;
  },
  listByPurchaseRequest(purchaseRequestId) {
    return mockQuotations.filter(
      (record) => record.purchaseRequestId === purchaseRequestId,
    );
  },
  create(input) {
    const record = {
      ...input,
      id: nextQuotationId(),
      status: "under-review",
    };
    mockQuotations = [...mockQuotations, record];
    return record;
  },
  selectLine(quotationId) {
    const target = mockQuotations.find((record) => record.id === quotationId);
    if (!target) return null;
    mockQuotations = mockQuotations.map((record) => {
      if (record.id === quotationId) {
        return { ...record, status: "selected" };
      }
      if (
        record.purchaseRequestId === target.purchaseRequestId &&
        record.materialCode === target.materialCode &&
        record.status !== "expired"
      ) {
        return { ...record, status: "rejected" };
      }
      return record;
    });
    return mockQuotations.find((record) => record.id === quotationId);
  },
  deselectLine(quotationId) {
    const target = mockQuotations.find((record) => record.id === quotationId);
    if (!target) return null;
    mockQuotations = mockQuotations.map((record) =>
      record.id === quotationId
        ? { ...record, status: "under-review" }
        : record,
    );
    return mockQuotations.find((record) => record.id === quotationId);
  },
};
/** Browser-safe adapter for the durable quotations API. */
export const apiQuotationsAdapter = {
  listAll() {
    return apiClient.get("/api/procurement/quotations");
  },
  async listByPurchaseRequest(purchaseRequestId) {
    const all = await apiClient.get("/api/procurement/quotations");
    return all.filter(
      (record) => record.purchaseRequestId === purchaseRequestId,
    );
  },
  create(input) {
    return apiClient.post("/api/procurement/quotations", { body: input });
  },
  selectLine(quotationId) {
    return apiClient.post(
      `/api/procurement/quotations/${encodeURIComponent(quotationId)}/select`,
    );
  },
  deselectLine(quotationId) {
    return apiClient.post(
      `/api/procurement/quotations/${encodeURIComponent(quotationId)}/deselect`,
    );
  },
};

export function createQuotationsService(adapter) {
  return {
    async listAll() {
      return adapter.listAll();
    },
    async listByPurchaseRequest(purchaseRequestId) {
      const records = await adapter.listByPurchaseRequest(purchaseRequestId);
      return records.map((record) => quotationSchema.parse(record));
    },
    async create(input) {
      const normalized = quotationInputSchema.parse(input);
      const record = await adapter.create(normalized);
      return quotationSchema.parse(record);
    },
    async selectLine(quotationId) {
      const record = await adapter.selectLine(quotationId);
      return record ? quotationSchema.parse(record) : null;
    },
    async deselectLine(quotationId) {
      const record = await adapter.deselectLine(quotationId);
      return record ? quotationSchema.parse(record) : null;
    },
  };
}
export const quotationsService = createQuotationsService(apiQuotationsAdapter);

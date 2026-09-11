import { quotationSchema, quotationsSchema } from "../schemas/procurement.schema";

/**
 * Vendor quotations for six of the ten purchase requests. Grouped by
 * `purchaseRequestId` (and, within a request, by `materialCode`) the
 * comparison screen renders these side by side per the product spec's RFQ
 * comparison table, highlighting whichever quote carries `status: "selected"`.
 */
const RAW_QUOTATIONS = [
  { id: "QT-00001", purchaseRequestId: "PR-00001", vendorId: "vnd-kajaria", materialCode: "FIN-TIL-600", unitPrice: 1150, taxPercent: 18, deliveryDays: 7, qualityRating: "high", status: "selected" },
  { id: "QT-00002", purchaseRequestId: "PR-00001", vendorId: "vnd-asian-paints", materialCode: "FIN-TIL-600", unitPrice: 1210, taxPercent: 18, deliveryDays: 10, qualityRating: "medium", status: "rejected" },
  { id: "QT-00003", purchaseRequestId: "PR-00001", vendorId: "vnd-asian-paints", materialCode: "FIN-PNT-EM", unitPrice: 375, taxPercent: 12, deliveryDays: 5, qualityRating: "high", status: "selected" },
  { id: "QT-00004", purchaseRequestId: "PR-00002", vendorId: "vnd-finolex", materialCode: "PLB-PVC-110", unitPrice: 800, taxPercent: 18, deliveryDays: 6, qualityRating: "high", status: "selected" },
  { id: "QT-00005", purchaseRequestId: "PR-00002", vendorId: "vnd-havells", materialCode: "PLB-PVC-110", unitPrice: 845, taxPercent: 18, deliveryDays: 9, qualityRating: "medium", status: "rejected" },
  { id: "QT-00006", purchaseRequestId: "PR-00003", vendorId: "vnd-ultratech", materialCode: "AGG-20MM", unitPrice: 1620, taxPercent: 5, deliveryDays: 4, qualityRating: "high", status: "selected" },
  { id: "QT-00007", purchaseRequestId: "PR-00003", vendorId: "vnd-shree-sand", materialCode: "AGG-20MM", unitPrice: 1590, taxPercent: 5, deliveryDays: 6, qualityRating: "medium", status: "received" },
  { id: "QT-00008", purchaseRequestId: "PR-00003", vendorId: "vnd-shree-sand", materialCode: "SND-MFG-01", unitPrice: 1830, taxPercent: 5, deliveryDays: 5, qualityRating: "high", status: "selected" },
  { id: "QT-00009", purchaseRequestId: "PR-00004", vendorId: "vnd-crescent-brick", materialCode: "BRK-FLY-01", unitPrice: 7.3, taxPercent: 5, deliveryDays: 8, qualityRating: "high", status: "selected" },
  { id: "QT-00010", purchaseRequestId: "PR-00004", vendorId: "vnd-shree-sand", materialCode: "BRK-FLY-01", unitPrice: 7.6, taxPercent: 5, deliveryDays: 5, qualityRating: "medium", status: "rejected" },
  { id: "QT-00011", purchaseRequestId: "PR-00005", vendorId: "vnd-ultratech", materialCode: "CEM-OPC-53", unitPrice: 390, taxPercent: 28, deliveryDays: 3, qualityRating: "high", status: "selected" },
  { id: "QT-00012", purchaseRequestId: "PR-00005", vendorId: "vnd-shree-sand", materialCode: "CEM-OPC-53", unitPrice: 402, taxPercent: 28, deliveryDays: 6, qualityRating: "medium", status: "rejected" },
  { id: "QT-00013", purchaseRequestId: "PR-00006", vendorId: "vnd-jsw-steel", materialCode: "STL-TMT-16", unitPrice: 62000, taxPercent: 18, deliveryDays: 10, qualityRating: "high", status: "selected" },
  { id: "QT-00014", purchaseRequestId: "PR-00006", vendorId: "vnd-larsen-equip", materialCode: "STL-TMT-16", unitPrice: 63500, taxPercent: 18, deliveryDays: 14, qualityRating: "medium", status: "rejected" },
  { id: "QT-00015", purchaseRequestId: "PR-00006", vendorId: "vnd-jsw-steel", materialCode: "STL-TMT-12", unitPrice: 62800, taxPercent: 18, deliveryDays: 10, qualityRating: "high", status: "selected" },
];
const mockQuotations = quotationsSchema.parse(RAW_QUOTATIONS);

export const mockQuotationsAdapter = {
  listAll() {
    return mockQuotations;
  },
  listByPurchaseRequest(purchaseRequestId) {
    return mockQuotations.filter(
      (record) => record.purchaseRequestId === purchaseRequestId,
    );
  },
};
export function createQuotationsService(adapter) {
  return {
    listAll() {
      return adapter.listAll();
    },
    listByPurchaseRequest(purchaseRequestId) {
      return adapter.listByPurchaseRequest(purchaseRequestId).map((record) =>
        quotationSchema.parse(record),
      );
    },
  };
}
export const quotationsService = createQuotationsService(mockQuotationsAdapter);

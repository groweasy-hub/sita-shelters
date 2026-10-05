import { Grn, PurchaseOrder, QcInspection, SupplierQuotation } from "../db/models/index.js";

/**
 * Vendor scorecard, derived from what actually happened rather than typed in:
 *
 * - Delivery performance: share of the vendor's deliveries (goods-inward
 *   records) that arrived on or before the promised date AND with nothing
 *   short. The promised date is the PO's release date plus the delivery days
 *   the vendor quoted; when a PO has no quotation to promise against, only
 *   completeness is judged.
 * - Quality acceptance / rejection rate: accepted vs rejected quantity across
 *   the vendor's completed QC inspections. Rejected quantity is what gets sent
 *   back to the vendor for replacement or refund.
 * - Rating (0-5): 60% quality + 40% delivery, scaled to five. If only one of
 *   the two is known yet, it is rated on that alone.
 *
 * Anything with nothing to measure yet is `null` (not 0), so a brand-new
 * vendor reads "no data yet" instead of "0% — terrible".
 */
const QUALITY_WEIGHT = 0.6;
const DELIVERY_WEIGHT = 0.4;
const DAY_MS = 24 * 60 * 60 * 1000;

function isoDay(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function emptyTally() {
  return { deliveries: 0, goodDeliveries: 0, accepted: 0, rejected: 0 };
}

function scoreFromTally(tally) {
  const inspected = tally.accepted + tally.rejected;
  const deliveryPerformance = tally.deliveries > 0 ? tally.goodDeliveries / tally.deliveries : null;
  const qualityAcceptanceRate = inspected > 0 ? tally.accepted / inspected : null;
  const rejectionRate = inspected > 0 ? tally.rejected / inspected : null;

  let weighted = 0;
  let weights = 0;
  if (qualityAcceptanceRate !== null) {
    weighted += QUALITY_WEIGHT * qualityAcceptanceRate;
    weights += QUALITY_WEIGHT;
  }
  if (deliveryPerformance !== null) {
    weighted += DELIVERY_WEIGHT * deliveryPerformance;
    weights += DELIVERY_WEIGHT;
  }
  const rating = weights > 0 ? Math.round((5 * weighted) / weights * 10) / 10 : null;

  return {
    rating,
    deliveryPerformance,
    qualityAcceptanceRate,
    rejectionRate,
    basis: { deliveries: tally.deliveries, inspectedQuantity: inspected },
  };
}

/** Scorecards keyed by vendor id; vendors with no deliveries are simply absent. */
export async function computeVendorPerformance(vendorId = null) {
  const grns = await Grn.find(vendorId ? { vendorId } : {}, {
    vendorId: 1,
    purchaseOrderId: 1,
    receivedAt: 1,
    "lines.missingQuantity": 1,
  }).lean();
  if (grns.length === 0) {
    return new Map();
  }

  const purchaseOrders = await PurchaseOrder.find(
    { _id: { $in: [...new Set(grns.map((grn) => grn.purchaseOrderId))] } },
    { releasedAt: 1, createdAt: 1, quotationLineIds: 1 },
  ).lean();
  const orderById = new Map(purchaseOrders.map((order) => [order._id, order]));

  const quotationIds = [
    ...new Set(purchaseOrders.flatMap((order) => order.quotationLineIds ?? [])),
  ];
  const quotations = quotationIds.length
    ? await SupplierQuotation.find({ _id: { $in: quotationIds } }, { deliveryDays: 1 }).lean()
    : [];
  const deliveryDaysByQuotation = new Map(
    quotations.map((quotation) => [
      quotation._id,
      // No stated delivery days = no promise to be late against (not "0 days").
      quotation.deliveryDays === null || quotation.deliveryDays === undefined
        ? null
        : Number(quotation.deliveryDays),
    ]),
  );

  function promisedDay(order) {
    const promised = (order?.quotationLineIds ?? [])
      .map((id) => deliveryDaysByQuotation.get(id))
      .filter((days) => days !== null && days !== undefined && Number.isFinite(days));
    if (promised.length === 0) {
      return null;
    }
    const start = order.releasedAt ?? order.createdAt;
    return isoDay(new Date(start).getTime() + Math.max(...promised) * DAY_MS);
  }

  const tallies = new Map();
  const tallyFor = (id) => {
    if (!tallies.has(id)) tallies.set(id, emptyTally());
    return tallies.get(id);
  };
  const vendorByGrn = new Map();

  for (const grn of grns) {
    const tally = tallyFor(grn.vendorId);
    vendorByGrn.set(grn._id, grn.vendorId);
    const promised = promisedDay(orderById.get(grn.purchaseOrderId));
    const onTime = promised === null || isoDay(grn.receivedAt) <= promised;
    const complete = (grn.lines ?? []).every((line) => Number(line.missingQuantity ?? 0) === 0);
    tally.deliveries += 1;
    if (onTime && complete) tally.goodDeliveries += 1;
  }

  const inspections = await QcInspection.find(
    { inwardId: { $in: [...vendorByGrn.keys()] }, status: { $in: ["accepted", "rejected"] } },
    { inwardId: 1, acceptedQuantity: 1, rejectedQuantity: 1 },
  ).lean();
  for (const inspection of inspections) {
    const tally = tallyFor(vendorByGrn.get(inspection.inwardId));
    tally.accepted += Number(inspection.acceptedQuantity ?? 0);
    tally.rejected += Number(inspection.rejectedQuantity ?? 0);
  }

  return new Map([...tallies].map(([id, tally]) => [id, scoreFromTally(tally)]));
}

/** The scorecard for a vendor with nothing to measure yet. */
export const NO_PERFORMANCE_YET = scoreFromTally(emptyTally());

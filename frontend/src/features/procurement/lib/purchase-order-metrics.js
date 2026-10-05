/**
 * Small pure helpers shared by the PO list, detail and overview screens.
 * Delivery progress is tracked as a count of scheduled deliveries rather
 * than a summed quantity, since a single purchase order can mix items with
 * different units (e.g. pipes in "lengths" and fittings in "nos").
 */
export function calculatePurchaseOrderValue(order) {
  return order.items.reduce(
    (sum, item) => sum + item.orderedQuantity * item.unitPrice * (1 + item.taxPercent / 100),
    0,
  );
}
export function calculateDeliveryProgress(order) {
  const total = order.deliverySchedule.length;
  const delivered = order.deliverySchedule.filter(
    (entry) => entry.status === "delivered",
  ).length;
  return { delivered, total };
}
export function calculateDeliveredValue(order) {
  const { delivered, total } = calculateDeliveryProgress(order);
  if (total === 0) return 0;
  return (calculatePurchaseOrderValue(order) * delivered) / total;
}

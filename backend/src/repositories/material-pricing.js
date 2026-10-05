import { Material, PurchaseOrder } from "../db/models/index.js";

/**
 * What each material was last actually ordered at (per unit, before tax), by
 * material code. Used to price stock whose catalogue price was never filled in,
 * so bought material is never valued at zero.
 */
export async function latestOrderPrices(codes) {
  if (codes.length === 0) return new Map();
  const wanted = new Set(codes);
  const orders = await PurchaseOrder.find(
    { "items.materialCode": { $in: codes }, status: { $nin: ["draft", "rejected", "cancelled"] } },
    { items: 1, createdAt: 1 },
  )
    .sort({ createdAt: -1 })
    .lean();
  const prices = new Map();
  for (const order of orders) {
    for (const item of order.items) {
      if (wanted.has(item.materialCode) && !prices.has(item.materialCode) && Number(item.unitPrice) > 0) {
        prices.set(item.materialCode, Number(item.unitPrice));
      }
    }
  }
  return prices;
}

/** The catalogue price, or the last order price when the catalogue has none. */
export function effectivePrice(cataloguePrice, orderPrice) {
  return Number(cataloguePrice) > 0 ? Number(cataloguePrice) : (orderPrice ?? 0);
}

/**
 * Current unit price per material code — the same valuation stock and damaged
 * stock use (catalogue price, else last order price) — so a replacement or
 * refund is valued consistently everywhere instead of being typed in.
 */
export async function unitPricesByCode(codes) {
  const unique = [...new Set(codes)];
  if (unique.length === 0) return new Map();
  const rows = await Material.find(
    { code: { $in: unique } },
    { code: 1, lastPurchasePrice: 1 },
  ).lean();
  const catalogue = new Map(rows.map((row) => [row.code, row.lastPurchasePrice]));
  const unpriced = unique.filter((code) => !(Number(catalogue.get(code)) > 0));
  const orderPrices = await latestOrderPrices(unpriced);
  return new Map(
    unique.map((code) => [code, effectivePrice(catalogue.get(code), orderPrices.get(code))]),
  );
}

export const roundMoney = (value) => Math.round(value * 100) / 100;

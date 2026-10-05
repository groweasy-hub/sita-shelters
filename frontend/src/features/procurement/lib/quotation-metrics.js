/**
 * Pure helpers shared by the item-wise comparison screen and the PO
 * creation screen's warning checks.
 */
/**
 * Per-unit rate after discount and BEFORE tax. When the supplier quoted an
 * all-in rate (`taxIncluded`), the tax is taken back out of it, so this is
 * always the figure a purchase order stores as its rate.
 */
export function calculateNetRate(quote) {
  const discounted = quote.unitPrice * (1 - quote.discountPercent / 100);
  return quote.taxIncluded
    ? discounted / (1 + quote.taxPercent / 100)
    : discounted;
}
/** Per-unit landed rate after discount and tax — the like-for-like figure quotes are ranked on. */
export function calculateEffectiveRate(quote) {
  return calculateNetRate(quote) * (1 + quote.taxPercent / 100);
}
export function isQuotationExpired(quote, today = new Date()) {
  // A quote with no validity date never expires.
  if (!quote.validUntil) {
    return false;
  }
  const validUntil = new Date(quote.validUntil);
  return validUntil < today;
}
/**
 * Ranks quotes for the same item on rate, MOQ and delivery speed, and
 * returns which quote id "wins" each dimension plus an overall
 * recommendation (lowest combined rank). This never auto-selects
 * anything — it only drives advisory badges the procurement user can
 * choose to follow or ignore.
 */
export function compareQuotationLines(quotes) {
  if (quotes.length === 0) {
    return {
      lowestRateId: null,
      bestMoqId: null,
      fastestId: null,
      recommendedId: null,
    };
  }
  const byRate = [...quotes].sort(
    (a, b) => calculateEffectiveRate(a) - calculateEffectiveRate(b),
  );
  const byMoq = [...quotes].sort((a, b) => a.moq - b.moq);
  // Delivery days are optional. Quotes without them all rank equally last, so
  // leaving them out never favours one supplier over another.
  const hasDelivery = (quote) =>
    quote.deliveryDays !== null && quote.deliveryDays !== undefined;
  const byDelivery = quotes
    .filter(hasDelivery)
    .sort((a, b) => a.deliveryDays - b.deliveryDays);
  const deliveryRank = (quote) => {
    const position = byDelivery.findIndex((entry) => entry.id === quote.id);
    return position === -1 ? quotes.length : position;
  };
  const ranked = quotes.map((quote) => ({
    id: quote.id,
    total:
      byRate.findIndex((entry) => entry.id === quote.id) +
      byMoq.findIndex((entry) => entry.id === quote.id) +
      deliveryRank(quote),
  }));
  const recommended = ranked.reduce((best, entry) =>
    entry.total < best.total ? entry : best,
  );
  return {
    lowestRateId: byRate[0].id,
    bestMoqId: byMoq[0].id,
    fastestId: byDelivery[0]?.id ?? null,
    recommendedId: recommended.id,
  };
}

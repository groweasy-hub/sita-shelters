/** Sums `valueFn(item)` per `keyFn(item)`, returning entries sorted descending. */
export function groupAndSum(items, keyFn, valueFn) {
  const totals = new Map();
  const counts = new Map();
  items.forEach((item) => {
    const key = keyFn(item);
    totals.set(key, (totals.get(key) ?? 0) + valueFn(item));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return [...totals.entries()]
    .map(([key, value]) => ({ key, value, count: counts.get(key) }))
    .sort((first, second) => second.value - first.value);
}
export function topN(entries, n) {
  return entries.slice(0, n);
}

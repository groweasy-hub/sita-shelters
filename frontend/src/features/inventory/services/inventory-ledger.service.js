import { mockInventoryAdapter } from "./inventory.service";

const MOVEMENT_TYPES = [
  { type: "goods-inward", label: "Goods Inward", sign: 1, reference: "GRN" },
  { type: "issue", label: "Material Issue", sign: -1, reference: "ISS" },
  { type: "consumption", label: "Consumption", sign: -1, reference: "CON" },
  { type: "return", label: "Material Return", sign: 1, reference: "RET" },
  { type: "transfer-in", label: "Transfer In", sign: 1, reference: "TRF" },
  { type: "transfer-out", label: "Transfer Out", sign: -1, reference: "TRF" },
  { type: "damage", label: "Damage Write-off", sign: -1, reference: "DMG" },
];
function hashSeed(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function mulberry32(seed) {
  let state = seed;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function buildLedgerEntries() {
  const items = mockInventoryAdapter.listAll();
  const entries = [];
  items.forEach((item, itemIndex) => {
    const random = mulberry32(hashSeed(`ledger:${item.id}`));
    const movementCount = 2 + Math.floor(random() * 3);
    let runningBalance = Math.max(
      item.availableQuantity - item.reservedQuantity,
      0,
    );
    for (let index = 0; index < movementCount; index += 1) {
      const movement =
        MOVEMENT_TYPES[Math.floor(random() * MOVEMENT_TYPES.length)];
      const quantity =
        Math.round((item.reorderLevel * (0.05 + random() * 0.35)) * 100) /
        100;
      runningBalance = Math.max(
        Math.round((runningBalance + movement.sign * quantity) * 100) / 100,
        0,
      );
      const dayOffset = Math.floor(random() * 45);
      const entryDate = new Date(
        Date.UTC(2026, 6, 20 + dayOffset, Math.floor(random() * 20) + 6, 0, 0),
      ).toISOString();
      entries.push({
        id: `ldg-${itemIndex}-${index}`,
        date: entryDate,
        projectId: item.projectId,
        projectName: item.projectName,
        materialCode: item.materialCode,
        materialName: item.materialName,
        unit: item.unit,
        movementType: movement.type,
        movementLabel: movement.label,
        quantity: movement.sign * quantity,
        balanceAfter: runningBalance,
        referenceId: `${movement.reference}-${String(
          hashSeed(`${item.id}-${index}`) % 90000 + 10000,
        )}`,
      });
    }
  });
  return entries.sort((first, second) =>
    second.date.localeCompare(first.date),
  );
}
let cachedLedger = null;
export function listInventoryLedger() {
  if (!cachedLedger) {
    cachedLedger = buildLedgerEntries();
  }
  return cachedLedger;
}

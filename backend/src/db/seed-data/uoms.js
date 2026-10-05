/**
 * Seed copy of the unit-of-measure list. Kept in sync by hand with
 * frontend/backend/db/uoms-repository.js's `UOM_SEEDS` — see the note in
 * backend/src/permissions.js on why the two packages don't share files at
 * runtime. Every unit referenced by MATERIALS below has a matching row here.
 */
export const UOMS = [
  { id: "uom-bags", code: "bags", name: "Bags" },
  { id: "uom-m3", code: "m³", name: "Cubic Metre" },
  { id: "uom-mt", code: "MT", name: "Metric Tonne" },
  { id: "uom-kg", code: "kg", name: "Kilogram" },
  { id: "uom-sheets", code: "sheets", name: "Sheets" },
  { id: "uom-nos", code: "nos", name: "Numbers" },
  { id: "uom-m", code: "m", name: "Metre" },
  { id: "uom-lengths", code: "lengths", name: "Lengths" },
  { id: "uom-boxes", code: "boxes", name: "Boxes" },
  { id: "uom-litres", code: "litres", name: "Litres" },
  { id: "uom-sets", code: "sets", name: "Sets" },
];

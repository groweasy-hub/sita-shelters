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
  { id: "uom-sft", code: "SFT", name: "Square Feet" },
  { id: "uom-rft", code: "RFT", name: "Running Feet" },
  { id: "uom-cft", code: "CFT", name: "Cubic Feet" },
  { id: "uom-sqm", code: "SQM", name: "Square Metre" },
  { id: "uom-cum", code: "CUM", name: "Cubic Metre" },
  { id: "uom-sheets", code: "sheets", name: "Sheets" },
  { id: "uom-nos", code: "nos", name: "Numbers" },
  { id: "uom-pcs", code: "pcs", name: "Pieces" },
  { id: "uom-m", code: "m", name: "Metre" },
  { id: "uom-lengths", code: "lengths", name: "Lengths" },
  { id: "uom-rolls", code: "rolls", name: "Rolls" },
  { id: "uom-bundles", code: "bundles", name: "Bundles" },
  { id: "uom-boxes", code: "boxes", name: "Boxes" },
  { id: "uom-drums", code: "drums", name: "Drums" },
  { id: "uom-loads", code: "loads", name: "Loads" },
  { id: "uom-trips", code: "trips", name: "Trips" },
  { id: "uom-litres", code: "litres", name: "Litres" },
  { id: "uom-sets", code: "sets", name: "Sets" },
];

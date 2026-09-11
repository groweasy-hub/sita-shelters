import { IMPORTED_MATERIALS } from "./imported-materials.js";

/**
 * Canonical material master. Every indent, purchase order, goods-inward
 * line, inventory row, issue, consumption entry, return and transfer
 * references a material by `code` from this catalogue. Stock quantities are
 * NOT stored here — they live in the inventory feature and are aggregated
 * per material on demand, mirroring how a real material master never holds
 * live stock. `lastPurchasePrice` is the per-unit rate (INR) used to value
 * stock and cost procurement across every module.
 */
const BASE_MATERIALS = [
  // Civil / Cement
  { id: "mat-cem-opc53", code: "CEM-OPC-53", name: "OPC 53 Grade Cement", category: "civil", subcategory: "cement", unit: "bags", specification: "53 Grade, 50 kg bag, IS 12269", approvedVendorIds: ["vnd-ultratech"], reorderLevel: 600, lastPurchasePrice: 392, status: "active" },
  { id: "mat-cem-ppc", code: "CEM-PPC-01", name: "PPC Cement", category: "civil", subcategory: "cement", unit: "bags", specification: "Portland Pozzolana Cement, 50 kg bag, IS 1489", approvedVendorIds: ["vnd-ultratech"], reorderLevel: 400, lastPurchasePrice: 368, status: "active" },
  // Civil / Sand
  { id: "mat-sand-river", code: "SND-RIV-01", name: "River Sand", category: "civil", subcategory: "sand", unit: "m³", specification: "Zone II, washed", approvedVendorIds: ["vnd-shree-sand"], reorderLevel: 80, lastPurchasePrice: 2450, status: "active" },
  { id: "mat-sand-mfg", code: "SND-MFG-01", name: "M-Sand (Manufactured Sand)", category: "civil", subcategory: "sand", unit: "m³", specification: "Crushed, IS 383 graded", approvedVendorIds: ["vnd-shree-sand"], reorderLevel: 100, lastPurchasePrice: 1850, status: "active" },
  // Civil / Steel
  { id: "mat-steel-tmt16", code: "STL-TMT-16", name: "TMT Steel Bar 16 mm", category: "civil", subcategory: "steel", unit: "MT", specification: "Fe 500D, IS 1786", approvedVendorIds: ["vnd-jsw-steel"], reorderLevel: 30, lastPurchasePrice: 62500, status: "active" },
  { id: "mat-steel-tmt12", code: "STL-TMT-12", name: "TMT Steel Bar 12 mm", category: "civil", subcategory: "steel", unit: "MT", specification: "Fe 500D, IS 1786", approvedVendorIds: ["vnd-jsw-steel"], reorderLevel: 25, lastPurchasePrice: 63200, status: "active" },
  { id: "mat-steel-tmt8", code: "STL-TMT-08", name: "TMT Steel Bar 8 mm", category: "civil", subcategory: "steel", unit: "MT", specification: "Fe 500D, IS 1786", approvedVendorIds: ["vnd-jsw-steel"], reorderLevel: 15, lastPurchasePrice: 64100, status: "active" },
  { id: "mat-steel-binding", code: "STL-BWR-01", name: "Binding Wire", category: "civil", subcategory: "steel", unit: "kg", specification: "18 SWG annealed", approvedVendorIds: ["vnd-jsw-steel"], reorderLevel: 200, lastPurchasePrice: 78, status: "active" },
  // Civil / Aggregate
  { id: "mat-agg-20", code: "AGG-20MM", name: "Crushed Aggregate 20 mm", category: "civil", subcategory: "aggregate", unit: "m³", specification: "Graded, IS 383", approvedVendorIds: ["vnd-ultratech", "vnd-shree-sand"], reorderLevel: 120, lastPurchasePrice: 1650, status: "active" },
  { id: "mat-agg-10", code: "AGG-10MM", name: "Crushed Aggregate 10 mm", category: "civil", subcategory: "aggregate", unit: "m³", specification: "Graded, IS 383", approvedVendorIds: ["vnd-shree-sand"], reorderLevel: 90, lastPurchasePrice: 1720, status: "active" },
  { id: "mat-ply-shutter18", code: "PLY-SHT-18", name: "Shuttering Plywood 18 mm", category: "civil", subcategory: "aggregate", unit: "sheets", specification: "Film-faced, 8x4 ft", approvedVendorIds: ["vnd-shree-sand"], reorderLevel: 75, lastPurchasePrice: 2150, status: "active" },
  // Civil / Bricks
  { id: "mat-brick-fly", code: "BRK-FLY-01", name: "Fly Ash Bricks", category: "civil", subcategory: "bricks", unit: "nos", specification: "230x110x75 mm, IS 12894", approvedVendorIds: ["vnd-crescent-brick"], reorderLevel: 5000, lastPurchasePrice: 7.5, status: "active" },
  { id: "mat-brick-clay", code: "BRK-CLY-01", name: "Clay Bricks", category: "civil", subcategory: "bricks", unit: "nos", specification: "230x110x75 mm, table moulded", approvedVendorIds: ["vnd-crescent-brick"], reorderLevel: 4000, lastPurchasePrice: 6.2, status: "active" },
  // Electrical
  { id: "mat-ele-cable4c", code: "ELE-CAB-4C", name: "Copper Cable 4 Core", category: "electrical", subcategory: "wires", unit: "m", specification: "4 x 2.5 sq mm, FRLS", approvedVendorIds: ["vnd-havells"], reorderLevel: 500, lastPurchasePrice: 145, status: "active" },
  { id: "mat-ele-cable2c", code: "ELE-CAB-2C", name: "Copper Cable 2 Core", category: "electrical", subcategory: "wires", unit: "m", specification: "2 x 1.5 sq mm, FRLS", approvedVendorIds: ["vnd-havells"], reorderLevel: 600, lastPurchasePrice: 62, status: "active" },
  { id: "mat-ele-switch1g", code: "ELE-SW-1G", name: "Modular Switch 1 Gang", category: "electrical", subcategory: "switches", unit: "nos", specification: "6A, 240V", approvedVendorIds: ["vnd-havells"], reorderLevel: 150, lastPurchasePrice: 45, status: "active" },
  { id: "mat-ele-switchboard", code: "ELE-SB-08M", name: "Switchboard 8 Module", category: "electrical", subcategory: "switchboards", unit: "nos", specification: "Modular, PVC, 8 module", approvedVendorIds: ["vnd-havells"], reorderLevel: 40, lastPurchasePrice: 380, status: "active" },
  { id: "mat-ele-panel", code: "ELE-PNL-4W", name: "Distribution Panel Box 4-Way", category: "electrical", subcategory: "panel-boxes", unit: "nos", specification: "MCB distribution board, 4-way, IP42", approvedVendorIds: ["vnd-havells"], reorderLevel: 20, lastPurchasePrice: 1450, status: "active" },
  { id: "mat-ele-led18", code: "ELE-LED-18W", name: "LED Panel Light 18W", category: "electrical", subcategory: "lights", unit: "nos", specification: "18W, 6500K, round", approvedVendorIds: ["vnd-havells"], reorderLevel: 100, lastPurchasePrice: 265, status: "active" },
  // Plumbing
  { id: "mat-plb-upvc110", code: "PLB-PVC-110", name: "UPVC Pipe 110 mm", category: "plumbing", subcategory: "upvc-pipes", unit: "lengths", specification: "SWR, Type A, 3m length", approvedVendorIds: ["vnd-finolex"], reorderLevel: 40, lastPurchasePrice: 820, status: "active" },
  { id: "mat-plb-upvc75", code: "PLB-PVC-75", name: "UPVC Pipe 75 mm", category: "plumbing", subcategory: "upvc-pipes", unit: "lengths", specification: "SWR, Type A, 3m length", approvedVendorIds: ["vnd-finolex"], reorderLevel: 30, lastPurchasePrice: 540, status: "active" },
  { id: "mat-plb-cpvc25", code: "PLB-CPVC-25", name: "CPVC Pipe 25 mm", category: "plumbing", subcategory: "cpvc-pipes", unit: "lengths", specification: "SDR 11, hot & cold water", approvedVendorIds: ["vnd-finolex"], reorderLevel: 60, lastPurchasePrice: 310, status: "active" },
  { id: "mat-plb-elbow", code: "PLB-FIT-ELB", name: "UPVC Elbow Fitting 90°", category: "plumbing", subcategory: "fittings", unit: "nos", specification: "110 mm, solvent weld", approvedVendorIds: ["vnd-finolex"], reorderLevel: 80, lastPurchasePrice: 95, status: "active" },
  { id: "mat-plb-gatevalve", code: "PLB-VLV-GT25", name: "Gate Valve 25 mm", category: "plumbing", subcategory: "valves", unit: "nos", specification: "Brass, ISI marked", approvedVendorIds: ["vnd-finolex"], reorderLevel: 25, lastPurchasePrice: 210, status: "active" },
  // Fire & Safety
  { id: "mat-fire-pipe150", code: "FIR-PIP-150", name: "Fire Sprinkler Pipe 150 mm", category: "fire-safety", subcategory: "fire-pipes", unit: "lengths", specification: "MS ERW, Class C", approvedVendorIds: ["vnd-newage-fire"], reorderLevel: 15, lastPurchasePrice: 4250, status: "active" },
  { id: "mat-fire-pump", code: "FIR-PMP-01", name: "Fire Hydrant Pump 50HP", category: "fire-safety", subcategory: "fire-pumps", unit: "nos", specification: "Centrifugal, 2280 LPM @ 3.5 bar", approvedVendorIds: ["vnd-newage-fire"], reorderLevel: 2, lastPurchasePrice: 285000, status: "active" },
  { id: "mat-fire-sprinkler", code: "FIR-SPR-15", name: "Sprinkler Head 15 mm", category: "fire-safety", subcategory: "sprinklers", unit: "nos", specification: "Quartzoid bulb, 68°C", approvedVendorIds: ["vnd-newage-fire"], reorderLevel: 100, lastPurchasePrice: 175, status: "active" },
  // Finishing
  { id: "mat-fin-tile600", code: "FIN-TIL-600", name: "Vitrified Tile 600x600", category: "finishing", subcategory: "tiles", unit: "boxes", specification: "Glossy, 4 nos/box", approvedVendorIds: ["vnd-kajaria"], reorderLevel: 150, lastPurchasePrice: 1180, status: "active" },
  { id: "mat-fin-paint-em", code: "FIN-PNT-EM", name: "Emulsion Paint", category: "finishing", subcategory: "paint", unit: "litres", specification: "Interior premium emulsion", approvedVendorIds: ["vnd-asian-paints"], reorderLevel: 200, lastPurchasePrice: 385, status: "active" },
  { id: "mat-fin-paint-ext", code: "FIN-PNT-EX", name: "Exterior Weatherproof Paint", category: "finishing", subcategory: "paint", unit: "litres", specification: "Exterior emulsion, weatherproof", approvedVendorIds: ["vnd-asian-paints"], reorderLevel: 150, lastPurchasePrice: 420, status: "active" },
  { id: "mat-fin-door-flush", code: "FIN-DOR-FL", name: "Flush Door 32 mm", category: "finishing", subcategory: "doors", unit: "nos", specification: "Commercial ply, both side laminate", approvedVendorIds: ["vnd-asian-paints"], reorderLevel: 30, lastPurchasePrice: 6800, status: "active" },
  // Equipment
  { id: "mat-eqp-tanker", code: "EQP-TNK-10K", name: "Water Tanker 10,000 L", category: "equipment", subcategory: "water-tankers", unit: "nos", specification: "Mounted, mobile", approvedVendorIds: ["vnd-larsen-equip"], reorderLevel: 1, lastPurchasePrice: 420000, status: "active" },
  { id: "mat-eqp-mixer", code: "EQP-MCH-CM", name: "Concrete Mixer Machine", category: "equipment", subcategory: "machinery", unit: "nos", specification: "10/7 CFT, diesel", approvedVendorIds: ["vnd-larsen-equip"], reorderLevel: 2, lastPurchasePrice: 185000, status: "active" },
  { id: "mat-eqp-vibrator", code: "EQP-MCH-VB", name: "Concrete Needle Vibrator", category: "equipment", subcategory: "machinery", unit: "nos", specification: "40 mm needle, electric", approvedVendorIds: ["vnd-larsen-equip"], reorderLevel: 3, lastPurchasePrice: 24500, status: "active" },
  { id: "mat-eqp-scaffold", code: "EQP-TL-SCF", name: "Scaffolding Pipe Set", category: "equipment", subcategory: "tools", unit: "sets", specification: "MS pipe, cuplock system", approvedVendorIds: ["vnd-larsen-equip"], reorderLevel: 10, lastPurchasePrice: 18500, status: "active" },
];

export const MATERIALS = [...BASE_MATERIALS, ...IMPORTED_MATERIALS];
export function getMaterialByCode(materialCode) {
  return MATERIALS.find((material) => material.code === materialCode) ?? null;
}
export function getMaterialsByCategory(categoryId) {
  return MATERIALS.filter((material) => material.category === categoryId);
}

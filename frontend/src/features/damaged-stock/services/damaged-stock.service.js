import { qualityControlService } from "@/features/quality-control";
import { returnsService } from "@/features/returns";
import { getMaterialByCode } from "@/lib/mock-data/materials";
import { getProjectName } from "@/lib/mock-data/projects";
import { damageRecordsSchema } from "../schemas/damaged-stock.schema";

function materialValue(materialCode, quantity) {
  const material = getMaterialByCode(materialCode);
  return Math.round((material?.lastPurchasePrice ?? 0) * quantity * 100) / 100;
}

/** Damage records sourced from vendor-side QC rejections at goods inward. */
function fromQcRejections() {
  return qualityControlService
    .listAll()
    .filter((inspection) => inspection.rejectedQuantity > 0)
    .map((inspection) => ({
      id: `DMG-QC-${inspection.id}`,
      type: "damage",
      projectId: inspection.projectId,
      projectName: inspection.projectName,
      materialCode: inspection.materialCode,
      materialName: inspection.materialName,
      unit: inspection.unit,
      quantity: inspection.rejectedQuantity,
      financialValue: materialValue(
        inspection.materialCode,
        inspection.rejectedQuantity,
      ),
      reason: "vendor-defect",
      department: "stores",
      date: inspection.inspectedAt ?? new Date(0).toISOString(),
      sourceType: "qc-rejection",
      sourceId: inspection.id,
      remarks: inspection.remarks || "Rejected during goods-inward inspection.",
    }));
}

/** Damage records sourced from Return QC findings on unused issued material. */
function fromReturnInspections() {
  return returnsService
    .listAll()
    .filter((record) => record.inspection.damagedQuantity > 0)
    .map((record, index) => ({
      id: `DMG-RET-${record.id}`,
      type: "damage",
      projectId: record.projectId,
      projectName: record.projectName,
      materialCode: record.materialCode,
      materialName: record.materialName,
      unit: record.unit,
      quantity: record.inspection.damagedQuantity,
      financialValue: materialValue(
        record.materialCode,
        record.inspection.damagedQuantity,
      ),
      reason: index % 2 === 0 ? "site-handling" : "improper-storage",
      department: "stores",
      date: record.inspection.inspectedAt ?? record.returnedAt,
      sourceType: "return-inspection",
      sourceId: record.id,
      remarks:
        record.inspection.remarks || "Found damaged on return inspection.",
    }));
}

/**
 * Hand-authored incidents that never pass through QC or Returns: in-transit
 * damage, weather exposure, poor storage, expiry, accidental site damage,
 * and construction wastage (offcuts and process loss — deliberately kept
 * separate from "damage" per the product spec).
 */
const OTHER_RECORDS = [
  {
    id: "DMG-0001",
    type: "damage",
    projectId: "sita-heights",
    materialCode: "PLB-PVC-110",
    quantity: 6,
    reason: "transportation",
    department: "logistics",
    date: "2026-08-14T10:20:00+05:30",
    remarks: "Pipes cracked in transit; delivery vehicle suspension fault.",
  },
  {
    id: "DMG-0002",
    type: "damage",
    projectId: "sita-grove",
    materialCode: "FIN-TIL-600",
    quantity: 18,
    reason: "transportation",
    department: "logistics",
    date: "2026-08-02T09:10:00+05:30",
    remarks: "Tile boxes crushed during unloading at the site gate.",
  },
  {
    id: "DMG-0003",
    type: "damage",
    projectId: "sita-enclave",
    materialCode: "CEM-OPC-53",
    quantity: 40,
    reason: "weather",
    department: "stores",
    date: "2026-07-20T08:00:00+05:30",
    remarks: "Monsoon seepage into the open-yard cement stack.",
  },
  {
    id: "DMG-0004",
    type: "damage",
    projectId: "sita-meridian",
    materialCode: "FIN-PNT-EM",
    quantity: 12,
    reason: "improper-storage",
    department: "stores",
    date: "2026-07-25T11:30:00+05:30",
    remarks: "Paint drums stored without lids; partial evaporation and skinning.",
  },
  {
    id: "DMG-0005",
    type: "damage",
    projectId: "sita-crest",
    materialCode: "FIR-SPR-15",
    quantity: 15,
    reason: "expiry",
    department: "fire-safety",
    date: "2026-06-30T09:00:00+05:30",
    remarks: "Sprinkler head batch past certification date; withdrawn from use.",
  },
  {
    id: "DMG-0006",
    type: "damage",
    projectId: "sita-heights",
    materialCode: "ELE-LED-18W",
    quantity: 22,
    reason: "accidental-damage",
    department: "electrical",
    date: "2026-08-18T14:45:00+05:30",
    remarks: "Fixture cartons dropped from scaffold during first-fix.",
  },
  {
    id: "DMG-0007",
    type: "damage",
    projectId: "sita-greens",
    materialCode: "PLY-SHT-18",
    quantity: 9,
    reason: "improper-storage",
    department: "civil",
    date: "2026-07-05T10:00:00+05:30",
    remarks: "Plywood stacked directly on wet ground; warped sheets.",
  },
  {
    id: "DMG-0008",
    type: "damage",
    projectId: "sita-orchid",
    materialCode: "BRK-FLY-01",
    quantity: 350,
    reason: "accidental-damage",
    department: "civil",
    date: "2026-06-18T09:30:00+05:30",
    remarks: "Pallet collapse during forklift handling at the Orchid yard.",
  },
  {
    id: "WST-0001",
    type: "wastage",
    projectId: "sita-heights",
    materialCode: "FIN-TIL-600",
    quantity: 24,
    reason: "construction-wastage",
    department: "finishing",
    date: "2026-08-10T16:00:00+05:30",
    remarks: "Cutting waste from corner and edge tile fitting, Tower B.",
  },
  {
    id: "WST-0002",
    type: "wastage",
    projectId: "sita-enclave",
    materialCode: "PLY-SHT-18",
    quantity: 14,
    reason: "construction-wastage",
    department: "civil",
    date: "2026-07-22T15:20:00+05:30",
    remarks: "Shuttering offcuts after slab formwork, Block C.",
  },
  {
    id: "WST-0003",
    type: "wastage",
    projectId: "sita-grove",
    materialCode: "STL-TMT-08",
    quantity: 0.4,
    reason: "construction-wastage",
    department: "civil",
    date: "2026-07-28T13:00:00+05:30",
    remarks: "Rebar cutting and bending loss, slab reinforcement.",
  },
  {
    id: "WST-0004",
    type: "wastage",
    projectId: "sita-meridian",
    materialCode: "ELE-CAB-2C",
    quantity: 60,
    reason: "construction-wastage",
    department: "electrical",
    date: "2026-08-04T10:40:00+05:30",
    remarks: "Cable trimming loss across first-fix conduit runs.",
  },
  {
    id: "WST-0005",
    type: "wastage",
    projectId: "sita-crest",
    materialCode: "CEM-OPC-53",
    quantity: 8,
    reason: "construction-wastage",
    department: "civil",
    date: "2026-08-06T09:15:00+05:30",
    remarks: "Spillage during manual batching at the mixer.",
  },
  {
    id: "WST-0006",
    type: "wastage",
    projectId: "sita-riviera",
    materialCode: "FIN-PNT-EX",
    quantity: 9,
    reason: "construction-wastage",
    department: "finishing",
    date: "2026-05-20T11:00:00+05:30",
    remarks: "Roller and tray residue during exterior facade painting.",
  },
  {
    id: "WST-0007",
    type: "wastage",
    projectId: "sita-heights",
    materialCode: "PLB-PVC-75",
    quantity: 5,
    reason: "construction-wastage",
    department: "plumbing",
    date: "2026-08-12T14:10:00+05:30",
    remarks: "Pipe trimming loss fitting soil-and-waste risers.",
  },
  {
    id: "WST-0008",
    type: "wastage",
    projectId: "sita-orchid",
    materialCode: "SND-MFG-01",
    quantity: 3,
    reason: "construction-wastage",
    department: "civil",
    date: "2026-06-25T10:00:00+05:30",
    remarks: "Screed over-mix discarded at end of pour.",
  },
];
function fromOtherRecords() {
  return OTHER_RECORDS.map((record) => {
    const material = getMaterialByCode(record.materialCode);
    return {
      ...record,
      projectName: getProjectName(record.projectId),
      materialName: material?.name ?? record.materialCode,
      unit: material?.unit ?? "",
      financialValue: materialValue(record.materialCode, record.quantity),
      sourceType: "other",
      sourceId: null,
    };
  });
}

function buildDamageRecords() {
  return [
    ...fromQcRejections(),
    ...fromReturnInspections(),
    ...fromOtherRecords(),
  ].sort((first, second) => second.date.localeCompare(first.date));
}

let cachedRecords = null;
export const damagedStockService = {
  listAll() {
    if (!cachedRecords) {
      cachedRecords = damageRecordsSchema.parse(buildDamageRecords());
    }
    return cachedRecords;
  },
};

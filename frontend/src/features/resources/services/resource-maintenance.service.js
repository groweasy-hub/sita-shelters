import { resourceMaintenanceRecordsSchema } from "../schemas/resources.schema";

/** Hand-authored maintenance log spanning scheduled service, breakdown repair and inspection events. */
const RESOURCE_MAINTENANCE_RECORDS = [
  { id: "MNT-001", resourceId: "EXC-01", type: "scheduled", date: "2026-06-15", description: "Routine 250-hour service: oil, filters, hydraulic check", cost: 12000, performedBy: "CAT Service Center, Hyderabad", status: "completed" },
  { id: "MNT-002", resourceId: "EXC-02", type: "inspection", date: "2026-07-20", description: "Pre-deployment safety inspection", cost: 3500, performedBy: "JCB Authorized Workshop", status: "completed" },
  { id: "MNT-003", resourceId: "CM-02", type: "breakdown", date: "2026-08-20", description: "Drum motor failure, replacement in progress", cost: 28000, performedBy: "Site Mechanical Team", status: "in-progress" },
  { id: "MNT-004", resourceId: "CM-02", type: "scheduled", date: "2026-09-10", description: "Post-repair functional test and calibration", cost: 4000, performedBy: "Site Mechanical Team", status: "scheduled" },
  { id: "MNT-005", resourceId: "TC-01", type: "inspection", date: "2026-08-01", description: "Quarterly structural and wire rope inspection", cost: 18000, performedBy: "Potain Certified Inspector", status: "completed" },
  { id: "MNT-006", resourceId: "TC-02", type: "scheduled", date: "2026-09-05", description: "Annual load test and certification renewal", cost: 22000, performedBy: "Liebherr Service India", status: "scheduled" },
  { id: "MNT-007", resourceId: "WT-04", type: "breakdown", date: "2026-08-25", description: "Water pump seal leakage repair", cost: 8500, performedBy: "Site Mechanical Team", status: "in-progress" },
  { id: "MNT-008", resourceId: "WT-04", type: "scheduled", date: "2026-09-08", description: "Tank cleaning and pump reassembly", cost: 2000, performedBy: "Site Mechanical Team", status: "scheduled" },
  { id: "MNT-009", resourceId: "WT-01", type: "scheduled", date: "2026-07-01", description: "Half-yearly chassis and pump service", cost: 6000, performedBy: "Tata Motors Service Center", status: "completed" },
  { id: "MNT-010", resourceId: "SCF-04", type: "inspection", date: "2026-01-10", description: "Corrosion and structural integrity assessment", cost: 5000, performedBy: "Third-party Safety Auditor", status: "completed" },
  { id: "MNT-011", resourceId: "SCF-01", type: "scheduled", date: "2026-03-01", description: "Component count, coupler lubrication and replacement", cost: 3200, performedBy: "Site Store Team", status: "completed" },
  { id: "MNT-012", resourceId: "VEH-02", type: "scheduled", date: "2026-06-25", description: "40,000 km service: brakes, tyres, engine oil", cost: 9800, performedBy: "Ashok Leyland Authorized Workshop", status: "completed" },
  { id: "MNT-013", resourceId: "EQ-01", type: "scheduled", date: "2026-07-01", description: "500-hour generator service and load bank test", cost: 7000, performedBy: "Cummins Service Center", status: "completed" },
  { id: "MNT-014", resourceId: "EQ-02", type: "breakdown", date: "2026-08-28", description: "Alternator winding fault repair", cost: 15500, performedBy: "Cummins Service Center", status: "in-progress" },
  { id: "MNT-015", resourceId: "EQ-02", type: "scheduled", date: "2026-09-12", description: "Post-repair load test and commissioning", cost: 2500, performedBy: "Cummins Service Center", status: "scheduled" },
  { id: "MNT-016", resourceId: "TL-02", type: "breakdown", date: "2025-11-05", description: "Transformer burnout, deemed uneconomical to repair", cost: 4200, performedBy: "Site Mechanical Team", status: "completed" },
  { id: "MNT-017", resourceId: "BH-01", type: "scheduled", date: "2026-07-18", description: "1,000-hour comprehensive service", cost: 11000, performedBy: "JCB Authorized Workshop", status: "completed" },
  { id: "MNT-018", resourceId: "CM-03", type: "inspection", date: "2026-06-01", description: "Pre-mobilization safety and function check", cost: 2800, performedBy: "Site Mechanical Team", status: "completed" },
];

const mockResourceMaintenanceRecords = resourceMaintenanceRecordsSchema
  .parse(RESOURCE_MAINTENANCE_RECORDS)
  .sort((first, second) => second.date.localeCompare(first.date));

export const mockResourceMaintenanceAdapter = {
  listAll() {
    return mockResourceMaintenanceRecords;
  },
  listForResource(resourceId) {
    return mockResourceMaintenanceRecords.filter(
      (record) => record.resourceId === resourceId,
    );
  },
};
export function listResourceMaintenanceRecords() {
  return mockResourceMaintenanceAdapter.listAll();
}
export function listMaintenanceForResource(resourceId) {
  return mockResourceMaintenanceAdapter.listForResource(resourceId);
}

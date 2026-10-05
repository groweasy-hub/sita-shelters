import { resourceAssignmentsSchema } from "../schemas/resources.schema";

/**
 * Hand-authored deployment history. Most resources carry one or two closed
 * assignments plus, for anything currently `assigned`/`in-use`, one open
 * record (`assignedTo: null`) that matches the resource's `currentProjectId`
 * and `assignedSince` fields.
 */
const RESOURCE_ASSIGNMENTS = [
  { id: "ASG-001", resourceId: "EXC-01", projectId: "sita-heights", assignedFrom: "2026-07-01", assignedTo: null, assignedById: "usr-manoj-verma" },
  { id: "ASG-002", resourceId: "EXC-01", projectId: "sita-enclave", assignedFrom: "2026-03-01", assignedTo: "2026-06-25", assignedById: "usr-manoj-verma" },
  { id: "ASG-003", resourceId: "EXC-02", projectId: "sita-enclave", assignedFrom: "2026-08-10", assignedTo: null, assignedById: "usr-divya-menon" },
  { id: "ASG-004", resourceId: "EXC-02", projectId: "sita-grove", assignedFrom: "2026-05-01", assignedTo: "2026-08-05", assignedById: "usr-suresh-babu" },
  { id: "ASG-005", resourceId: "CM-01", projectId: "sita-heights", assignedFrom: "2026-01-10", assignedTo: "2026-03-30", assignedById: "usr-priyanka-das" },
  { id: "ASG-006", resourceId: "CM-01", projectId: "sita-crest", assignedFrom: "2025-10-01", assignedTo: "2025-12-20", assignedById: "usr-manoj-verma" },
  { id: "ASG-007", resourceId: "CM-02", projectId: "sita-grove", assignedFrom: "2026-02-01", assignedTo: "2026-08-15", assignedById: "usr-suresh-babu" },
  { id: "ASG-008", resourceId: "CM-03", projectId: "sita-grove", assignedFrom: "2026-08-01", assignedTo: null, assignedById: "usr-suresh-babu" },
  { id: "ASG-009", resourceId: "CM-03", projectId: "sita-meridian", assignedFrom: "2026-04-01", assignedTo: "2026-07-25", assignedById: "usr-sneha-kapoor" },
  { id: "ASG-010", resourceId: "TC-01", projectId: "sita-heights", assignedFrom: "2026-02-15", assignedTo: null, assignedById: "usr-manoj-verma" },
  { id: "ASG-011", resourceId: "TC-01", projectId: "sita-riviera", assignedFrom: "2025-05-01", assignedTo: "2026-01-30", assignedById: "usr-manoj-verma" },
  { id: "ASG-012", resourceId: "TC-02", projectId: "sita-enclave", assignedFrom: "2026-06-20", assignedTo: null, assignedById: "usr-divya-menon" },
  { id: "ASG-013", resourceId: "TC-02", projectId: "sita-crest", assignedFrom: "2025-12-01", assignedTo: "2026-06-10", assignedById: "usr-manoj-verma" },
  { id: "ASG-014", resourceId: "BH-01", projectId: "sita-enclave", assignedFrom: "2026-03-15", assignedTo: "2026-07-10", assignedById: "usr-divya-menon" },
  { id: "ASG-015", resourceId: "WT-01", projectId: "sita-heights", assignedFrom: "2026-08-15", assignedTo: null, assignedById: "usr-priyanka-das" },
  { id: "ASG-016", resourceId: "WT-01", projectId: "sita-grove", assignedFrom: "2026-05-01", assignedTo: "2026-08-10", assignedById: "usr-vikram-shetty" },
  { id: "ASG-017", resourceId: "WT-02", projectId: "sita-grove", assignedFrom: "2026-07-25", assignedTo: null, assignedById: "usr-vikram-shetty" },
  { id: "ASG-018", resourceId: "WT-02", projectId: "sita-meridian", assignedFrom: "2026-03-01", assignedTo: "2026-07-20", assignedById: "usr-sneha-kapoor" },
  { id: "ASG-019", resourceId: "WT-03", projectId: "sita-crest", assignedFrom: "2026-01-01", assignedTo: "2026-05-25", assignedById: "usr-manoj-verma" },
  { id: "ASG-020", resourceId: "WT-04", projectId: "sita-heights", assignedFrom: "2026-02-01", assignedTo: "2026-08-20", assignedById: "usr-priyanka-das" },
  { id: "ASG-021", resourceId: "SCF-01", projectId: "sita-heights", assignedFrom: "2026-05-01", assignedTo: null, assignedById: "usr-priyanka-das" },
  { id: "ASG-022", resourceId: "SCF-01", projectId: "sita-orchid", assignedFrom: "2025-08-01", assignedTo: "2026-04-25", assignedById: "usr-sneha-kapoor" },
  { id: "ASG-023", resourceId: "SCF-02", projectId: "sita-enclave", assignedFrom: "2026-06-15", assignedTo: null, assignedById: "usr-divya-menon" },
  { id: "ASG-024", resourceId: "SCF-02", projectId: "sita-grove", assignedFrom: "2026-01-01", assignedTo: "2026-06-10", assignedById: "usr-suresh-babu" },
  { id: "ASG-025", resourceId: "SCF-03", projectId: "sita-meridian", assignedFrom: "2025-11-01", assignedTo: "2026-06-30", assignedById: "usr-sneha-kapoor" },
  { id: "ASG-026", resourceId: "SCF-04", projectId: "sita-crest", assignedFrom: "2025-06-01", assignedTo: "2026-01-05", assignedById: "usr-manoj-verma" },
  { id: "ASG-027", resourceId: "VEH-01", projectId: "sita-crest", assignedFrom: "2026-08-05", assignedTo: null, assignedById: "usr-manoj-verma" },
  { id: "ASG-028", resourceId: "VEH-01", projectId: "sita-heights", assignedFrom: "2026-02-01", assignedTo: "2026-07-30", assignedById: "usr-priyanka-das" },
  { id: "ASG-029", resourceId: "VEH-02", projectId: "sita-meridian", assignedFrom: "2026-07-12", assignedTo: null, assignedById: "usr-sneha-kapoor" },
  { id: "ASG-030", resourceId: "VEH-02", projectId: "sita-grove", assignedFrom: "2026-02-15", assignedTo: "2026-07-05", assignedById: "usr-suresh-babu" },
  { id: "ASG-031", resourceId: "VEH-03", projectId: "sita-enclave", assignedFrom: "2026-01-15", assignedTo: "2026-05-20", assignedById: "usr-divya-menon" },
  { id: "ASG-032", resourceId: "EQ-01", projectId: "sita-heights", assignedFrom: "2026-04-15", assignedTo: null, assignedById: "usr-priyanka-das" },
  { id: "ASG-033", resourceId: "EQ-01", projectId: "sita-enclave", assignedFrom: "2025-09-01", assignedTo: "2026-04-10", assignedById: "usr-divya-menon" },
  { id: "ASG-034", resourceId: "EQ-02", projectId: "sita-grove", assignedFrom: "2026-03-01", assignedTo: "2026-08-22", assignedById: "usr-suresh-babu" },
  { id: "ASG-035", resourceId: "TL-01", projectId: "sita-grove", assignedFrom: "2026-08-10", assignedTo: null, assignedById: "usr-suresh-babu" },
  { id: "ASG-036", resourceId: "TL-01", projectId: "sita-heights", assignedFrom: "2026-04-01", assignedTo: "2026-08-05", assignedById: "usr-priyanka-das" },
  { id: "ASG-037", resourceId: "TL-02", projectId: "sita-meridian", assignedFrom: "2025-07-01", assignedTo: "2025-11-01", assignedById: "usr-sneha-kapoor" },
];

const mockResourceAssignments = resourceAssignmentsSchema
  .parse(RESOURCE_ASSIGNMENTS)
  .sort((first, second) => second.assignedFrom.localeCompare(first.assignedFrom));

export const mockResourceAssignmentsAdapter = {
  listAll() {
    return mockResourceAssignments;
  },
  listForResource(resourceId) {
    return mockResourceAssignments.filter(
      (assignment) => assignment.resourceId === resourceId,
    );
  },
};
export function listResourceAssignments() {
  return mockResourceAssignmentsAdapter.listAll();
}
export function listAssignmentsForResource(resourceId) {
  return mockResourceAssignmentsAdapter.listForResource(resourceId);
}

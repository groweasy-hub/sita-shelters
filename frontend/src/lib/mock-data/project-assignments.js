/**
 * Per-project role and access level for users whose `USERS.projectIds` scopes
 * them to specific projects. Workspace-wide roles (see `ROLE_ACCESS_SCOPE` in
 * `src/config/permissions.js`) are not listed here — they see every project
 * without a row-level grant.
 *
 * `accessLevel` is one of "view" | "operational" | "management" | "approval",
 * matching the four access levels the Access & Permissions module surfaces.
 */
export const PROJECT_ASSIGNMENTS = {
  "usr-manoj-verma": [
    { projectId: "sita-heights", roleOnProject: "Project Manager", accessLevel: "management" },
    { projectId: "sita-enclave", roleOnProject: "Project Manager", accessLevel: "management" },
    { projectId: "sita-crest", roleOnProject: "Project Manager", accessLevel: "management" },
  ],
  "usr-sneha-kapoor": [
    { projectId: "sita-grove", roleOnProject: "Project Manager", accessLevel: "management" },
    { projectId: "sita-meridian", roleOnProject: "Project Manager", accessLevel: "management" },
    { projectId: "sita-greens", roleOnProject: "Project Manager", accessLevel: "management" },
  ],
  "usr-rahul-iyer": [
    { projectId: "sita-heights", roleOnProject: "Site Engineer", accessLevel: "operational" },
  ],
  "usr-divya-menon": [
    { projectId: "sita-enclave", roleOnProject: "Site Engineer", accessLevel: "operational" },
  ],
  "usr-suresh-babu": [
    { projectId: "sita-grove", roleOnProject: "Site Engineer", accessLevel: "operational" },
  ],
  "usr-priyanka-das": [
    { projectId: "sita-heights", roleOnProject: "Store Manager", accessLevel: "operational" },
  ],
  "usr-vikram-shetty": [
    { projectId: "sita-enclave", roleOnProject: "Store Manager", accessLevel: "operational" },
    { projectId: "sita-greens", roleOnProject: "Store Manager", accessLevel: "view" },
  ],
  "usr-ritu-agarwal": [
    { projectId: "sita-heights", roleOnProject: "Quality Inspector", accessLevel: "approval" },
    { projectId: "sita-enclave", roleOnProject: "Quality Inspector", accessLevel: "approval" },
    { projectId: "sita-grove", roleOnProject: "Quality Inspector (Additional)", accessLevel: "view" },
  ],
  "usr-naveen-pillai": [
    { projectId: "sita-meridian", roleOnProject: "Quality Inspector", accessLevel: "approval" },
    { projectId: "sita-crest", roleOnProject: "Quality Inspector", accessLevel: "approval" },
  ],
  "usr-ramesh-yadav": [
    { projectId: "sita-heights", roleOnProject: "Gate Man", accessLevel: "operational" },
  ],
  "usr-babji": [
    { projectId: "sita-heights", roleOnProject: "Project Head", accessLevel: "management" },
  ],
  "usr-ashok": [
    { projectId: "sita-heights", roleOnProject: "Site Executive", accessLevel: "operational" },
  ],
  "usr-hari": [
    { projectId: "sita-heights", roleOnProject: "Site Executive", accessLevel: "operational" },
  ],
  "usr-vijay": [
    { projectId: "sita-heights", roleOnProject: "Site Engineer", accessLevel: "operational" },
  ],
  "usr-anji": [
    { projectId: "sita-heights", roleOnProject: "Site Supervisor", accessLevel: "approval" },
  ],
  "usr-naidu": [
    { projectId: "sita-heights", roleOnProject: "Site Supervisor", accessLevel: "approval" },
  ],
  "usr-site-accountant": [
    { projectId: "sita-heights", roleOnProject: "Project Accountant", accessLevel: "view" },
  ],
};
export function getProjectAssignments(userId) {
  return PROJECT_ASSIGNMENTS[userId] ?? [];
}

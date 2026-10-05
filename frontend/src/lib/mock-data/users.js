import { ROLE_LABELS } from "@/config/permissions";

/**
 * Canonical internal user directory. Indents, approvals, QC inspections,
 * issues and administration all reference a user by `id`.
 */
export const USERS = [
  { id: "usr-arjun-rao", name: "Arjun Rao", email: "arjun.rao@sitashelters-example.com", role: "super-admin", projectIds: [] },
  { id: "usr-kavita-nair", name: "Kavita Nair", email: "kavita.nair@sitashelters-example.com", role: "administrator", projectIds: [] },
  { id: "usr-manoj-verma", name: "Manoj Verma", email: "manoj.verma@sitashelters-example.com", role: "project-manager", projectIds: ["sita-heights", "sita-enclave"] },
  { id: "usr-sneha-kapoor", name: "Sneha Kapoor", email: "sneha.kapoor@sitashelters-example.com", role: "project-manager", projectIds: ["sita-grove", "sita-meridian"] },
  { id: "usr-rahul-iyer", name: "Rahul Iyer", email: "rahul.iyer@sitashelters-example.com", role: "site-engineer", projectIds: ["sita-heights"] },
  { id: "usr-divya-menon", name: "Divya Menon", email: "divya.menon@sitashelters-example.com", role: "site-engineer", projectIds: ["sita-enclave"] },
  { id: "usr-suresh-babu", name: "Suresh Babu", email: "suresh.babu@sitashelters-example.com", role: "site-engineer", projectIds: ["sita-grove"] },
  { id: "usr-priyanka-das", name: "Priyanka Das", email: "priyanka.das@sitashelters-example.com", role: "store-manager", projectIds: ["sita-heights"] },
  { id: "usr-vikram-shetty", name: "Vikram Shetty", email: "vikram.shetty@sitashelters-example.com", role: "store-manager", projectIds: ["sita-enclave", "sita-greens"] },
  { id: "usr-alok-mishra", name: "Alok Mishra", email: "alok.mishra@sitashelters-example.com", role: "procurement-manager", projectIds: [] },
  { id: "usr-farah-khan", name: "Farah Khan", email: "farah.khan@sitashelters-example.com", role: "procurement-manager", projectIds: [] },
  { id: "usr-ritu-agarwal", name: "Ritu Agarwal", email: "ritu.agarwal@sitashelters-example.com", role: "quality-inspector", projectIds: ["sita-heights", "sita-enclave", "sita-grove"] },
  { id: "usr-naveen-pillai", name: "Naveen Pillai", email: "naveen.pillai@sitashelters-example.com", role: "quality-inspector", projectIds: ["sita-meridian", "sita-crest"] },
  { id: "usr-geeta-suresh", name: "Geeta Suresh", email: "geeta.suresh@sitashelters-example.com", role: "finance-manager", projectIds: [] },
  { id: "usr-imran-sheikh", name: "Imran Sheikh", email: "imran.sheikh@sitashelters-example.com", role: "viewer", projectIds: [] },
  { id: "usr-ramesh-yadav", name: "Ramesh Yadav", email: "ramesh.yadav@sitashelters-example.com", role: "gate-man", projectIds: ["sita-heights"] },
  // SITA Heights site team
  { id: "usr-babji", name: "Babji", email: "babji@sitashelters-example.com", role: "project-head", projectIds: ["sita-heights"] },
  { id: "usr-ashok", name: "Ashok", email: "ashok@sitashelters-example.com", role: "site-executive", projectIds: ["sita-heights"] },
  { id: "usr-hari", name: "Hari", email: "hari@sitashelters-example.com", role: "site-executive", projectIds: ["sita-heights"] },
  { id: "usr-vijay", name: "Vijay", email: "vijay@sitashelters-example.com", role: "site-engineer", projectIds: ["sita-heights"] },
  { id: "usr-anji", name: "Anji", email: "anji@sitashelters-example.com", role: "supervisor", projectIds: ["sita-heights"] },
  { id: "usr-naidu", name: "Naidu", email: "naidu@sitashelters-example.com", role: "supervisor", projectIds: ["sita-heights"] },
  { id: "usr-site-accountant", name: "Project Accountant", email: "accounts.site@sitashelters-example.com", role: "project-accountant", projectIds: ["sita-heights"] },
  // HQ roles without a named holder yet — accounts kept for role-based demo access
  { id: "usr-hq-accountant", name: "HQ Accountant", email: "hq.accountant@sitashelters-example.com", role: "hq-accountant", projectIds: [] },
  { id: "usr-hq-design", name: "HQ Design", email: "hq.design@sitashelters-example.com", role: "hq-design", projectIds: [] },
  { id: "usr-hq-operations-head", name: "HQ Operations Head", email: "hq.operations@sitashelters-example.com", role: "hq-operations-head", projectIds: [] },
  { id: "usr-hq-ceo", name: "HQ CEO", email: "hq.ceo@sitashelters-example.com", role: "hq-ceo", projectIds: [] },
  { id: "usr-hq-md", name: "HQ MD", email: "hq.md@sitashelters-example.com", role: "hq-md", projectIds: [] },
];
export function getUserById(userId) {
  return USERS.find((user) => user.id === userId) ?? null;
}
export function getUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return USERS.find((user) => user.email.toLowerCase() === normalized) ?? null;
}
export function getUserName(userId) {
  return getUserById(userId)?.name ?? userId;
}
/** "Name — Role Label", for audit trails where who-did-it needs to be unambiguous. */
export function getUserNameWithRole(userId) {
  const user = getUserById(userId);
  if (!user) return userId;
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;
  return `${user.name} — ${roleLabel}`;
}
export function getUserRoleLabel(userId) {
  const user = getUserById(userId);
  return user ? (ROLE_LABELS[user.role] ?? user.role) : null;
}
export function getUsersByRole(role) {
  return USERS.filter((user) => user.role === role);
}

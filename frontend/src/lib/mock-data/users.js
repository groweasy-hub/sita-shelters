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
  // Construction site role master supplied for SITA Heights
  { id: "usr-srikanth-project-manager", name: "Srikanth", email: "srikanth.project@sitashelters-example.com", role: "project-manager", projectIds: ["sita-heights"] },
  { id: "usr-vijay-site-manager", name: "Vijay", email: "vijay.site-manager@sitashelters-example.com", role: "site-manager", projectIds: ["sita-heights"] },
  { id: "usr-vijay-civil-engineer", name: "Vijay", email: "vijay.civil@sitashelters-example.com", role: "civil-engineer", projectIds: ["sita-heights"] },
  { id: "usr-zaki-structural-engineer", name: "Zaki", email: "zaki@sitashelters-example.com", role: "structural-engineer", projectIds: ["sita-heights"] },
  { id: "usr-aslam-architect", name: "Aslam", email: "aslam@sitashelters-example.com", role: "architect", projectIds: [] },
  { id: "usr-srikanth-procurement-manager", name: "Srikanth", email: "srikanth.procurement@sitashelters-example.com", role: "procurement-manager", projectIds: [] },
  { id: "usr-vamandas-purchase-officer", name: "Vamandas", email: "vamandas@sitashelters-example.com", role: "purchase-officer", projectIds: [] },
  { id: "usr-bharathi-store-manager", name: "Bharathi", email: "bharathi@sitashelters-example.com", role: "store-manager", projectIds: ["sita-heights"] },
  { id: "usr-kapston-security", name: "Kapston", email: "kapston.security@sitashelters-example.com", role: "security-guard", projectIds: ["sita-heights"] },
  { id: "usr-hanuman-accountant", name: "Hanuman", email: "hanuman@sitashelters-example.com", role: "accountant", projectIds: ["sita-heights"] },
  { id: "usr-abhillash-hr-admin", name: "Abhillash", email: "abhillash@sitashelters-example.com", role: "hr-admin", projectIds: [] },
  { id: "usr-bj-contractor", name: "BJ", email: "bj.contractor@sitashelters-example.com", role: "contractor", projectIds: ["sita-heights"] },
  { id: "usr-raju-labour", name: "Raju", email: "raju.labour@sitashelters-example.com", role: "labour-worker", projectIds: ["sita-heights"] },
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
export function getUsersByRole(role) {
  return USERS.filter((user) => user.role === role);
}

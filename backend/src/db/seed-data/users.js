/**
 * Seed copy of the user roster. Kept in sync by hand with
 * frontend/src/lib/mock-data/users.js — see the note in
 * backend/src/permissions.js on why the two packages don't share files at
 * runtime.
 *
 * Trimmed to the procurement + site stock pilot's five roles only (see
 * `pilot-logins.js`) — every other demo account was removed from the
 * database by request, so seeding from a clean slate must not resurrect
 * them.
 *
 * Every `projectIds` below is empty: the demo projects they used to
 * reference were deleted, and projects are now created manually through
 * the app — assign each user to a real project from there (Add user /
 * Add project) instead of through seeding.
 */
export const USERS = [
  { id: "usr-arjun-rao", name: "Arjun Rao", email: "arjun.rao@sitashelters-example.com", role: "super-admin", projectIds: [] },
  { id: "usr-manoj-verma", name: "Manoj Verma", email: "manoj.verma@sitashelters-example.com", role: "project-manager", projectIds: [] },
  { id: "usr-rahul-iyer", name: "Rahul Iyer", email: "rahul.iyer@sitashelters-example.com", role: "site-engineer", projectIds: [] },
  { id: "usr-priyanka-das", name: "Priyanka Das", email: "priyanka.das@sitashelters-example.com", role: "store-manager", projectIds: [] },
  { id: "usr-alok-mishra", name: "Alok Mishra", email: "alok.mishra@sitashelters-example.com", role: "procurement-manager", projectIds: [] },
];

// The one account that can sign in immediately after a fresh deploy, so
// there's always a way in to invite/manage everyone else. Every other
// seeded account starts with no usable password until an admin issues one.
export const BOOTSTRAP_SUPER_ADMIN_ID = "usr-arjun-rao";

/**
 * Fixed demo credentials for the procurement + site stock pilot, so the
 * same handful of accounts can be signed into repeatedly while testing
 * the Indent -> Quotation -> PO -> GRN -> Approvals -> Stock flow, instead
 * of drawing a fresh one-time password from the seed log every run (see
 * `seedBootstrapSuperAdmin` in `seed.js`). One user id per role in that
 * workflow; matching emails/password documented in `backend/.env`.
 */
export const PILOT_LOGIN_USER_IDS = [
  "usr-arjun-rao", // super-admin — full access, for setup/admin checks
  "usr-alok-mishra", // procurement-manager — HO Procurement: quotations, PO
  "usr-manoj-verma", // project-manager — final GRN/PO approval
  "usr-rahul-iyer", // site-engineer — raises indent, first GRN approval
  "usr-priyanka-das", // store-manager — site store incharge: creates GRN
];

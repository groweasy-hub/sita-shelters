import { TABLE_DEFAULTS } from "@/config/constants";

/**
 * Account lifecycle values for the administration user directory. These are
 * presentation-only; a future backend owns the authoritative account state.
 */
export const ADMIN_USER_STATUS_VALUES = ["active", "invited", "inactive"];
export const ADMIN_USER_STATUS_OPTIONS = ADMIN_USER_STATUS_VALUES.map(
  (value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  }),
);
export const ADMIN_USER_SORT_FIELDS = [
  "name",
  "email",
  "role",
  "status",
  "lastLoginAt",
];
export const ADMIN_USER_PAGE_SIZE_OPTIONS = TABLE_DEFAULTS.pageSizeOptions;
export const ADMIN_USER_DEFAULT_LIST_PARAMS = {
  role: null,
  status: null,
  search: "",
  page: TABLE_DEFAULTS.page,
  pageSize: TABLE_DEFAULTS.pageSize,
  sortBy: "name",
  sortDirection: "asc",
};
export const administrationQueryKeys = {
  all: ["administration"],
  users: () => [...administrationQueryKeys.all, "users"],
  usersList: (params) => [...administrationQueryKeys.users(), "list", params],
  usersAll: () => [...administrationQueryKeys.users(), "all"],
  usersDetail: (userId) => [
    ...administrationQueryKeys.users(),
    "detail",
    userId,
  ],
};
/**
 * Presentation-only account fields layered on top of the canonical `USERS`
 * directory (`src/lib/mock-data/users.js`), keyed by user id. Fixed literal
 * ISO timestamps only, so renders stay deterministic across the session.
 */
export const ADMIN_USER_ACCOUNT_DETAILS = {
  "usr-arjun-rao": {
    status: "active",
    lastLoginAt: "2026-09-04T08:15:00+05:30",
  },
  "usr-kavita-nair": {
    status: "active",
    lastLoginAt: "2026-09-03T18:42:00+05:30",
  },
  "usr-manoj-verma": {
    status: "active",
    lastLoginAt: "2026-09-04T07:05:00+05:30",
  },
  "usr-sneha-kapoor": {
    status: "active",
    lastLoginAt: "2026-09-02T16:20:00+05:30",
  },
  "usr-rahul-iyer": {
    status: "active",
    lastLoginAt: "2026-09-03T09:12:00+05:30",
  },
  "usr-divya-menon": { status: "invited", lastLoginAt: null },
  "usr-suresh-babu": {
    status: "active",
    lastLoginAt: "2026-08-29T11:47:00+05:30",
  },
  "usr-priyanka-das": {
    status: "active",
    lastLoginAt: "2026-09-01T14:05:00+05:30",
  },
  "usr-vikram-shetty": {
    status: "active",
    lastLoginAt: "2026-08-31T10:30:00+05:30",
  },
  "usr-alok-mishra": {
    status: "active",
    lastLoginAt: "2026-09-03T12:00:00+05:30",
  },
  "usr-farah-khan": { status: "invited", lastLoginAt: null },
  "usr-ritu-agarwal": {
    status: "active",
    lastLoginAt: "2026-09-02T09:55:00+05:30",
  },
  "usr-naveen-pillai": {
    status: "inactive",
    lastLoginAt: "2026-07-15T10:00:00+05:30",
  },
  "usr-geeta-suresh": {
    status: "active",
    lastLoginAt: "2026-09-04T06:40:00+05:30",
  },
  "usr-imran-sheikh": {
    status: "inactive",
    lastLoginAt: "2026-06-20T15:22:00+05:30",
  },
  "usr-ramesh-yadav": {
    status: "active",
    lastLoginAt: "2026-09-05T06:40:00+05:30",
  },
  "usr-babji": {
    status: "active",
    lastLoginAt: "2026-09-05T08:05:00+05:30",
  },
  "usr-ashok": {
    status: "active",
    lastLoginAt: "2026-09-05T07:10:00+05:30",
  },
  "usr-hari": {
    status: "active",
    lastLoginAt: "2026-09-04T18:30:00+05:30",
  },
  "usr-vijay": {
    status: "active",
    lastLoginAt: "2026-09-05T09:00:00+05:30",
  },
  "usr-anji": {
    status: "active",
    lastLoginAt: "2026-09-04T16:45:00+05:30",
  },
  "usr-naidu": {
    status: "active",
    lastLoginAt: "2026-09-05T06:55:00+05:30",
  },
  "usr-site-accountant": {
    status: "active",
    lastLoginAt: "2026-09-04T11:20:00+05:30",
  },
  "usr-hq-accountant": { status: "invited", lastLoginAt: null },
  "usr-hq-design": { status: "invited", lastLoginAt: null },
  "usr-hq-operations-head": { status: "invited", lastLoginAt: null },
  "usr-hq-ceo": { status: "invited", lastLoginAt: null },
  "usr-hq-md": { status: "invited", lastLoginAt: null },
  "usr-srikanth-project-manager": {
    status: "active",
    lastLoginAt: "2026-09-10T09:15:00+05:30",
  },
  "usr-vijay-site-manager": {
    status: "active",
    lastLoginAt: "2026-09-10T08:45:00+05:30",
  },
  "usr-vijay-civil-engineer": {
    status: "active",
    lastLoginAt: "2026-09-09T17:20:00+05:30",
  },
  "usr-zaki-structural-engineer": {
    status: "active",
    lastLoginAt: "2026-09-09T11:10:00+05:30",
  },
  "usr-aslam-architect": {
    status: "active",
    lastLoginAt: "2026-09-08T15:30:00+05:30",
  },
  "usr-srikanth-procurement-manager": {
    status: "active",
    lastLoginAt: "2026-09-10T12:05:00+05:30",
  },
  "usr-vamandas-purchase-officer": {
    status: "active",
    lastLoginAt: "2026-09-09T10:40:00+05:30",
  },
  "usr-bharathi-store-manager": {
    status: "active",
    lastLoginAt: "2026-09-10T07:55:00+05:30",
  },
  "usr-kapston-security": {
    status: "active",
    lastLoginAt: "2026-09-10T06:30:00+05:30",
  },
  "usr-hanuman-accountant": {
    status: "active",
    lastLoginAt: "2026-09-09T18:10:00+05:30",
  },
  "usr-abhillash-hr-admin": {
    status: "active",
    lastLoginAt: "2026-09-09T14:25:00+05:30",
  },
  "usr-bj-contractor": {
    status: "invited",
    lastLoginAt: null,
  },
  "usr-raju-labour": {
    status: "active",
    lastLoginAt: "2026-09-10T07:20:00+05:30",
  },
};
/** Roles whose users are treated as workspace administrators for KPI purposes. */
export const ADMIN_ROLE_VALUES = ["super-admin", "administrator"];

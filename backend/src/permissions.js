/**
 * Server-side copy of the role -> permission map from
 * frontend/src/config/permissions.js. Duplicated deliberately: this backend
 * and the frontend are separately deployed packages with their own
 * package.json, so true code-sharing would mean npm workspaces or a
 * published package — real overhead for one static config file at this
 * project's size. Keep the two in sync by hand; revisit if they drift or
 * more shared logic accumulates.
 */

export const APP_ROLES = [
  "super-admin",
  "administrator",
  "project-head",
  "project-manager",
  "site-executive",
  "site-engineer",
  "supervisor",
  "gate-man",
  "store-manager",
  "project-accountant",
  "quality-inspector",
  "procurement-manager",
  "finance-manager",
  "hq-accountant",
  "hq-design",
  "hq-operations-head",
  "hq-ceo",
  "hq-md",
  "viewer",
];

export const PERMISSIONS = [
  "dashboard:view",
  "projects:view",
  "projects:manage",
  "materials:view",
  "materials:manage",
  "inventory:view",
  "inventory:manage",
  "indents:view",
  "indents:create",
  "indents:review",
  "indents:approve",
  "procurement:view",
  "procurement:manage",
  "procurement:approve",
  "billing:view",
  "inward:view",
  "inward:manage",
  "inward:engineer-approve",
  "inward:manager-approve",
  "inward:confirm-receipt",
  "quality-control:view",
  "quality-control:manage",
  "quality-control:approve",
  "material-issues:view",
  "material-issues:manage",
  "consumption:view",
  "consumption:manage",
  "consumption:confirm",
  "returns:view",
  "returns:manage",
  "stock-transfers:view",
  "stock-transfers:manage",
  "stock-transfers:approve",
  "vendors:view",
  "vendors:manage",
  "resources:view",
  "resources:manage",
  "reports:view",
  "reports:export",
  "administration:view",
  "administration:users:manage",
  "administration:roles:manage",
  "administration:settings:manage",
];
const VIEWER_PERMISSIONS = [
  "dashboard:view",
  "projects:view",
  "materials:view",
  "inventory:view",
  "indents:view",
  "procurement:view",
  "inward:view",
  "quality-control:view",
  "material-issues:view",
  "consumption:view",
  "returns:view",
  "stock-transfers:view",
  "vendors:view",
  "resources:view",
  "reports:view",
];
const BUSINESS_PERMISSIONS = PERMISSIONS.filter(
  (permission) => !permission.startsWith("administration:"),
);
/**
 * Project Head/Manager records vendor quotations against a shortfall
 * (rate, quality, quantity per vendor) but does not approve them —
 * reviewing quotations, selecting the winning vendor and placing the
 * purchase order is HO Procurement's job (`procurement-manager`, which
 * holds `procurement:approve`). Hence `procurement:manage` without
 * `procurement:approve` here. `vendors:view`/`vendors:manage` let them
 * check vendor performance and register a new vendor while quoting,
 * whether re-ordering from an existing vendor or bringing in a new one.
 */
const PROJECT_LEADERSHIP_PERMISSIONS = [
  "dashboard:view",
  "materials:view",
  "materials:manage",
  "inventory:view",
  "inventory:manage",
  "indents:view",
  "indents:create",
  "indents:review",
  "indents:approve",
  "procurement:view",
  "procurement:manage",
  "billing:view",
  "inward:view",
  "inward:manage",
  "inward:manager-approve",
  "quality-control:view",
  "quality-control:manage",
  "quality-control:approve",
  "material-issues:view",
  "material-issues:manage",
  "consumption:view",
  "consumption:manage",
  "consumption:confirm",
  "returns:view",
  "returns:manage",
  "stock-transfers:view",
  "stock-transfers:manage",
  "stock-transfers:approve",
  "vendors:view",
  "vendors:manage",
];
export const ROLE_PERMISSIONS = {
  "super-admin": PERMISSIONS,
  administrator: PERMISSIONS,
  "project-head": PROJECT_LEADERSHIP_PERMISSIONS,
  "project-manager": PROJECT_LEADERSHIP_PERMISSIONS,
  "site-executive": [
    "dashboard:view",
    "materials:view",
    "inventory:view",
    "indents:view",
    "indents:create",
    "indents:review",
    "inward:view",
    "quality-control:view",
    "material-issues:view",
    "material-issues:manage",
    "consumption:view",
    "consumption:manage",
    "returns:view",
    "returns:manage",
    "stock-transfers:view",
    "stock-transfers:manage",
  ],
  "site-engineer": [
    "dashboard:view",
    "materials:view",
    "inventory:view",
    "indents:view",
    "indents:create",
    "billing:view",
    "inward:view",
    "inward:manage",
    "inward:engineer-approve",
    "quality-control:view",
    "quality-control:manage",
    "quality-control:approve",
    "consumption:view",
    "consumption:manage",
    "consumption:confirm",
    "returns:view",
  ],
  "store-manager": [
    "dashboard:view",
    "materials:view",
    "inventory:view",
    "inventory:manage",
    "indents:view",
    "indents:create",
    "billing:view",
    "inward:view",
    "inward:manage",
    "inward:confirm-receipt",
    "quality-control:view",
    "material-issues:view",
    "material-issues:manage",
    "consumption:view",
    "consumption:manage",
    "returns:view",
    "returns:manage",
    "stock-transfers:view",
    "stock-transfers:manage",
  ],
  "gate-man": [
    "dashboard:view",
    "inward:view",
    "inward:manage",
    "stock-transfers:view",
    "stock-transfers:manage",
    "returns:view",
  ],
  supervisor: [
    "dashboard:view",
    "materials:view",
    "inventory:view",
    "indents:view",
    "indents:review",
    "inward:view",
    "quality-control:view",
    "quality-control:manage",
    "quality-control:approve",
    "material-issues:view",
    "material-issues:manage",
    "stock-transfers:view",
    "returns:view",
  ],
  "procurement-manager": [
    "dashboard:view",
    "projects:view",
    "materials:view",
    "inventory:view",
    "indents:view",
    "indents:review",
    "procurement:view",
    "procurement:manage",
    "procurement:approve",
    "billing:view",
    "inward:view",
    "inward:manage",
    "quality-control:view",
    "stock-transfers:view",
    "vendors:view",
    "vendors:manage",
    "resources:view",
    "reports:view",
    "reports:export",
  ],
  "quality-inspector": [
    "dashboard:view",
    "projects:view",
    "materials:view",
    "inventory:view",
    "inward:view",
    "quality-control:view",
    "quality-control:manage",
    "quality-control:approve",
    "material-issues:view",
    "returns:view",
    "stock-transfers:view",
    "vendors:view",
    "reports:view",
  ],
  "finance-manager": [
    "dashboard:view",
    "projects:view",
    "materials:view",
    "inventory:view",
    "indents:view",
    "procurement:view",
    "procurement:approve",
    "billing:view",
    "inward:view",
    "vendors:view",
    "reports:view",
    "reports:export",
  ],
  "project-accountant": [
    "dashboard:view",
    "projects:view",
    "materials:view",
    "indents:view",
    "procurement:view",
    "billing:view",
    "reports:view",
    "reports:export",
  ],
  "hq-accountant": [
    "dashboard:view",
    "projects:view",
    "procurement:view",
    "billing:view",
    "vendors:view",
    "reports:view",
    "reports:export",
  ],
  "hq-design": [
    "dashboard:view",
    "projects:view",
    "materials:view",
    "materials:manage",
    "reports:view",
  ],
  "hq-operations-head": [
    "dashboard:view",
    "projects:view",
    "projects:manage",
    "materials:view",
    "inventory:view",
    "indents:view",
    "indents:review",
    "procurement:view",
    "billing:view",
    "inward:view",
    "quality-control:view",
    "material-issues:view",
    "consumption:view",
    "returns:view",
    "stock-transfers:view",
    "stock-transfers:approve",
    "vendors:view",
    "resources:view",
    "resources:manage",
    "reports:view",
    "reports:export",
  ],
  "hq-ceo": BUSINESS_PERMISSIONS,
  "hq-md": BUSINESS_PERMISSIONS,
  viewer: VIEWER_PERMISSIONS,
};

function toRoles(subject) {
  if (!subject) {
    return [];
  }
  return typeof subject === "string" ? [subject] : subject;
}
export function hasPermission(subject, permission) {
  return toRoles(subject).some((role) =>
    ROLE_PERMISSIONS[role]?.includes(permission),
  );
}
export function hasAnyPermission(subject, permissions) {
  return permissions.some((permission) => hasPermission(subject, permission));
}
export function hasEveryPermission(subject, permissions) {
  return permissions.every((permission) => hasPermission(subject, permission));
}

/**
 * Whether a role sees every project ("global") or only the ones it has been
 * assigned to ("project"). Hand-synced copy of ROLE_ACCESS_SCOPE in
 * frontend/src/config/permissions.js.
 */
export const ROLE_ACCESS_SCOPE = {
  "super-admin": "global",
  administrator: "global",
  "project-head": "project",
  "project-manager": "project",
  "site-executive": "project",
  "site-engineer": "project",
  supervisor: "project",
  "gate-man": "project",
  "store-manager": "project",
  "project-accountant": "project",
  "quality-inspector": "project",
  "procurement-manager": "global",
  "finance-manager": "global",
  "hq-accountant": "global",
  "hq-design": "global",
  "hq-operations-head": "global",
  "hq-ceo": "global",
  "hq-md": "global",
  viewer: "global",
};

/** Global roles may act on any project; project-scoped roles only on their assigned ones. */
export function canAccessProject(user, projectId) {
  if (ROLE_ACCESS_SCOPE[user.role] === "global") {
    return true;
  }
  return (user.projectIds ?? []).includes(projectId);
}

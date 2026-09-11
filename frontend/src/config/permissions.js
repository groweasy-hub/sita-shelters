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
  "site-manager",
  "civil-engineer",
  "structural-engineer",
  "architect",
  "quantity-surveyor",
  "billing-engineer",
  "planning-engineer",
  "purchase-officer",
  "store-keeper",
  "safety-officer",
  "qa-qc-engineer",
  "foreman",
  "electrician",
  "plumber",
  "machine-operator",
  "security-guard",
  "accountant",
  "hr-admin",
  "contractor",
  "subcontractor",
  "labour-worker",
  "viewer",
];
/**
 * Some labels below use the site's own org-chart terminology rather than the
 * (stable) role slug, e.g. `supervisor` displays as "Site Supervisor" and
 * `store-manager` as "Project Stores" — the slug never changes so existing
 * mock data (users, assignments, permissions) doesn't need to move with it.
 */
export const ROLE_LABELS = {
  "super-admin": "Super Admin",
  administrator: "Administrator",
  "project-head": "Project Head",
  "project-manager": "Project Manager",
  "site-executive": "Site Executive",
  "site-engineer": "Site Engineer",
  supervisor: "Site Supervisor",
  "gate-man": "Gate Man",
  "store-manager": "Project Stores",
  "project-accountant": "Project Accountant",
  "quality-inspector": "Quality Inspector",
  "procurement-manager": "HQ Procurement Head",
  "finance-manager": "HQ Finance Head",
  "hq-accountant": "HQ Accountant",
  "hq-design": "HQ Design",
  "hq-operations-head": "HQ Operations Head",
  "hq-ceo": "HQ CEO",
  "hq-md": "HQ MD",
  "site-manager": "Site Manager",
  "civil-engineer": "Civil Engineer",
  "structural-engineer": "Structural Engineer",
  architect: "Architect",
  "quantity-surveyor": "Quantity Surveyor",
  "billing-engineer": "Billing Engineer",
  "planning-engineer": "Planning Engineer",
  "purchase-officer": "Purchase Officer",
  "store-keeper": "Store Keeper",
  "safety-officer": "Safety Officer",
  "qa-qc-engineer": "Quality Engineer / QA-QC",
  foreman: "Foreman",
  electrician: "Electrician",
  plumber: "Plumber",
  "machine-operator": "Machine Operator",
  "security-guard": "Security Guard",
  accountant: "Accountant",
  "hr-admin": "HR/Admin",
  contractor: "Contractor",
  subcontractor: "Subcontractor",
  "labour-worker": "Labour / Worker",
  viewer: "Viewer",
};
/** Short, human descriptions shown on role cards and role detail pages. */
export const ROLE_DESCRIPTIONS = {
  "super-admin":
    "Full unrestricted access to every module, project and workspace configuration.",
  administrator:
    "Manages users, roles and workspace settings across the entire portfolio.",
  "project-manager":
    "Owns delivery for assigned projects — indents, procurement approvals and QC sign-off.",
  "project-head":
    "Senior on-site authority for a project — steps in for delivery, approvals and reporting where no dedicated Project Manager is assigned.",
  "site-executive":
    "Coordinates day-to-day site execution — indents, vendor liaison and material movement across the site team.",
  "site-engineer":
    "Day-to-day site execution — generates BOQs and indents, verifies received material against delivery challans, and logs consumption.",
  "store-manager":
    "Owns site inventory — stock, material issues, returns and transfer requests.",
  "gate-man":
    "Logs material and vehicle movement at the site gate — inward receipts and outward dispatches.",
  supervisor:
    "Reviews incoming material and site work, and approves it before it's accepted into inventory.",
  "project-accountant":
    "Tracks project-level spend on site — procurement value, indent cost and reporting for one project.",
  "procurement-manager":
    "Manages vendor quotations, purchase orders and procurement approvals across the portfolio.",
  "quality-inspector":
    "Inspects incoming material and records quality control outcomes.",
  "finance-manager":
    "Reviews procurement spend and approves payments across the portfolio.",
  "hq-accountant":
    "Portfolio-wide bookkeeping and reporting — view and export only, no approvals.",
  "hq-design":
    "Owns material specifications and design intent across every project.",
  "hq-operations-head":
    "Oversees operations across the whole portfolio — resourcing, transfers and delivery risk.",
  "hq-ceo": "Full portfolio visibility and approval authority at the executive level.",
  "hq-md": "Full portfolio visibility and approval authority at the executive level.",
  "site-manager":
    "Coordinates daily site operations, work fronts, manpower and material readiness for an assigned project.",
  "civil-engineer":
    "Owns civil execution checks, site measurements, quality observations and material coordination.",
  "structural-engineer":
    "Reviews structural drawings, reinforcement intent and site execution compliance.",
  architect:
    "Owns architectural drawings, finishes intent and design clarifications across site work.",
  "quantity-surveyor":
    "Tracks quantities, BOQ measurements, work certifications and material reconciliation.",
  "billing-engineer":
    "Prepares contractor bills, validates quantities and supports project cost certification.",
  "planning-engineer":
    "Maintains schedules, progress tracking, look-aheads and resource planning.",
  "purchase-officer":
    "Raises enquiries, follows vendor quotes and supports purchase order execution.",
  "store-keeper":
    "Records stock receipts, issues, returns and day-to-day store movements.",
  "safety-officer":
    "Monitors safety compliance, PPE, permits and site incident records.",
  "qa-qc-engineer":
    "Checks incoming material and site workmanship against project quality requirements.",
  foreman:
    "Supervises trade crews and converts engineering instructions into site execution.",
  electrician:
    "Handles electrical installation, temporary supply and electrical maintenance work.",
  plumber:
    "Handles plumbing installation, testing and maintenance work.",
  "machine-operator":
    "Operates site machinery and equipment assigned to the project.",
  "security-guard":
    "Controls gate access, visitor movement and basic material movement checks.",
  accountant:
    "Tracks project accounts, petty cash, bills and payment support records.",
  "hr-admin":
    "Manages site administration, attendance support and workforce documentation.",
  contractor:
    "External contractor role for assigned work packages and execution tracking.",
  subcontractor:
    "External subcontractor role for narrower trade work packages.",
  "labour-worker":
    "Site labour role for task execution, material handling and work-front support.",
  viewer: "Read-only visibility across the workspace, no create or approve actions.",
};
/**
 * The four access levels a project-scoped grant can carry, from broadest
 * visibility to narrowest control. Used by project assignment cards, the
 * project access table, and the project-centric Project Access screen.
 */
export const ACCESS_LEVELS = ["view", "operational", "management", "approval"];
export const ACCESS_LEVEL_LABELS = {
  view: "View Access",
  operational: "Operational Access",
  management: "Management Access",
  approval: "Approval Access",
};
/** A `StatusBadge`-compatible status key chosen purely for its tone. */
export const ACCESS_LEVEL_STATUS_KEYS = {
  view: "draft",
  operational: "open",
  management: "active",
  approval: "reserved",
};
/**
 * Whether a role's access is scoped to specific projects or spans the whole
 * workspace. Mirrors `ADMIN_ROLE_VALUES`-style workspace-wide roles plus the
 * two other roles (`procurement-manager`, `finance-manager`) whose mock users
 * carry an empty `projectIds` list in `src/lib/mock-data/users.js`.
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
  "site-manager": "project",
  "civil-engineer": "project",
  "structural-engineer": "project",
  architect: "global",
  "quantity-surveyor": "project",
  "billing-engineer": "project",
  "planning-engineer": "project",
  "purchase-officer": "global",
  "store-keeper": "project",
  "safety-officer": "project",
  "qa-qc-engineer": "project",
  foreman: "project",
  electrician: "project",
  plumber: "project",
  "machine-operator": "project",
  "security-guard": "project",
  accountant: "project",
  "hr-admin": "global",
  contractor: "project",
  subcontractor: "project",
  "labour-worker": "project",
  viewer: "global",
};
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
  "inward:view",
  "inward:manage",
  "quality-control:view",
  "quality-control:manage",
  "quality-control:approve",
  "material-issues:view",
  "material-issues:manage",
  "consumption:view",
  "consumption:manage",
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
/** Every business permission except the pure system-administration actions. */
const BUSINESS_PERMISSIONS = PERMISSIONS.filter(
  (permission) => !permission.startsWith("administration:"),
);
/**
 * On-site leadership (Project Head / Project Manager) is deliberately
 * narrower than a full "manage everything" set: projects are assigned to
 * them rather than browsed/managed, and Reports, Vendors and Resources are
 * HQ-level concerns — they get the operational pages needed to run their
 * assigned project day to day, nothing to hunt through.
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
  "procurement:approve",
  "inward:view",
  "inward:manage",
  "quality-control:view",
  "quality-control:manage",
  "quality-control:approve",
  "material-issues:view",
  "material-issues:manage",
  "consumption:view",
  "consumption:manage",
  "returns:view",
  "returns:manage",
  "stock-transfers:view",
  "stock-transfers:manage",
  "stock-transfers:approve",
];
const SITE_COORDINATION_PERMISSIONS = [
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
  "stock-transfers:view",
];
const TECHNICAL_REVIEW_PERMISSIONS = [
  "dashboard:view",
  "projects:view",
  "materials:view",
  "inventory:view",
  "indents:view",
  "inward:view",
  "quality-control:view",
  "quality-control:manage",
  "material-issues:view",
  "consumption:view",
  "reports:view",
];
const COMMERCIAL_SITE_PERMISSIONS = [
  "dashboard:view",
  "projects:view",
  "materials:view",
  "inventory:view",
  "indents:view",
  "procurement:view",
  "vendors:view",
  "reports:view",
  "reports:export",
];
const STORE_SUPPORT_PERMISSIONS = [
  "dashboard:view",
  "materials:view",
  "inventory:view",
  "inventory:manage",
  "indents:view",
  "inward:view",
  "inward:manage",
  "material-issues:view",
  "material-issues:manage",
  "returns:view",
  "returns:manage",
  "stock-transfers:view",
];
const LIMITED_SITE_PERMISSIONS = [
  "dashboard:view",
  "materials:view",
  "inventory:view",
  "indents:view",
  "inward:view",
  "material-issues:view",
  "consumption:view",
  "returns:view",
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
    "inward:view",
    "inward:manage",
    "quality-control:view",
    "consumption:view",
    "consumption:manage",
    "returns:view",
  ],
  "store-manager": [
    "dashboard:view",
    "materials:view",
    "inventory:view",
    "inventory:manage",
    "indents:view",
    "indents:create",
    "inward:view",
    "inward:manage",
    "quality-control:view",
    "material-issues:view",
    "material-issues:manage",
    "consumption:view",
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
    "inward:view",
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
    "reports:view",
    "reports:export",
  ],
  "hq-accountant": [
    "dashboard:view",
    "projects:view",
    "procurement:view",
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
  "site-manager": SITE_COORDINATION_PERMISSIONS,
  "civil-engineer": TECHNICAL_REVIEW_PERMISSIONS,
  "structural-engineer": TECHNICAL_REVIEW_PERMISSIONS,
  architect: [
    "dashboard:view",
    "projects:view",
    "materials:view",
    "materials:manage",
    "quality-control:view",
    "reports:view",
  ],
  "quantity-surveyor": COMMERCIAL_SITE_PERMISSIONS,
  "billing-engineer": COMMERCIAL_SITE_PERMISSIONS,
  "planning-engineer": [
    "dashboard:view",
    "projects:view",
    "materials:view",
    "inventory:view",
    "indents:view",
    "procurement:view",
    "reports:view",
    "reports:export",
  ],
  "purchase-officer": [
    "dashboard:view",
    "materials:view",
    "inventory:view",
    "indents:view",
    "indents:review",
    "procurement:view",
    "procurement:manage",
    "vendors:view",
  ],
  "store-keeper": STORE_SUPPORT_PERMISSIONS,
  "safety-officer": [
    "dashboard:view",
    "materials:view",
    "inventory:view",
    "inward:view",
    "quality-control:view",
    "reports:view",
  ],
  "qa-qc-engineer": [
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
    "reports:view",
  ],
  foreman: SITE_COORDINATION_PERMISSIONS,
  electrician: LIMITED_SITE_PERMISSIONS,
  plumber: LIMITED_SITE_PERMISSIONS,
  "machine-operator": [
    "dashboard:view",
    "materials:view",
    "inventory:view",
    "resources:view",
    "stock-transfers:view",
  ],
  "security-guard": [
    "dashboard:view",
    "inward:view",
    "inward:manage",
    "stock-transfers:view",
    "returns:view",
  ],
  accountant: COMMERCIAL_SITE_PERMISSIONS,
  "hr-admin": [
    "dashboard:view",
    "projects:view",
    "resources:view",
    "resources:manage",
    "reports:view",
    "administration:view",
  ],
  contractor: LIMITED_SITE_PERMISSIONS,
  subcontractor: LIMITED_SITE_PERMISSIONS,
  "labour-worker": [
    "dashboard:view",
    "materials:view",
    "material-issues:view",
    "consumption:view",
  ],
  viewer: VIEWER_PERMISSIONS,
};
/**
 * Friendly module grouping layered on top of the canonical `PERMISSIONS`
 * list, used by the permission matrix and the module-permissions panel so
 * neither has to hand-maintain a second copy of the permission list.
 */
const MODULE_LABELS = {
  dashboard: "Dashboard",
  projects: "Projects",
  materials: "Materials",
  inventory: "Inventory",
  indents: "Indents",
  procurement: "Procurement",
  inward: "Material Inward",
  "quality-control": "Quality Control",
  "material-issues": "Material Issues",
  consumption: "Consumption",
  returns: "Returns",
  "stock-transfers": "Stock Transfers",
  vendors: "Vendors",
  resources: "Resources",
  reports: "Reports",
  administration: "Administration",
};
export const PERMISSION_MODULES = Object.entries(MODULE_LABELS)
  .map(([id, label]) => ({
    id,
    label,
    permissions: PERMISSIONS.filter((permission) =>
      permission.startsWith(`${id}:`),
    ),
  }))
  .filter((group) => group.permissions.length > 0);
const ACTION_LABELS = {
  view: "View",
  manage: "Manage",
  create: "Create",
  review: "Review",
  approve: "Approve",
  export: "Export",
  "users:manage": "Manage Users",
  "roles:manage": "Manage Roles",
  "settings:manage": "Manage Settings",
};
export function getPermissionAction(permission) {
  const [, ...rest] = permission.split(":");
  return rest.join(":");
}
export function getPermissionActionLabel(permission) {
  const action = getPermissionAction(permission);
  return ACTION_LABELS[action] ?? action;
}
/**
 * These helpers control frontend visibility and affordances only. The eventual
 * backend must independently enforce authorization for every operation.
 */
function toRoles(subject) {
  if (!subject) {
    return [];
  }
  return typeof subject === "string" ? [subject] : subject;
}
export function isAppRole(value) {
  return APP_ROLES.includes(value);
}
export function hasRole(subject, allowedRoles) {
  const roles = toRoles(subject);
  return roles.some((role) => allowedRoles.includes(role));
}
export function hasPermission(subject, permission) {
  return toRoles(subject).some((role) =>
    ROLE_PERMISSIONS[role].includes(permission),
  );
}
export function hasAnyPermission(subject, permissions) {
  return permissions.some((permission) => hasPermission(subject, permission));
}
export function hasEveryPermission(subject, permissions) {
  return permissions.every((permission) => hasPermission(subject, permission));
}
export function meetsAccessRequirement(
  subject,
  requirement,
  explicitlyGranted = [],
) {
  if (requirement.roles && !hasRole(subject, requirement.roles)) {
    return false;
  }
  const requiredPermissions = [
    ...(requirement.permission ? [requirement.permission] : []),
    ...(requirement.permissions ?? []),
  ];
  if (requiredPermissions.length === 0) {
    return true;
  }
  const can = (permission) =>
    explicitlyGranted.includes(permission) ||
    hasPermission(subject, permission);
  return requirement.permissionMode === "any"
    ? requiredPermissions.some(can)
    : requiredPermissions.every(can);
}

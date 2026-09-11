import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  Boxes,
  Building2,
  ClipboardCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  PackageCheck,
  PackageMinus,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Truck,
  Users,
  Warehouse,
  Wrench,
} from "lucide-react";
import { meetsAccessRequirement } from "./permissions";
export const navigationIcons = {
  dashboard: LayoutDashboard,
  projects: Building2,
  materials: Boxes,
  categories: Tags,
  inventory: Warehouse,
  lowStock: AlertTriangle,
  ledger: BookOpen,
  indents: ClipboardList,
  procurement: ShoppingCart,
  purchaseOrders: FileText,
  inward: PackageCheck,
  qualityControl: ShieldCheck,
  materialIssues: PackageMinus,
  consumption: Activity,
  returns: RotateCcw,
  stockTransfers: ArrowLeftRight,
  dispatch: Truck,
  vendors: Users,
  resources: Wrench,
  reports: BarChart3,
  administration: Settings,
  approvals: ClipboardCheck,
};
export const navigationSections = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: navigationIcons.dashboard,
        exact: true,
        permission: "dashboard:view",
      },
      {
        title: "Projects",
        href: "/projects",
        icon: navigationIcons.projects,
        permission: "projects:view",
      },
    ],
  },
  {
    title: "Materials & Stock",
    items: [
      {
        title: "Materials",
        href: "/materials",
        icon: navigationIcons.materials,
        permission: "materials:view",
        items: [
          {
            title: "Material Catalogue",
            href: "/materials",
            icon: navigationIcons.materials,
            exact: true,
            permission: "materials:view",
          },
          {
            title: "Categories",
            href: "/materials/categories",
            icon: navigationIcons.categories,
            permission: "materials:view",
          },
        ],
      },
      {
        title: "Inventory",
        href: "/inventory",
        icon: navigationIcons.inventory,
        permission: "inventory:view",
        items: [
          {
            title: "Inventory Overview",
            href: "/inventory",
            icon: navigationIcons.inventory,
            exact: true,
            permission: "inventory:view",
          },
          {
            title: "Site Stock",
            href: "/inventory/site-stock",
            icon: navigationIcons.inventory,
            permission: "inventory:view",
          },
          {
            title: "Low Stock",
            href: "/inventory/low-stock",
            icon: navigationIcons.lowStock,
            permission: "inventory:view",
          },
          {
            title: "Damaged Stock",
            href: "/inventory/damaged",
            icon: navigationIcons.lowStock,
            permission: "inventory:view",
          },
          {
            title: "Stock Ledger",
            href: "/inventory/ledger",
            icon: navigationIcons.ledger,
            permission: "inventory:view",
          },
        ],
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        title: "Indents",
        href: "/indents",
        icon: navigationIcons.indents,
        permission: "indents:view",
      },
      {
        title: "Procurement",
        href: "/procurement",
        icon: navigationIcons.procurement,
        permission: "procurement:view",
        items: [
          {
            title: "Requests",
            href: "/procurement/requests",
            icon: navigationIcons.indents,
            permission: "procurement:view",
          },
          {
            title: "Quotations",
            href: "/procurement/quotations",
            icon: navigationIcons.approvals,
            permission: "procurement:view",
          },
          {
            title: "Purchase Orders",
            href: "/procurement/purchase-orders",
            icon: navigationIcons.purchaseOrders,
            permission: "procurement:view",
          },
        ],
      },
      {
        title: "Material Inward",
        href: "/inward",
        icon: navigationIcons.inward,
        permission: "inward:view",
      },
      {
        title: "Quality Control",
        href: "/quality-control",
        icon: navigationIcons.qualityControl,
        permission: "quality-control:view",
      },
      {
        title: "Material Issues",
        href: "/material-issues",
        icon: navigationIcons.materialIssues,
        permission: "material-issues:view",
      },
      {
        title: "Consumption",
        href: "/consumption",
        icon: navigationIcons.consumption,
        permission: "consumption:view",
      },
      {
        title: "Returns",
        href: "/returns",
        icon: navigationIcons.returns,
        permission: "returns:view",
      },
      {
        title: "Stock Transfers",
        href: "/stock-transfers",
        icon: navigationIcons.stockTransfers,
        permission: "stock-transfers:view",
      },
    ],
  },
  {
    title: "Partners & Resources",
    items: [
      {
        title: "Vendors",
        href: "/vendors",
        icon: navigationIcons.vendors,
        permission: "vendors:view",
      },
      {
        title: "Resources",
        href: "/resources",
        icon: navigationIcons.resources,
        permission: "resources:view",
      },
    ],
  },
  {
    title: "Insights & Control",
    items: [
      {
        title: "Reports",
        href: "/reports",
        icon: navigationIcons.reports,
        permission: "reports:view",
      },
      {
        title: "Administration",
        href: "/administration",
        icon: navigationIcons.administration,
        permission: "administration:view",
        roles: ["super-admin", "administrator"],
        activePaths: ["/access"],
        items: [
          {
            title: "Users",
            href: "/access/users",
            icon: navigationIcons.vendors,
            permission: "administration:users:manage",
            roles: ["super-admin", "administrator"],
          },
          {
            title: "Roles",
            href: "/access/roles",
            icon: navigationIcons.qualityControl,
            permission: "administration:roles:manage",
            roles: ["super-admin", "administrator"],
          },
          {
            title: "Permission Matrix",
            href: "/access/permissions",
            icon: navigationIcons.approvals,
            permission: "administration:roles:manage",
            roles: ["super-admin", "administrator"],
          },
          {
            title: "Project Access",
            href: "/access/project-access",
            icon: navigationIcons.projects,
            permission: "administration:users:manage",
            roles: ["super-admin", "administrator"],
          },
          {
            title: "Settings",
            href: "/administration/settings",
            icon: navigationIcons.administration,
            permission: "administration:settings:manage",
            roles: ["super-admin", "administrator"],
          },
        ],
      },
    ],
  },
];
function filterItem(item, context) {
  if (!meetsAccessRequirement(context.roles, item, context.permissions ?? [])) {
    return null;
  }
  if (!item.items) {
    return item;
  }
  const items = item.items
    .map((child) => filterItem(child, context))
    .filter((child) => child !== null);
  return { ...item, items };
}
export function getNavigationSections(context) {
  return navigationSections
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => filterItem(item, context))
        .filter((item) => item !== null),
    }))
    .filter((section) => section.items.length > 0);
}
function flattenNavigationItems(sections) {
  const items = [];
  function visit(item) {
    items.push(item);
    item.items?.forEach(visit);
  }
  sections.forEach((section) => section.items.forEach(visit));
  return items;
}
const flatNavigationItems = flattenNavigationItems(navigationSections);

/**
 * Finds the most specific navigation entry (by longest matching `href`) that
 * governs a given pathname, including its own sub-routes (e.g.
 * `/indents/123` inherits `/indents`'s requirement). Returns `null` for
 * paths outside the sidebar tree (profile, preferences, dashboard root,
 * etc.) — those are open to every signed-in role by default.
 */
export function getRequiredAccessForPath(pathname) {
  const matches = flatNavigationItems.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (matches.length === 0) {
    return null;
  }
  return matches.reduce((longest, item) =>
    item.href.length > longest.href.length ? item : longest,
  );
}
export function isNavigationItemActive(pathname, item) {
  if (item.exact) {
    return pathname === item.href;
  }
  const matchesOwnPath =
    pathname === item.href || pathname.startsWith(`${item.href}/`);
  if (matchesOwnPath) {
    return true;
  }
  return (item.activePaths ?? []).some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

import {
  ArrowLeftRight,
  BarChart3,
  ClipboardList,
  FileCheck,
  FileText,
  PackageCheck,
  PenTool,
  RotateCcw,
  ShieldCheck,
  Users,
} from "lucide-react";

/**
 * Each entry becomes a dashboard shortcut only for roles whose
 * `ROLE_PERMISSIONS` include `permission` — see `hasPermission` in
 * `src/config/permissions.js`. This is what makes "the other function
 * operations required for that role" show up on their dashboard home
 * instead of buried in the sidebar.
 */
export const QUICK_ACTIONS = [
  {
    permission: "inward:manage",
    label: "Record Inward Entry",
    description: "Log material received at the gate or store.",
    href: "/inward",
    icon: PackageCheck,
  },
  {
    permission: "indents:create",
    label: "Raise an Indent",
    description: "Request material for your site.",
    href: "/indents/create",
    icon: ClipboardList,
  },
  {
    permission: "quality-control:approve",
    label: "Review Pending QC",
    description: "Approve or reject inspected material.",
    href: "/quality-control",
    icon: ShieldCheck,
  },
  {
    permission: "procurement:approve",
    label: "Approve Purchase Orders",
    description: "Clear POs waiting on your sign-off.",
    href: "/procurement/purchase-orders",
    icon: FileCheck,
  },
  {
    permission: "procurement:manage",
    label: "Manage Quotations",
    description: "Compare vendor quotations for open requests.",
    href: "/procurement/quotations",
    icon: FileText,
  },
  {
    permission: "stock-transfers:approve",
    label: "Approve Transfers",
    description: "Clear stock transfers awaiting sign-off.",
    href: "/stock-transfers",
    icon: ArrowLeftRight,
  },
  {
    permission: "materials:manage",
    label: "Manage Material Specs",
    description: "Update the material catalogue and specifications.",
    href: "/materials",
    icon: PenTool,
  },
  {
    permission: "returns:manage",
    label: "Log a Return",
    description: "Record damaged or surplus material leaving site.",
    href: "/returns",
    icon: RotateCcw,
  },
  {
    permission: "vendors:manage",
    label: "Manage Vendors",
    description: "Onboard or update vendor records.",
    href: "/vendors",
    icon: Users,
  },
  {
    permission: "reports:export",
    label: "Export Reports",
    description: "Download portfolio or project reports.",
    href: "/reports",
    icon: BarChart3,
  },
  {
    permission: "administration:users:manage",
    label: "Manage Users & Access",
    description: "Review accounts, roles and permissions.",
    href: "/access/users",
    icon: ShieldCheck,
  },
];

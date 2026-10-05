import {
  AlertTriangle,
  ClipboardCheck,
  LayoutDashboard,
  PackageX,
  ShieldCheck,
  ShoppingCart,
  Siren,
  Sparkles,
} from "lucide-react";

export const PREFERENCES_SECTIONS = [
  { id: "appearance", label: "Appearance" },
  { id: "notifications", label: "Notifications" },
  { id: "dashboard", label: "Dashboard" },
  { id: "regional", label: "Regional Settings" },
  { id: "accessibility", label: "Accessibility" },
];

export const THEME_MODE_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];
export const DENSITY_OPTIONS = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
];
/**
 * Every spacing value in this app is defined in `rem`, so scaling the root
 * font-size (see `PreferencesEffects`) is what actually makes tables and
 * lists denser, composed together with the accessibility Font Size scale.
 */
export const DENSITY_SCALES = {
  comfortable: 1,
  compact: 0.9,
};

export const NOTIFICATION_CATEGORIES = [
  {
    id: "inventory",
    label: "Inventory Alerts",
    icon: PackageX,
    rows: [
      {
        id: "low-stock",
        label: "Low Stock Alert",
        description: "Notify when a material drops below its reorder threshold.",
      },
      {
        id: "damaged-stock",
        label: "Damaged Stock Logged",
        description: "Notify when a site records damaged material.",
      },
    ],
  },
  {
    id: "approvals",
    label: "Approval Requests",
    icon: ClipboardCheck,
    rows: [
      {
        id: "pending-approval",
        label: "Pending Your Approval",
        description: "Indents, transfers or POs waiting on your sign-off.",
      },
    ],
  },
  {
    id: "purchase-orders",
    label: "Purchase Orders",
    icon: ShoppingCart,
    rows: [
      {
        id: "po-status",
        label: "PO Status Changes",
        description: "Sent, acknowledged or delivered updates.",
      },
    ],
  },
  {
    id: "transfers",
    label: "Transfers",
    icon: PackageX,
    rows: [
      {
        id: "transfer-updates",
        label: "Stock Transfer Updates",
        description: "Dispatch, in-transit and received milestones.",
      },
    ],
  },
  {
    id: "quality-control",
    label: "QC Alerts",
    icon: ShieldCheck,
    rows: [
      {
        id: "inspection-results",
        label: "Inspection Results",
        description: "Pass, fail or rework outcomes on your projects.",
      },
    ],
  },
  {
    id: "system",
    label: "System Alerts",
    icon: Siren,
    rows: [
      {
        id: "maintenance",
        label: "Maintenance & Downtime",
        description: "Planned maintenance windows and incidents.",
      },
    ],
  },
  {
    id: "material-intelligence",
    label: "Material Intelligence",
    icon: Sparkles,
    rows: [
      {
        id: "consumption-anomalies",
        label: "Consumption Anomalies",
        description: "Unusual usage patterns detected across sites.",
      },
    ],
  },
];
/** Flat default state for every notification row, keyed by row id. */
export const DEFAULT_NOTIFICATION_PREFERENCES = NOTIFICATION_CATEGORIES.reduce(
  (acc, category) => {
    category.rows.forEach((row) => {
      acc[row.id] = { inApp: true, email: false };
    });
    return acc;
  },
  {},
);

export const DASHBOARD_WIDGETS = [
  { id: "low-stock-alerts", label: "Low Stock Alerts", icon: AlertTriangle },
  { id: "pending-approvals", label: "Pending Approvals", icon: ClipboardCheck },
  { id: "transfers-in-transit", label: "Transfers In Transit", icon: PackageX },
  { id: "open-purchase-orders", label: "Open Purchase Orders", icon: ShoppingCart },
  { id: "project-progress", label: "Project Progress Summary", icon: LayoutDashboard },
  { id: "material-intelligence-digest", label: "Material Intelligence Digest", icon: Sparkles },
];
export const DEFAULT_WIDGET_VISIBILITY = DASHBOARD_WIDGETS.reduce((acc, widget) => {
  acc[widget.id] = widget.id !== "open-purchase-orders" && widget.id !== "material-intelligence-digest";
  return acc;
}, {});

export const DATE_RANGE_OPTIONS = [
  { value: "last-7-days", label: "Last 7 Days" },
  { value: "last-30-days", label: "Last 30 Days" },
  { value: "this-quarter", label: "This Quarter" },
  { value: "this-year", label: "This Year" },
];

export const LANGUAGE_OPTIONS = [
  { value: "en-IN", label: "English (India)", disabled: false },
];
export const TIME_ZONE_OPTIONS = [
  { value: "Asia/Kolkata", label: "(GMT+5:30) India Standard Time" },
];
export const DATE_FORMAT_OPTIONS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY", example: "05/09/2026" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY", example: "09/05/2026" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD", example: "2026-09-05" },
];
export const NUMBER_FORMAT_OPTIONS = [
  { value: "en-IN", label: "12,34,567.89 (Indian)" },
  { value: "en-US", label: "1,234,567.89 (International)" },
];
export const CURRENCY_OPTIONS = [
  { value: "INR", label: "₹ Indian Rupee (INR)" },
];

export const FONT_SIZE_OPTIONS = [
  { value: "small", label: "Small", scale: 0.9375 },
  { value: "default", label: "Default", scale: 1 },
  { value: "large", label: "Large", scale: 1.1 },
];

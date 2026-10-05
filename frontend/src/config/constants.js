export const APP_NAME = "SITA Shelters";
export const APP_DESCRIPTION =
  "Construction Resource & Inventory Management System";
export const DEFAULT_LOCALE = "en-IN";
export const DEFAULT_CURRENCY = "INR";
export const DEFAULT_TIME_ZONE = "Asia/Kolkata";
export const EMPTY_VALUE = "—";
/** `null` remains the canonical all-projects value inside application state. */
export const ALL_PROJECTS_VALUE = "all-projects";
export const STORAGE_KEYS = {
  projectContext: "sita-shelters.project-context",
  ui: "sita-shelters.ui",
  theme: "sita-shelters-theme",
  preferences: "sita-shelters.preferences",
};
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
};
export const TABLE_DEFAULTS = {
  page: 1,
  pageSize: 25,
  pageSizeOptions: [10, 25, 50, 100],
};
export const QUERY_DEFAULTS = {
  staleTimeMs: 60_000,
  garbageCollectionTimeMs: 30 * 60_000,
  maxRetries: 2,
};
export const ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
};
export const ICON_STROKE_WIDTH = 1.75;
/**
 * Temporary shell options used until the projects query is connected. Project
 * records themselves must remain TanStack Query server state. This list is the
 * canonical set of project identifiers referenced by every feature's mock data.
 */
export const PROJECT_OPTIONS = [
  {
    id: "sita-heights",
    code: "SS-001",
    name: "SITA Heights",
    location: "Hyderabad",
    status: "active",
  },
  {
    id: "sita-enclave",
    code: "SS-002",
    name: "SITA Enclave",
    location: "Bengaluru",
    status: "active",
  },
  {
    id: "sita-greens",
    code: "SS-003",
    name: "SITA Greens",
    location: "Pune",
    status: "planning",
  },
  {
    id: "sita-grove",
    code: "SS-004",
    name: "SITA Grove",
    location: "Bengaluru",
    status: "active",
  },
  {
    id: "sita-meridian",
    code: "SS-005",
    name: "SITA Meridian",
    location: "Pune",
    status: "active",
  },
  {
    id: "sita-crest",
    code: "SS-006",
    name: "SITA Crest",
    location: "Chennai",
    status: "active",
  },
  {
    id: "sita-orchid",
    code: "SS-007",
    name: "SITA Orchid",
    location: "Coimbatore",
    status: "on-hold",
  },
  {
    id: "sita-riviera",
    code: "SS-008",
    name: "SITA Riviera",
    location: "Visakhapatnam",
    status: "completed",
  },
];
export const PROJECT_STATUS_VALUES = [
  "planning",
  "active",
  "on-hold",
  "completed",
];

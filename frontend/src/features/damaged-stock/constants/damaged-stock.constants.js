import { TABLE_DEFAULTS } from "@/config/constants";

export const DAMAGE_RECORD_TYPE_VALUES = ["damage", "wastage"];
export const DAMAGE_RECORD_TYPE_OPTIONS = [
  { value: "damage", label: "Damaged material" },
  { value: "wastage", label: "Construction wastage" },
];
export const DAMAGE_REASON_VALUES = [
  "transportation",
  "vendor-defect",
  "site-handling",
  "weather",
  "improper-storage",
  "expiry",
  "construction-wastage",
  "accidental-damage",
];
export const DAMAGE_REASON_LABELS = {
  transportation: "Transportation",
  "vendor-defect": "Vendor defect",
  "site-handling": "Site handling",
  weather: "Weather",
  "improper-storage": "Improper storage",
  expiry: "Expiry",
  "construction-wastage": "Construction wastage",
  "accidental-damage": "Accidental damage",
};
export const DAMAGE_REASON_OPTIONS = DAMAGE_REASON_VALUES.map((value) => ({
  value,
  label: DAMAGE_REASON_LABELS[value],
}));
export const DAMAGE_DEPARTMENT_VALUES = [
  "civil",
  "electrical",
  "plumbing",
  "fire-safety",
  "finishing",
  "stores",
  "logistics",
];
export const DAMAGE_DEPARTMENT_OPTIONS = DAMAGE_DEPARTMENT_VALUES.map(
  (value) => ({
    value,
    label: value
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
  }),
);
export const DAMAGE_SOURCE_TYPE_VALUES = [
  "qc-rejection",
  "return-inspection",
  "other",
];
export const DAMAGE_PAGE_SIZE_OPTIONS = TABLE_DEFAULTS.pageSizeOptions;
export const damagedStockQueryKeys = {
  all: ["damaged-stock"],
  list: () => [...damagedStockQueryKeys.all, "list"],
};

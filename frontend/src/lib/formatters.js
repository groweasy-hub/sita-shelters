import {
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  DEFAULT_TIME_ZONE,
  EMPTY_VALUE,
} from "../config/constants";
import { usePreferencesStore } from "../stores/preferences-store";

/**
 * Reads the user's Regional preferences directly from the store (rather than
 * via a hook) so plain formatting functions can honor them outside React
 * render — falling back to the workspace defaults before the store hydrates
 * or outside the browser.
 */
function regionalDefault(field, fallback) {
  try {
    return usePreferencesStore.getState().regional[field] ?? fallback;
  } catch {
    return fallback;
  }
}
function finiteOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
function parseDate(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
export function formatCurrency(value, options = {}) {
  const amount = finiteOrNull(value);
  const {
    currency = regionalDefault("currency", DEFAULT_CURRENCY),
    locale = regionalDefault("numberFormat", DEFAULT_LOCALE),
    fallback = EMPTY_VALUE,
    maximumFractionDigits = 2,
    ...intlOptions
  } = options;
  if (amount === null) {
    return fallback;
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits,
      ...intlOptions,
    }).format(amount);
  } catch {
    return fallback;
  }
}
export function formatNumber(value, options = {}) {
  const number = finiteOrNull(value);
  const {
    locale = regionalDefault("numberFormat", DEFAULT_LOCALE),
    fallback = EMPTY_VALUE,
    ...intlOptions
  } = options;
  if (number === null) {
    return fallback;
  }
  try {
    return new Intl.NumberFormat(locale, intlOptions).format(number);
  } catch {
    return fallback;
  }
}
export function formatCompactNumber(value, options = {}) {
  return formatNumber(value, {
    notation: "compact",
    maximumFractionDigits: 1,
    ...options,
  });
}
export function formatPercent(value, options = {}) {
  const {
    valueIsPercent = false,
    maximumFractionDigits = 1,
    ...commonOptions
  } = options;
  const normalizedValue =
    valueIsPercent && value !== null && value !== undefined
      ? value / 100
      : value;
  return formatNumber(normalizedValue, {
    style: "percent",
    maximumFractionDigits,
    ...commonOptions,
  });
}
/** Renders the day/month/year of `date`, as they fall in `timeZone`, as plain strings. */
function getDatePartsInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}
/** Applies the Regional preferences' Date Format pattern (DD/MM/YYYY etc). */
function applyDatePattern(date, pattern, timeZone) {
  const { day, month, year } = getDatePartsInTimeZone(date, timeZone);
  if (pattern === "MM/DD/YYYY") {
    return `${month}/${day}/${year}`;
  }
  if (pattern === "YYYY-MM-DD") {
    return `${year}-${month}-${day}`;
  }
  return `${day}/${month}/${year}`;
}
function formatDateWithDefaults(value, options, defaults, { includeTime = false } = {}) {
  const date = parseDate(value);
  const {
    locale = regionalDefault("language", DEFAULT_LOCALE),
    fallback = EMPTY_VALUE,
    timeZone = regionalDefault("timeZone", DEFAULT_TIME_ZONE),
    dateFormat = regionalDefault("dateFormat", null),
    ...intlOptions
  } = options;
  if (!date) {
    return fallback;
  }
  const isCustomized = Object.keys(intlOptions).length > 0;
  if (!isCustomized && dateFormat) {
    try {
      const datePart = applyDatePattern(date, dateFormat, timeZone);
      if (!includeTime) {
        return datePart;
      }
      const timePart = new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        timeZone,
      }).format(date);
      return `${datePart}, ${timePart}`;
    } catch {
      return fallback;
    }
  }
  try {
    return new Intl.DateTimeFormat(locale, {
      ...defaults,
      ...intlOptions,
      timeZone,
    }).format(date);
  } catch {
    return fallback;
  }
}
export function formatDate(value, options = {}) {
  return formatDateWithDefaults(value, options, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
export function formatDateTime(value, options = {}) {
  return formatDateWithDefaults(
    value,
    options,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
    { includeTime: true },
  );
}
export function formatRelativeTime(value, options = {}) {
  const date = parseDate(value);
  const now = parseDate(options.now ?? new Date());
  const {
    locale = regionalDefault("language", DEFAULT_LOCALE),
    fallback = EMPTY_VALUE,
  } = options;
  if (!date || !now) {
    return fallback;
  }
  const seconds = (date.getTime() - now.getTime()) / 1_000;
  const intervals = [
    { unit: "year", seconds: 31_536_000 },
    { unit: "month", seconds: 2_592_000 },
    { unit: "week", seconds: 604_800 },
    { unit: "day", seconds: 86_400 },
    { unit: "hour", seconds: 3_600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ];
  const interval =
    intervals.find((candidate) => Math.abs(seconds) >= candidate.seconds) ??
    intervals.at(-1);
  if (!interval) {
    return fallback;
  }
  try {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      Math.round(seconds / interval.seconds),
      interval.unit,
    );
  } catch {
    return fallback;
  }
}
export function formatQuantity(value, unit, options = {}) {
  const formatted = formatNumber(value, {
    maximumFractionDigits: 3,
    ...options,
  });
  if (formatted === (options.fallback ?? EMPTY_VALUE) || !unit?.trim()) {
    return formatted;
  }
  return `${formatted} ${unit.trim()}`;
}
export function formatFileSize(bytes, fallback = EMPTY_VALUE) {
  const size = finiteOrNull(bytes);
  if (size === null || size < 0) {
    return fallback;
  }
  if (size === 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1,
  );
  const formatted = size / 1024 ** exponent;
  return `${new Intl.NumberFormat(DEFAULT_LOCALE, {
    maximumFractionDigits: exponent === 0 ? 0 : 1,
  }).format(formatted)} ${units[exponent]}`;
}
export function formatInitials(name, maximumCharacters = 2) {
  if (maximumCharacters <= 0) {
    return "";
  }
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maximumCharacters)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

import { z } from "zod";
import { TABLE_DEFAULTS } from "../config/constants";
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;
const PHONE_PATTERN = /^\+?[1-9]\d{7,14}$/;
export function requiredString(label, maximumLength = 255) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(
      maximumLength,
      `${label} must be ${maximumLength} characters or fewer`,
    );
}
export function optionalString(maximumLength = 255) {
  return z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.string().trim().max(maximumLength).optional(),
  );
}
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address")
  .max(254, "Email address is too long");
export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .refine((value) => PHONE_PATTERN.test(value), "Enter a valid phone number");
export const identifierSchema = z
  .string()
  .trim()
  .min(1, "Identifier is required")
  .max(128, "Identifier is too long")
  .regex(IDENTIFIER_PATTERN, "Identifier contains unsupported characters");
export const projectIdSchema = identifierSchema;
export const positiveQuantitySchema = z.coerce
  .number()
  .finite("Quantity must be a finite number")
  .positive("Quantity must be greater than zero");
export const nonNegativeQuantitySchema = z.coerce
  .number()
  .finite("Quantity must be a finite number")
  .min(0, "Quantity cannot be negative");
export const currencyAmountSchema = z.coerce
  .number()
  .finite("Amount must be a finite number")
  .min(0, "Amount cannot be negative");
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(TABLE_DEFAULTS.page),
  pageSize: z.coerce
    .number()
    .int()
    .refine(
      (value) => TABLE_DEFAULTS.pageSizeOptions.includes(value),
      "Unsupported page size",
    )
    .default(TABLE_DEFAULTS.pageSize),
});
export const searchQuerySchema = z
  .string()
  .trim()
  .max(200, "Search query is too long")
  .default("");
export const sortDirectionSchema = z.enum(["asc", "desc"]);
export const dateRangeSchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  })
  .refine(({ from, to }) => from.getTime() <= to.getTime(), {
    message: "End date must be on or after the start date",
    path: ["to"],
  });
export function isValidEmail(value) {
  return emailSchema.safeParse(value).success;
}
export function isValidDateInput(value) {
  if (
    !(
      value instanceof Date ||
      typeof value === "string" ||
      typeof value === "number"
    )
  ) {
    return false;
  }
  const date = value instanceof Date ? value : new Date(value);
  return !Number.isNaN(date.getTime());
}

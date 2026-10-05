import { z } from "zod";
import {
  VENDOR_DEFAULT_LIST_PARAMS,
  VENDOR_PAGE_SIZE_OPTIONS,
  VENDOR_SORT_FIELDS,
  VENDOR_STATUS_VALUES,
} from "../constants/vendors.constants";

const identifierSchema = z.string().trim().min(1).max(128);
export const vendorStatusSchema = z.enum(VENDOR_STATUS_VALUES);
export const vendorContactSchema = z.object({
  name: z.string().trim().min(1),
  role: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  email: z.string().trim().min(1),
});
export const vendorSchema = z.object({
  id: identifierSchema,
  code: identifierSchema,
  name: z.string().trim().min(1).max(255),
  type: z.string().trim().min(1),
  gstNumber: z.string().trim().min(1),
  address: z.string().trim().min(1),
  contacts: z.array(vendorContactSchema).default([]),
  materialCategories: z.array(identifierSchema).default([]),
  // Calculated by the backend from real deliveries and quality checks;
  // `null` until there's something to measure.
  rating: z.number().min(0).max(5).nullable().default(null),
  deliveryPerformance: z.number().min(0).max(1).nullable().default(null),
  qualityAcceptanceRate: z.number().min(0).max(1).nullable().default(null),
  rejectionRate: z.number().min(0).max(1).nullable().default(null),
  performanceBasis: z
    .object({
      deliveries: z.number().int().nonnegative(),
      inspectedQuantity: z.number().nonnegative(),
    })
    .default({ deliveries: 0, inspectedQuantity: 0 }),
  // Empty for a newly added vendor — there's no track record to rate yet.
  priceCompetitiveness: z.string().trim().default(""),
  status: vendorStatusSchema,
});
export const vendorsSchema = z.array(vendorSchema);
export const vendorListParamsSchema = z.object({
  category: identifierSchema
    .nullable()
    .default(VENDOR_DEFAULT_LIST_PARAMS.category),
  search: z.string().trim().max(200).default(VENDOR_DEFAULT_LIST_PARAMS.search),
  page: z.number().int().positive().default(VENDOR_DEFAULT_LIST_PARAMS.page),
  pageSize: z
    .number()
    .int()
    .refine((value) => VENDOR_PAGE_SIZE_OPTIONS.includes(value))
    .default(VENDOR_DEFAULT_LIST_PARAMS.pageSize),
  sortBy: z.enum(VENDOR_SORT_FIELDS).default(VENDOR_DEFAULT_LIST_PARAMS.sortBy),
  sortDirection: z
    .enum(["asc", "desc"])
    .default(VENDOR_DEFAULT_LIST_PARAMS.sortDirection),
});
export const vendorCreateInputSchema = z.object({
  // Optional: the backend generates one (VND-0001, ...) when it's left blank.
  code: z
    .string()
    .trim()
    .max(128)
    .optional()
    .transform((value) => value || undefined),
  name: z.string().trim().min(1, "Vendor name is required").max(255),
  type: z.string().trim().min(1, "Vendor type is required"),
  gstNumber: z.string().trim().min(1, "GST number is required"),
  address: z.string().trim().min(1, "Address is required"),
  contacts: z.array(vendorContactSchema).default([]),
  materialCategories: z.array(identifierSchema).default([]),
  priceCompetitiveness: z.string().trim().default(""),
  status: vendorStatusSchema.default("active"),
});
export const vendorCapabilitiesInputSchema = z.object({
  materialCategories: z.array(identifierSchema).default([]),
});
export const vendorListResultSchema = z.object({
  items: vendorsSchema,
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

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
  panNumber: z.string().trim().min(1).optional(),
  address: z.string().trim().min(1),
  contacts: z.array(vendorContactSchema).default([]),
  materialCategories: z.array(identifierSchema).default([]),
  rating: z.number().min(0).max(5),
  deliveryPerformance: z.number().min(0).max(1),
  qualityAcceptanceRate: z.number().min(0).max(1),
  rejectionRate: z.number().min(0).max(1),
  priceCompetitiveness: z.string().trim().min(1),
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
export const vendorListResultSchema = z.object({
  items: vendorsSchema,
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

import { z } from "zod";
import {
  MATERIAL_DEFAULT_LIST_PARAMS,
  MATERIAL_PAGE_SIZE_OPTIONS,
  MATERIAL_SORT_FIELDS,
  MATERIAL_STATUS_VALUES,
} from "../constants/materials.constants";

const identifierSchema = z.string().trim().min(1).max(128);
export const materialStatusSchema = z.enum(MATERIAL_STATUS_VALUES);
export const materialSchema = z.object({
  id: identifierSchema,
  code: identifierSchema,
  name: z.string().trim().min(1).max(255),
  category: identifierSchema,
  subcategory: identifierSchema,
  unit: z.string().trim().min(1).max(32),
  specification: z.string().trim().max(500).optional(),
  approvedVendorIds: z.array(identifierSchema).default([]),
  reorderLevel: z.number().finite().nonnegative(),
  lastPurchasePrice: z.number().finite().nonnegative(),
  status: materialStatusSchema,
});
export const materialsSchema = z.array(materialSchema);
export const materialListParamsSchema = z.object({
  category: identifierSchema
    .nullable()
    .default(MATERIAL_DEFAULT_LIST_PARAMS.category),
  search: z
    .string()
    .trim()
    .max(200)
    .default(MATERIAL_DEFAULT_LIST_PARAMS.search),
  page: z.number().int().positive().default(MATERIAL_DEFAULT_LIST_PARAMS.page),
  pageSize: z
    .number()
    .int()
    .refine((value) => MATERIAL_PAGE_SIZE_OPTIONS.includes(value))
    .default(MATERIAL_DEFAULT_LIST_PARAMS.pageSize),
  sortBy: z.enum(MATERIAL_SORT_FIELDS).default(MATERIAL_DEFAULT_LIST_PARAMS.sortBy),
  sortDirection: z
    .enum(["asc", "desc"])
    .default(MATERIAL_DEFAULT_LIST_PARAMS.sortDirection),
});
export const materialUpdateInputSchema = z.object({
  specification: z.string().trim().max(500).optional(),
  reorderLevel: z.coerce.number().finite().nonnegative(),
  lastPurchasePrice: z.coerce.number().finite().nonnegative(),
  status: materialStatusSchema,
});
export const materialListResultSchema = z.object({
  items: materialsSchema,
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

/** A vendor for a material: approved on the catalogue and/or actually ordered from. */
export const materialVendorSchema = z.object({
  vendorId: z.string().trim().min(1).max(128),
  vendorCode: z.string().nullable().default(null),
  vendorName: z.string().trim().min(1).max(255),
  vendorType: z.string().nullable().default(null),
  rating: z.number().finite().nullable().default(null),
  approved: z.boolean(),
  orderCount: z.number().int().nonnegative(),
  orderedQuantity: z.number().finite().nonnegative(),
  receivedQuantity: z.number().finite().nonnegative(),
  lastUnitPrice: z.number().finite().nonnegative().nullable().default(null),
  lastOrderId: z.string().nullable().default(null),
  lastOrderNumber: z.string().nullable().default(null),
  lastOrderedAt: z.string().nullable().default(null),
});
export const materialVendorsSchema = z.array(materialVendorSchema);

import { z } from "zod";

import {
  INWARD_DEFAULT_LIST_PARAMS,
  INWARD_PAGE_SIZE_OPTIONS,
  INWARD_SORT_FIELDS,
  INWARD_STATUS_VALUES,
} from "../constants/inward.constants";

const identifierSchema = z.string().trim().min(1).max(128);
const quantitySchema = z.number().finite().nonnegative();
export const inwardStatusSchema = z.enum(INWARD_STATUS_VALUES);
export const inwardLineSchema = z.object({
  materialCode: identifierSchema,
  materialName: z.string().trim().min(1).max(255),
  unit: z.string().trim().min(1).max(32),
  orderedQuantity: quantitySchema,
  receivedQuantity: quantitySchema,
  damagedQuantity: quantitySchema,
  missingQuantity: quantitySchema,
});
export const inwardRecordSchema = z.object({
  id: identifierSchema,
  purchaseOrderId: identifierSchema,
  vendorId: identifierSchema,
  projectId: identifierSchema,
  projectName: z.string().trim().min(1).max(255),
  vehicleNumber: z.string().trim().min(1).max(32),
  driverName: z.string().trim().min(1).max(120),
  transporterName: z.string().trim().min(1).max(160),
  invoiceNumber: z.string().trim().min(1).max(64),
  deliveryChallanNumber: z.string().trim().min(1).max(64),
  receivedAt: z.string().datetime({ offset: true }),
  status: inwardStatusSchema,
  lines: z.array(inwardLineSchema).min(1),
});
export const inwardRecordsSchema = z.array(inwardRecordSchema);
export const inwardListParamsSchema = z.object({
  projectId: identifierSchema
    .nullable()
    .default(INWARD_DEFAULT_LIST_PARAMS.projectId),
  status: inwardStatusSchema
    .nullable()
    .default(INWARD_DEFAULT_LIST_PARAMS.status),
  search: z
    .string()
    .trim()
    .max(200)
    .default(INWARD_DEFAULT_LIST_PARAMS.search),
  page: z.number().int().positive().default(INWARD_DEFAULT_LIST_PARAMS.page),
  pageSize: z
    .number()
    .int()
    .refine(
      (value) => INWARD_PAGE_SIZE_OPTIONS.includes(value),
      "Unsupported inward page size",
    )
    .default(INWARD_DEFAULT_LIST_PARAMS.pageSize),
  sortBy: z.enum(INWARD_SORT_FIELDS).default(INWARD_DEFAULT_LIST_PARAMS.sortBy),
  sortDirection: z
    .enum(["asc", "desc"])
    .default(INWARD_DEFAULT_LIST_PARAMS.sortDirection),
});
export const inwardListResultSchema = z.object({
  items: inwardRecordsSchema,
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

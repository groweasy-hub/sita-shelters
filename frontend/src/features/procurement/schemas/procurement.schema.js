import { z } from "zod";

import {
  DELIVERY_STATUS_VALUES,
  PURCHASE_ORDER_DEFAULT_LIST_PARAMS,
  PURCHASE_ORDER_PAGE_SIZE_OPTIONS,
  PURCHASE_ORDER_SORT_FIELDS,
  PURCHASE_ORDER_STATUS_VALUES,
  PURCHASE_REQUEST_STATUS_VALUES,
  QUOTATION_QUALITY_VALUES,
  QUOTATION_STATUS_VALUES,
} from "../constants/procurement.constants";

const identifierSchema = z.string().trim().min(1).max(128);
const quantitySchema = z.number().finite().positive();
const amountSchema = z.number().finite().nonnegative();

export const purchaseRequestStatusSchema = z.enum(PURCHASE_REQUEST_STATUS_VALUES);
export const purchaseRequestMaterialSchema = z.object({
  materialCode: identifierSchema,
  materialName: z.string().trim().min(1).max(255),
  requiredQuantity: quantitySchema,
  unit: z.string().trim().min(1).max(32),
});
export const purchaseRequestSchema = z.object({
  id: identifierSchema,
  sourceIndentId: identifierSchema.nullable().default(null),
  projectId: identifierSchema,
  projectName: z.string().trim().min(1).max(255),
  materials: z.array(purchaseRequestMaterialSchema).min(1),
  requiredDeliveryDate: z.string().trim().min(1),
  status: purchaseRequestStatusSchema,
  createdAt: z.string().datetime({ offset: true }),
});
export const purchaseRequestsSchema = z.array(purchaseRequestSchema);

export const quotationStatusSchema = z.enum(QUOTATION_STATUS_VALUES);
export const quotationQualitySchema = z.enum(QUOTATION_QUALITY_VALUES);
export const quotationSchema = z.object({
  id: identifierSchema,
  purchaseRequestId: identifierSchema,
  vendorId: identifierSchema,
  materialCode: identifierSchema,
  unitPrice: amountSchema,
  taxPercent: z.number().finite().nonnegative(),
  deliveryDays: z.number().int().nonnegative(),
  qualityRating: quotationQualitySchema,
  status: quotationStatusSchema,
});
export const quotationsSchema = z.array(quotationSchema);

export const deliveryStatusSchema = z.enum(DELIVERY_STATUS_VALUES);
export const deliveryScheduleEntrySchema = z.object({
  id: identifierSchema,
  plannedDate: z.string().trim().min(1),
  quantity: quantitySchema,
  status: deliveryStatusSchema,
});
export const purchaseOrderStatusSchema = z.enum(PURCHASE_ORDER_STATUS_VALUES);
export const purchaseOrderItemSchema = z.object({
  materialCode: identifierSchema,
  materialName: z.string().trim().min(1).max(255),
  unit: z.string().trim().min(1).max(32),
  orderedQuantity: quantitySchema,
  unitPrice: amountSchema,
  taxPercent: z.number().finite().nonnegative(),
});
export const purchaseOrderSchema = z.object({
  id: identifierSchema,
  vendorId: identifierSchema,
  projectId: identifierSchema,
  projectName: z.string().trim().min(1).max(255),
  sourceIndentId: identifierSchema.nullable().default(null),
  status: purchaseOrderStatusSchema,
  items: z.array(purchaseOrderItemSchema).min(1),
  deliverySchedule: z.array(deliveryScheduleEntrySchema).default([]),
  termsNote: z.string().trim().max(500).optional(),
  createdAt: z.string().datetime({ offset: true }),
});
export const purchaseOrdersSchema = z.array(purchaseOrderSchema);
export const purchaseOrderListParamsSchema = z.object({
  status: purchaseOrderStatusSchema
    .nullable()
    .default(PURCHASE_ORDER_DEFAULT_LIST_PARAMS.status),
  vendorId: identifierSchema
    .nullable()
    .default(PURCHASE_ORDER_DEFAULT_LIST_PARAMS.vendorId),
  projectId: identifierSchema
    .nullable()
    .default(PURCHASE_ORDER_DEFAULT_LIST_PARAMS.projectId),
  search: z
    .string()
    .trim()
    .max(200)
    .default(PURCHASE_ORDER_DEFAULT_LIST_PARAMS.search),
  page: z
    .number()
    .int()
    .positive()
    .default(PURCHASE_ORDER_DEFAULT_LIST_PARAMS.page),
  pageSize: z
    .number()
    .int()
    .refine((value) => PURCHASE_ORDER_PAGE_SIZE_OPTIONS.includes(value))
    .default(PURCHASE_ORDER_DEFAULT_LIST_PARAMS.pageSize),
  sortBy: z
    .enum(PURCHASE_ORDER_SORT_FIELDS)
    .default(PURCHASE_ORDER_DEFAULT_LIST_PARAMS.sortBy),
  sortDirection: z
    .enum(["asc", "desc"])
    .default(PURCHASE_ORDER_DEFAULT_LIST_PARAMS.sortDirection),
});
export const purchaseOrderListResultSchema = z.object({
  items: purchaseOrdersSchema,
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

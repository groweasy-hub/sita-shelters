import { z } from "zod";

import {
  currencyAmountSchema,
  nonNegativeQuantitySchema,
  positiveQuantitySchema,
  requiredString,
} from "@/lib/validators";
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

export const purchaseRequestStatusSchema = z.enum(
  PURCHASE_REQUEST_STATUS_VALUES,
);
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
  quotationNumber: z.string().trim().min(1).max(64),
  quotationDate: z.string().trim().min(1),
  // Optional: no date = never expires.
  validUntil: z.string().trim().min(1).nullable().default(null),
  unitPrice: amountSchema,
  moq: z.number().finite().nonnegative().default(0),
  discountPercent: z.number().finite().nonnegative().default(0),
  taxPercent: z.number().finite().nonnegative(),
  // true when `unitPrice` already includes tax.
  taxIncluded: z.boolean().default(false),
  // Optional: no value = the supplier gave no delivery promise.
  deliveryDays: z.number().int().nonnegative().nullable().default(null),
  paymentTerms: z.string().trim().max(200).default(""),
  deliveryTerms: z.string().trim().max(200).default(""),
  remarks: z.string().trim().max(500).default(""),
  documentName: z.string().trim().max(255).nullable().default(null),
  qualityRating: quotationQualitySchema,
  status: quotationStatusSchema,
});
export const quotationsSchema = z.array(quotationSchema);
/** Shape validated by the "Record quotation" form before the mock create action. */
export const quotationInputSchema = z.object({
  purchaseRequestId: requiredString("Purchase request"),
  vendorId: requiredString("Supplier"),
  materialCode: requiredString("Item"),
  quotationNumber: requiredString("Quotation number", 64),
  quotationDate: requiredString("Quotation date"),
  unitPrice: currencyAmountSchema,
  moq: nonNegativeQuantitySchema,
  discountPercent: nonNegativeQuantitySchema,
  taxPercent: nonNegativeQuantitySchema,
  taxIncluded: z.boolean().default(false),
  documentName: z.string().trim().max(255).nullable().default(null),
  qualityRating: quotationQualitySchema,
});
export const quotationInputDefaults = {
  purchaseRequestId: "",
  vendorId: "",
  materialCode: "",
  quotationNumber: "",
  quotationDate: "",
  unitPrice: "",
  moq: "",
  discountPercent: "",
  taxPercent: "",
  taxIncluded: false,
  documentName: null,
  qualityRating: "medium",
};

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
export const approvalActionSchema = z.enum([
  "submitted",
  "approved",
  "rejected",
  "sent-back",
  "released",
]);
export const approvalEntrySchema = z.object({
  approver: z.string().trim().min(1).max(200),
  role: z.string().trim().min(1).max(100),
  action: approvalActionSchema,
  remarks: z.string().trim().max(500).default(""),
  at: z.string().datetime({ offset: true }),
});
export const purchaseOrderSchema = z.object({
  id: identifierSchema,
  vendorId: identifierSchema,
  projectId: identifierSchema,
  projectName: z.string().trim().min(1).max(255),
  sourceIndentId: identifierSchema.nullable().default(null),
  quotationLineIds: z.array(identifierSchema).default([]),
  status: purchaseOrderStatusSchema,
  items: z.array(purchaseOrderItemSchema).min(1),
  deliverySchedule: z.array(deliveryScheduleEntrySchema).default([]),
  approvals: z.array(approvalEntrySchema).default([]),
  releasedAt: z.string().datetime({ offset: true }).nullable().default(null),
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

/** Shape validated by the PO creation form before the mock create action. */
export const purchaseOrderItemInputSchema = z.object({
  quotationLineId: identifierSchema.nullable().default(null),
  materialCode: requiredString("Material"),
  materialName: requiredString("Material name"),
  unit: requiredString("Unit", 32),
  orderedQuantity: positiveQuantitySchema,
  unitPrice: currencyAmountSchema,
  taxPercent: nonNegativeQuantitySchema,
});
export const purchaseOrderInputSchema = z.object({
  sourceIndentId: identifierSchema.nullable().default(null),
  vendorId: requiredString("Supplier"),
  projectId: requiredString("Project"),
  termsNote: z.string().trim().max(500).default(""),
  items: z.array(purchaseOrderItemInputSchema).min(1, "Add at least one item"),
});
/** Shape validated by the Reject / Send Back approval dialogs. */
export const approvalRemarksInputSchema = z.object({
  remarks: requiredString("Remarks", 500),
});

import { z } from "zod";
import { refundStatusSchema } from "@/lib/refunds";
import { replacementReceiptSchema } from "@/lib/replacements";

import {
  QC_DEFAULT_LIST_PARAMS,
  QC_PAGE_SIZE_OPTIONS,
  QC_RESOLUTION_TYPE_VALUES,
  QC_SORT_FIELDS,
  QC_STATUS_VALUES,
} from "../constants/quality-control.constants";

const identifierSchema = z.string().trim().min(1).max(128);
const quantitySchema = z.number().finite().nonnegative();
export const qcStatusSchema = z.enum(QC_STATUS_VALUES);
export const qcResolutionTypeSchema = z.enum(QC_RESOLUTION_TYPE_VALUES);
export const qcResolutionSchema = z
  .object({
    type: qcResolutionTypeSchema,
    amount: z.number().finite().nonnegative(),
    // Units the settlement covers: to be replaced, or refunded.
    quantity: quantitySchema.default(0),
    // For a replacement: units received so far, and each delivery (added to stock as it arrives).
    replacedQuantity: quantitySchema.default(0),
    replacements: z.array(replacementReceiptSchema).default([]),
    // For a refund: whether the money has come back yet.
    refund: refundStatusSchema,
    remarks: z.string().trim().max(500),
    resolvedById: identifierSchema,
    resolvedByName: z.string().nullable().default(null),
    resolvedAt: z.string().datetime({ offset: true }),
  })
  .nullable()
  .default(null);
export const qcInspectionSchema = z.object({
  id: identifierSchema,
  inwardId: identifierSchema,
  projectId: identifierSchema,
  projectName: z.string().trim().min(1).max(255),
  materialCode: identifierSchema,
  materialName: z.string().trim().min(1).max(255),
  unit: z.string().trim().min(1).max(32),
  receivedQuantity: quantitySchema,
  acceptedQuantity: quantitySchema,
  rejectedQuantity: quantitySchema,
  // Current unit price, used to value a replacement/refund (quantity × price).
  unitPrice: z.number().finite().nonnegative().default(0),
  // Null until someone inspects the delivery.
  inspectorId: identifierSchema.nullable().default(null),
  inspectorName: z.string().nullable().default(null),
  inspectorRole: z.string().nullable().default(null),
  status: qcStatusSchema,
  remarks: z.string().trim().max(500),
  checklist: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
        result: z.enum(["pass", "fail", "na"]),
      }),
    )
    .default([]),
  inspectedAt: z.string().datetime({ offset: true }).nullable().default(null),
  resolution: qcResolutionSchema,
});
export const qcInspectionsSchema = z.array(qcInspectionSchema);
export const qcResolutionInputSchema = z
  .object({
    type: qcResolutionTypeSchema,
    // The value is calculated by the server from quantity × unit price.
    quantity: z.coerce
      .number()
      .finite()
      .positive("Enter a quantity greater than zero"),
    remarks: z.string().trim().max(500).default(""),
  });
export const qcListParamsSchema = z.object({
  projectId: identifierSchema.nullable().default(QC_DEFAULT_LIST_PARAMS.projectId),
  status: qcStatusSchema.nullable().default(QC_DEFAULT_LIST_PARAMS.status),
  search: z.string().trim().max(200).default(QC_DEFAULT_LIST_PARAMS.search),
  page: z.number().int().positive().default(QC_DEFAULT_LIST_PARAMS.page),
  pageSize: z
    .number()
    .int()
    .refine(
      (value) => QC_PAGE_SIZE_OPTIONS.includes(value),
      "Unsupported QC page size",
    )
    .default(QC_DEFAULT_LIST_PARAMS.pageSize),
  sortBy: z.enum(QC_SORT_FIELDS).default(QC_DEFAULT_LIST_PARAMS.sortBy),
  sortDirection: z
    .enum(["asc", "desc"])
    .default(QC_DEFAULT_LIST_PARAMS.sortDirection),
});
export const qcListResultSchema = z.object({
  items: qcInspectionsSchema,
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

import { z } from "zod";
import { refundStatusSchema } from "@/lib/refunds";
import { replacementReceiptSchema } from "@/lib/replacements";
import {
  RETURN_DEFAULT_LIST_PARAMS,
  RETURN_INSPECTION_STATUS_VALUES,
  RETURN_PAGE_SIZE_OPTIONS,
  RETURN_REASON_VALUES,
  RETURN_RESOLUTION_TYPE_VALUES,
  RETURN_SORT_FIELDS,
  VENDOR_RETURN_STATUS_VALUES,
} from "../constants/returns.constants";

const identifierSchema = z.string().trim().min(1).max(128);
const quantitySchema = z.number().finite().nonnegative();
export const returnReasonSchema = z.enum(RETURN_REASON_VALUES);
export const returnInspectionStatusSchema = z.enum(
  RETURN_INSPECTION_STATUS_VALUES,
);
export const returnInspectionSchema = z
  .object({
    status: returnInspectionStatusSchema,
    goodQuantity: quantitySchema,
    damagedQuantity: quantitySchema,
    inspectedById: identifierSchema.nullable(),
    inspectedByName: z.string().trim().max(255).nullable(),
    inspectedAt: z.string().datetime({ offset: true }).nullable(),
    remarks: z.string().trim().max(500),
  })
  .refine(
    (inspection) =>
      inspection.status !== "pending-inspection" ||
      (inspection.goodQuantity === 0 && inspection.damagedQuantity === 0),
    {
      message: "A pending inspection cannot report good or damaged quantity",
      path: ["status"],
    },
  );
export const returnResolutionTypeSchema = z.enum(RETURN_RESOLUTION_TYPE_VALUES);
export const returnResolutionSchema = z
  .object({
    type: returnResolutionTypeSchema,
    amount: z.number().finite().nonnegative(),
    // Units the settlement covers: to be replaced, or refunded.
    quantity: quantitySchema.default(0),
    // For a replacement: units received so far, and each delivery (added to stock as it arrives).
    replacedQuantity: quantitySchema.default(0),
    replacements: z.array(replacementReceiptSchema).default([]),
    // For a refund: whether the money has come back yet.
    refund: refundStatusSchema,
    remarks: z.string().trim().max(500),
    resolvedById: identifierSchema.nullable(),
    resolvedByName: z.string().trim().max(255).nullable(),
    resolvedAt: z.string().datetime({ offset: true }).nullable(),
  })
  .nullable()
  .default(null);
export const returnRecordSchema = z
  .object({
    id: identifierSchema,
    materialIssueId: identifierSchema,
    projectId: identifierSchema,
    projectName: z.string().trim().min(1).max(255),
    materialCode: identifierSchema,
    materialName: z.string().trim().min(1).max(255),
    unit: z.string().trim().min(1).max(32),
    unitPrice: z.number().finite().nonnegative().default(0),
    returningQuantity: quantitySchema,
    reason: returnReasonSchema,
    returnedById: identifierSchema,
    returnedByName: z.string().trim().min(1).max(255),
    returnedAt: z.string().datetime({ offset: true }),
    inspection: returnInspectionSchema,
    resolution: returnResolutionSchema,
  })
  .refine(
    ({ returningQuantity, inspection }) =>
      inspection.goodQuantity + inspection.damagedQuantity <=
      returningQuantity + 1e-6,
    {
      message: "Good plus damaged quantity cannot exceed the returned quantity",
      path: ["inspection"],
    },
  );
export const returnRecordsSchema = z.array(returnRecordSchema);
export const returnListParamsSchema = z.object({
  projectId: identifierSchema
    .nullable()
    .default(RETURN_DEFAULT_LIST_PARAMS.projectId),
  search: z.string().trim().max(200).default(RETURN_DEFAULT_LIST_PARAMS.search),
  inspectionStatus: returnInspectionStatusSchema
    .nullable()
    .default(RETURN_DEFAULT_LIST_PARAMS.inspectionStatus),
  reason: returnReasonSchema
    .nullable()
    .default(RETURN_DEFAULT_LIST_PARAMS.reason),
  page: z.number().int().positive().default(RETURN_DEFAULT_LIST_PARAMS.page),
  pageSize: z
    .number()
    .int()
    .refine((value) => RETURN_PAGE_SIZE_OPTIONS.includes(value))
    .default(RETURN_DEFAULT_LIST_PARAMS.pageSize),
  sortBy: z.enum(RETURN_SORT_FIELDS).default(RETURN_DEFAULT_LIST_PARAMS.sortBy),
  sortDirection: z
    .enum(["asc", "desc"])
    .default(RETURN_DEFAULT_LIST_PARAMS.sortDirection),
});
export const returnCreateInputSchema = z.object({
  materialIssueId: identifierSchema,
  returningQuantity: z.coerce
    .number({ message: "Enter a valid quantity" })
    .finite()
    .positive("Quantity must be greater than zero"),
  reason: returnReasonSchema,
});
export const returnInspectionInputSchema = z
  .object({
    goodQuantity: z.coerce.number().finite().nonnegative(),
    damagedQuantity: z.coerce.number().finite().nonnegative(),
    remarks: z.string().trim().min(1, "Remarks are required").max(500),
  })
  .refine(
    (input) => input.goodQuantity + input.damagedQuantity > 0,
    { message: "Enter at least one non-zero quantity", path: ["goodQuantity"] },
  );
export const returnResolutionInputSchema = z.object({
  type: returnResolutionTypeSchema,
  // The value is calculated by the server from quantity × unit price.
  quantity: z.coerce
    .number()
    .finite()
    .positive("Enter a quantity greater than zero"),
  remarks: z.string().trim().max(500).default(""),
});
export const vendorReturnStatusSchema = z.enum(VENDOR_RETURN_STATUS_VALUES);
/** Rejected goods-inward quantity going back to the vendor, from a QC inspection. */
export const vendorReturnSchema = z.object({
  id: identifierSchema,
  inwardId: identifierSchema,
  grnNumber: z.string().trim().min(1).max(128),
  purchaseOrderId: identifierSchema.nullable(),
  vendorId: identifierSchema.nullable(),
  vendorName: z.string().trim().max(255).nullable(),
  projectId: identifierSchema,
  projectName: z.string().trim().min(1).max(255),
  materialCode: identifierSchema,
  materialName: z.string().trim().min(1).max(255),
  unit: z.string().trim().min(1).max(32),
  receivedQuantity: quantitySchema,
  rejectedQuantity: quantitySchema,
  rejectedAt: z.string().datetime({ offset: true }),
  remarks: z.string().trim().max(500),
  status: vendorReturnStatusSchema,
  resolution: returnResolutionSchema,
});
export const vendorReturnsSchema = z.array(vendorReturnSchema);
export const returnListResultSchema = z
  .object({
    items: returnRecordsSchema,
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  })
  .refine(({ items, total }) => total >= items.length, {
    message: "Return total cannot be smaller than the returned page",
    path: ["total"],
  });

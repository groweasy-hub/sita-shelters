import { z } from "zod";

import {
  INWARD_DEFAULT_LIST_PARAMS,
  INWARD_PAGE_SIZE_OPTIONS,
  INWARD_SORT_FIELDS,
  INWARD_STAGE_VALUES,
  INWARD_STATUS_VALUES,
} from "../constants/inward.constants";

const identifierSchema = z.string().trim().min(1).max(128);
const quantitySchema = z.number().finite().nonnegative();
export const inwardStatusSchema = z.enum(INWARD_STATUS_VALUES);
export const inwardStageSchema = z.enum(INWARD_STAGE_VALUES);
/** One step of the GRN workflow (raised, approved, rejected, confirmed). */
export const inwardApprovalSchema = z.object({
  action: z.string().trim().min(1).max(64),
  approverId: z.string().max(128).default(""),
  approver: z.string().trim().max(255).default(""),
  role: z.string().trim().max(64).default(""),
  remarks: z.string().trim().max(500).default(""),
  at: z.string().datetime({ offset: true }),
});
export const inwardLineSchema = z.object({
  materialCode: identifierSchema,
  materialName: z.string().trim().min(1).max(255),
  unit: z.string().trim().min(1).max(32),
  orderedQuantity: quantitySchema,
  receivedQuantity: quantitySchema,
  damagedQuantity: quantitySchema,
  missingQuantity: quantitySchema,
  // What quality control passed / rejected for this line (0 until inspected).
  acceptedQuantity: quantitySchema.default(0),
  rejectedQuantity: quantitySchema.default(0),
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
  stage: inwardStageSchema.default("awaiting-qc"),
  approvals: z.array(inwardApprovalSchema).default([]),
  lines: z.array(inwardLineSchema).min(1),
  recordedById: identifierSchema.nullable().default(null),
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
export const inwardLineInputSchema = z
  .object({
    materialCode: identifierSchema,
    materialName: z.string().trim().min(1).max(255),
    unit: z.string().trim().min(1).max(32),
    orderedQuantity: quantitySchema,
    receivedQuantity: z.coerce.number().finite().nonnegative(),
    damagedQuantity: z.coerce.number().finite().nonnegative(),
    missingQuantity: z.coerce.number().finite().nonnegative(),
  })
  .refine(
    (line) => line.damagedQuantity + line.missingQuantity <= line.receivedQuantity + 1e-6,
    {
      message: "Damaged + missing quantity cannot exceed the received quantity",
      path: ["damagedQuantity"],
    },
  );
export const inwardInputSchema = z.object({
  purchaseOrderId: identifierSchema,
  vehicleNumber: z.string().trim().min(1, "Vehicle number is required").max(32),
  driverName: z.string().trim().min(1, "Driver name is required").max(120),
  transporterName: z.string().trim().min(1, "Transporter name is required").max(160),
  invoiceNumber: z.string().trim().min(1, "Invoice number is required").max(64),
  deliveryChallanNumber: z
    .string()
    .trim()
    .min(1, "Delivery challan number is required")
    .max(64),
  receivedAt: z.string().min(1, "Received date/time is required"),
  lines: z.array(inwardLineInputSchema).min(1),
});

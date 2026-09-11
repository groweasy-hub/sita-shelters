import { z } from "zod";

import {
  QC_DEFAULT_LIST_PARAMS,
  QC_PAGE_SIZE_OPTIONS,
  QC_SORT_FIELDS,
  QC_STATUS_VALUES,
} from "../constants/quality-control.constants";

const identifierSchema = z.string().trim().min(1).max(128);
const quantitySchema = z.number().finite().nonnegative();
export const qcStatusSchema = z.enum(QC_STATUS_VALUES);
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
  inspectorId: identifierSchema,
  status: qcStatusSchema,
  remarks: z.string().trim().max(500),
  inspectedAt: z.string().datetime({ offset: true }).nullable().default(null),
});
export const qcInspectionsSchema = z.array(qcInspectionSchema);
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

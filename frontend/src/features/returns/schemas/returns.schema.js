import { z } from "zod";
import {
  RETURN_DEFAULT_LIST_PARAMS,
  RETURN_INSPECTION_STATUS_VALUES,
  RETURN_PAGE_SIZE_OPTIONS,
  RETURN_REASON_VALUES,
  RETURN_SORT_FIELDS,
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
export const returnRecordSchema = z
  .object({
    id: identifierSchema,
    materialIssueId: identifierSchema,
    projectId: identifierSchema,
    projectName: z.string().trim().min(1).max(255),
    materialCode: identifierSchema,
    materialName: z.string().trim().min(1).max(255),
    unit: z.string().trim().min(1).max(32),
    returningQuantity: quantitySchema,
    reason: returnReasonSchema,
    returnedById: identifierSchema,
    returnedByName: z.string().trim().min(1).max(255),
    returnedAt: z.string().datetime({ offset: true }),
    inspection: returnInspectionSchema,
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

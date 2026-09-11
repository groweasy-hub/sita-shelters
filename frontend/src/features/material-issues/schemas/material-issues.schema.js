import { z } from "zod";
import {
  MATERIAL_ISSUE_DEFAULT_LIST_PARAMS,
  MATERIAL_ISSUE_DEPARTMENT_VALUES,
  MATERIAL_ISSUE_PAGE_SIZE_OPTIONS,
  MATERIAL_ISSUE_SORT_FIELDS,
  MATERIAL_ISSUE_STATUS_VALUES,
} from "../constants/material-issues.constants";

const identifierSchema = z.string().trim().min(1).max(128);
const quantitySchema = z.number().finite().nonnegative();
export const materialIssueStatusSchema = z.enum(MATERIAL_ISSUE_STATUS_VALUES);
export const materialIssueDepartmentSchema = z.enum(
  MATERIAL_ISSUE_DEPARTMENT_VALUES,
);
export const materialIssueSchema = z
  .object({
    id: identifierSchema,
    projectId: identifierSchema,
    projectName: z.string().trim().min(1).max(255),
    materialCode: identifierSchema,
    materialName: z.string().trim().min(1).max(255),
    unit: z.string().trim().min(1).max(32),
    issuedQuantity: quantitySchema,
    consumedQuantity: quantitySchema,
    returnedQuantity: quantitySchema,
    recipientName: z.string().trim().min(1).max(255),
    department: materialIssueDepartmentSchema,
    purpose: z.string().trim().min(1).max(255),
    workLocation: z.string().trim().min(1).max(255),
    issuedById: identifierSchema,
    issuedByName: z.string().trim().min(1).max(255),
    issuedAt: z.string().datetime({ offset: true }),
    status: materialIssueStatusSchema,
  })
  .refine(
    ({ consumedQuantity, returnedQuantity, issuedQuantity }) =>
      consumedQuantity + returnedQuantity <= issuedQuantity + 1e-6,
    {
      message: "Consumed plus returned quantity cannot exceed issued quantity",
      path: ["returnedQuantity"],
    },
  );
export const materialIssuesSchema = z.array(materialIssueSchema);
export const materialIssueListParamsSchema = z.object({
  projectId: identifierSchema
    .nullable()
    .default(MATERIAL_ISSUE_DEFAULT_LIST_PARAMS.projectId),
  search: z
    .string()
    .trim()
    .max(200)
    .default(MATERIAL_ISSUE_DEFAULT_LIST_PARAMS.search),
  status: materialIssueStatusSchema
    .nullable()
    .default(MATERIAL_ISSUE_DEFAULT_LIST_PARAMS.status),
  department: materialIssueDepartmentSchema
    .nullable()
    .default(MATERIAL_ISSUE_DEFAULT_LIST_PARAMS.department),
  page: z
    .number()
    .int()
    .positive()
    .default(MATERIAL_ISSUE_DEFAULT_LIST_PARAMS.page),
  pageSize: z
    .number()
    .int()
    .refine((value) => MATERIAL_ISSUE_PAGE_SIZE_OPTIONS.includes(value))
    .default(MATERIAL_ISSUE_DEFAULT_LIST_PARAMS.pageSize),
  sortBy: z
    .enum(MATERIAL_ISSUE_SORT_FIELDS)
    .default(MATERIAL_ISSUE_DEFAULT_LIST_PARAMS.sortBy),
  sortDirection: z
    .enum(["asc", "desc"])
    .default(MATERIAL_ISSUE_DEFAULT_LIST_PARAMS.sortDirection),
});
export const materialIssueListResultSchema = z
  .object({
    items: materialIssuesSchema,
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  })
  .refine(({ items, total }) => total >= items.length, {
    message: "Material issue total cannot be smaller than the returned page",
    path: ["total"],
  });

import { z } from "zod";

import { positiveQuantitySchema, requiredString } from "@/lib/validators";
import {
  INDENT_DEFAULT_LIST_PARAMS,
  INDENT_PAGE_SIZE_OPTIONS,
  INDENT_PRIORITY_VALUES,
  INDENT_SORT_FIELDS,
  INDENT_STATUS_VALUES,
} from "../constants/indents.constants";

const identifierSchema = z.string().trim().min(1).max(128);
export const indentPrioritySchema = z.enum(INDENT_PRIORITY_VALUES);
export const indentStatusSchema = z.enum(INDENT_STATUS_VALUES);

export const indentLineSchema = z.object({
  materialCode: identifierSchema,
  materialName: z.string().trim().min(1).max(255),
  unit: z.string().trim().min(1).max(32),
  requestedQuantity: z.number().finite().positive(),
  approvedQuantity: z.number().finite().nonnegative().nullable().default(null),
});
export const indentSchema = z.object({
  id: identifierSchema,
  projectId: identifierSchema,
  projectName: z.string().trim().min(1).max(255),
  requestedById: identifierSchema,
  priority: indentPrioritySchema,
  status: indentStatusSchema,
  requiredDate: z.string().trim().min(1),
  purpose: z.string().trim().min(1).max(500),
  workLocation: z.string().trim().min(1).max(255),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  lines: z.array(indentLineSchema).min(1),
  hasProcurementRequest: z.boolean().default(false),
});
export const indentsSchema = z.array(indentSchema);

export const indentListParamsSchema = z.object({
  projectId: identifierSchema
    .nullable()
    .default(INDENT_DEFAULT_LIST_PARAMS.projectId),
  status: indentStatusSchema
    .nullable()
    .default(INDENT_DEFAULT_LIST_PARAMS.status),
  priority: indentPrioritySchema
    .nullable()
    .default(INDENT_DEFAULT_LIST_PARAMS.priority),
  search: z
    .string()
    .trim()
    .max(200)
    .default(INDENT_DEFAULT_LIST_PARAMS.search),
  page: z.number().int().positive().default(INDENT_DEFAULT_LIST_PARAMS.page),
  pageSize: z
    .number()
    .int()
    .refine(
      (value) => INDENT_PAGE_SIZE_OPTIONS.includes(value),
      "Unsupported indent page size",
    )
    .default(INDENT_DEFAULT_LIST_PARAMS.pageSize),
  sortBy: z.enum(INDENT_SORT_FIELDS).default(INDENT_DEFAULT_LIST_PARAMS.sortBy),
  sortDirection: z
    .enum(["asc", "desc"])
    .default(INDENT_DEFAULT_LIST_PARAMS.sortDirection),
});
export const indentListResultSchema = z.object({
  items: indentsSchema,
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

/** Shape validated by the "Raise Indent" form before the mock submit action. */
export const indentLineInputSchema = z.object({
  materialCode: requiredString("Material"),
  requestedQuantity: positiveQuantitySchema,
});
export const createIndentInputSchema = z.object({
  projectId: requiredString("Project"),
  requiredDate: requiredString("Required date"),
  priority: indentPrioritySchema,
  purpose: requiredString("Purpose", 500),
  workLocation: requiredString("Work location"),
  lines: z
    .array(indentLineInputSchema)
    .min(1, "Add at least one material line"),
});
export const createIndentInputDefaults = {
  projectId: "",
  requiredDate: "",
  priority: "medium",
  purpose: "",
  workLocation: "",
  lines: [{ materialCode: "", requestedQuantity: "" }],
};

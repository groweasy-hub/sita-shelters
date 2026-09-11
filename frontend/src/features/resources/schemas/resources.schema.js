import { z } from "zod";

import {
  MAINTENANCE_STATUS_VALUES,
  MAINTENANCE_TYPE_VALUES,
  RESOURCE_CATEGORY_VALUES,
  RESOURCE_DEFAULT_LIST_PARAMS,
  RESOURCE_PAGE_SIZE_OPTIONS,
  RESOURCE_SORT_FIELDS,
  RESOURCE_STATUS_VALUES,
} from "../constants/resources.constants";

const identifierSchema = z.string().trim().min(1).max(128);
const dateOnlySchema = z.string().date();
const nullableDateOnlySchema = dateOnlySchema.nullable();
const moneySchema = z.number().finite().nonnegative();

export const resourceCategorySchema = z.enum(RESOURCE_CATEGORY_VALUES);
export const resourceStatusSchema = z.enum(RESOURCE_STATUS_VALUES);

export const resourceSchema = z.object({
  id: identifierSchema,
  name: z.string().trim().min(1).max(255),
  category: resourceCategorySchema,
  specification: z.string().trim().min(1).max(500),
  currentProjectId: identifierSchema.nullable(),
  status: resourceStatusSchema,
  assignedSince: nullableDateOnlySchema,
  lastMaintenanceDate: dateOnlySchema,
  nextMaintenanceDueDate: dateOnlySchema,
  dailyRentalCost: moneySchema,
});
export const resourcesSchema = z.array(resourceSchema);

export const resourceListParamsSchema = z.object({
  category: resourceCategorySchema
    .nullable()
    .default(RESOURCE_DEFAULT_LIST_PARAMS.category),
  status: resourceStatusSchema
    .nullable()
    .default(RESOURCE_DEFAULT_LIST_PARAMS.status),
  projectId: identifierSchema
    .nullable()
    .default(RESOURCE_DEFAULT_LIST_PARAMS.projectId),
  search: z
    .string()
    .trim()
    .max(200)
    .default(RESOURCE_DEFAULT_LIST_PARAMS.search),
  page: z.number().int().positive().default(RESOURCE_DEFAULT_LIST_PARAMS.page),
  pageSize: z
    .number()
    .int()
    .refine(
      (value) => RESOURCE_PAGE_SIZE_OPTIONS.includes(value),
      "Unsupported resource page size",
    )
    .default(RESOURCE_DEFAULT_LIST_PARAMS.pageSize),
  sortBy: z
    .enum(RESOURCE_SORT_FIELDS)
    .default(RESOURCE_DEFAULT_LIST_PARAMS.sortBy),
  sortDirection: z
    .enum(["asc", "desc"])
    .default(RESOURCE_DEFAULT_LIST_PARAMS.sortDirection),
});
export const resourceListResultSchema = z
  .object({
    items: resourcesSchema,
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  })
  .refine(({ items, total }) => total >= items.length, {
    message: "Resource total cannot be smaller than the returned page",
    path: ["total"],
  });

/** A resource's deployment history: which project it served, and when. */
export const resourceAssignmentSchema = z.object({
  id: identifierSchema,
  resourceId: identifierSchema,
  projectId: identifierSchema,
  assignedFrom: dateOnlySchema,
  assignedTo: nullableDateOnlySchema,
  assignedById: identifierSchema,
});
export const resourceAssignmentsSchema = z.array(resourceAssignmentSchema);

/** A resource's maintenance log: scheduled service, breakdown and inspection events. */
export const maintenanceTypeSchema = z.enum(MAINTENANCE_TYPE_VALUES);
export const maintenanceStatusSchema = z.enum(MAINTENANCE_STATUS_VALUES);
export const resourceMaintenanceRecordSchema = z.object({
  id: identifierSchema,
  resourceId: identifierSchema,
  type: maintenanceTypeSchema,
  date: dateOnlySchema,
  description: z.string().trim().min(1).max(500),
  cost: moneySchema,
  performedBy: z.string().trim().min(1).max(255),
  status: maintenanceStatusSchema,
});
export const resourceMaintenanceRecordsSchema = z.array(
  resourceMaintenanceRecordSchema,
);

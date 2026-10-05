import { z } from "zod";
import { materialIssueReturnSchema } from "@/features/material-issues";
import {
  CONSUMPTION_DEFAULT_LIST_PARAMS,
  CONSUMPTION_PAGE_SIZE_OPTIONS,
  CONSUMPTION_SORT_FIELDS,
} from "../constants/consumption.constants";

const identifierSchema = z.string().trim().min(1).max(128);
const quantitySchema = z.number().finite().nonnegative();
/** The parent issue's running totals, so a row shows what was returned alongside what was used. */
export const consumptionIssueSummarySchema = z.object({
  issuedQuantity: quantitySchema,
  consumedQuantity: quantitySchema,
  returnedQuantity: quantitySchema,
  outstandingQuantity: z.number().finite(),
  status: z.string().trim().min(1).max(64),
});
export const consumptionEntrySchema = z.object({
  id: identifierSchema,
  materialIssueId: identifierSchema,
  projectId: identifierSchema,
  projectName: z.string().trim().min(1).max(255),
  materialCode: identifierSchema,
  materialName: z.string().trim().min(1).max(255),
  categoryId: identifierSchema,
  category: z.string().trim().min(1).max(120),
  unit: z.string().trim().min(1).max(32),
  quantityConsumed: z.number().finite().positive(),
  activity: z.string().trim().min(1).max(255),
  location: z.string().trim().min(1).max(255),
  recordedById: identifierSchema,
  recordedByName: z.string().trim().min(1).max(255),
  consumedAt: z.string().datetime({ offset: true }),
  issue: consumptionIssueSummarySchema.nullable().default(null),
  returns: z.array(materialIssueReturnSchema).default([]),
});
export const consumptionEntriesSchema = z.array(consumptionEntrySchema);
export const consumptionListParamsSchema = z.object({
  projectId: identifierSchema
    .nullable()
    .default(CONSUMPTION_DEFAULT_LIST_PARAMS.projectId),
  search: z
    .string()
    .trim()
    .max(200)
    .default(CONSUMPTION_DEFAULT_LIST_PARAMS.search),
  categoryId: identifierSchema
    .nullable()
    .default(CONSUMPTION_DEFAULT_LIST_PARAMS.categoryId),
  page: z
    .number()
    .int()
    .positive()
    .default(CONSUMPTION_DEFAULT_LIST_PARAMS.page),
  pageSize: z
    .number()
    .int()
    .refine((value) => CONSUMPTION_PAGE_SIZE_OPTIONS.includes(value))
    .default(CONSUMPTION_DEFAULT_LIST_PARAMS.pageSize),
  sortBy: z
    .enum(CONSUMPTION_SORT_FIELDS)
    .default(CONSUMPTION_DEFAULT_LIST_PARAMS.sortBy),
  sortDirection: z
    .enum(["asc", "desc"])
    .default(CONSUMPTION_DEFAULT_LIST_PARAMS.sortDirection),
});
export const consumptionCreateInputSchema = z.object({
  materialIssueId: identifierSchema,
  quantityConsumed: z.coerce
    .number({ message: "Enter a valid quantity" })
    .finite()
    .positive("Quantity must be greater than zero"),
  activity: z.string().trim().min(1, "Activity is required").max(255),
  location: z.string().trim().min(1, "Location is required").max(255),
});
export const consumptionListResultSchema = z
  .object({
    items: consumptionEntriesSchema,
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  })
  .refine(({ items, total }) => total >= items.length, {
    message: "Consumption total cannot be smaller than the returned page",
    path: ["total"],
  });

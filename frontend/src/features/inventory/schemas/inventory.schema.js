import { z } from "zod";
import {
  INVENTORY_DEFAULT_LIST_PARAMS,
  INVENTORY_PAGE_SIZE_OPTIONS,
  INVENTORY_SORT_FIELDS,
  INVENTORY_STATUS_VALUES,
} from "../constants/inventory.constants";
const inventoryIdentifierSchema = z.string().trim().min(1).max(128);
const inventoryQuantitySchema = z.number().finite().nonnegative();
export const inventoryStatusSchema = z.enum(INVENTORY_STATUS_VALUES);
export const inventoryItemSchema = z.object({
  id: inventoryIdentifierSchema,
  // The catalogue entry this stock belongs to; opens the material's full details.
  materialId: inventoryIdentifierSchema.nullable().default(null),
  materialCode: inventoryIdentifierSchema,
  materialName: z.string().trim().min(1).max(255),
  category: z.string().trim().min(1).max(120),
  projectId: inventoryIdentifierSchema,
  projectName: z.string().trim().min(1).max(255),
  unit: z.string().trim().min(1).max(32),
  availableQuantity: inventoryQuantitySchema,
  reservedQuantity: inventoryQuantitySchema,
  // Posted by the Project Manager's GRN approval, awaiting the store manager's confirmation.
  pendingReceiptQuantity: inventoryQuantitySchema.default(0),
  reorderLevel: inventoryQuantitySchema,
  // Live catalogue price and quantity x price, calculated by the backend.
  unitPrice: z.number().finite().nonnegative().default(0),
  stockValue: z.number().finite().nonnegative().default(0),
  status: inventoryStatusSchema,
  updatedAt: z.string().datetime({ offset: true }),
});
export const inventoryItemsSchema = z.array(inventoryItemSchema);
export const inventoryListParamsSchema = z.object({
  projectId: inventoryIdentifierSchema
    .nullable()
    .default(INVENTORY_DEFAULT_LIST_PARAMS.projectId),
  search: z
    .string()
    .trim()
    .max(200)
    .default(INVENTORY_DEFAULT_LIST_PARAMS.search),
  statuses: z
    .array(inventoryStatusSchema)
    .max(INVENTORY_STATUS_VALUES.length)
    .default([...INVENTORY_DEFAULT_LIST_PARAMS.statuses])
    .transform((statuses) =>
      INVENTORY_STATUS_VALUES.filter((status) => statuses.includes(status)),
    ),
  page: z.number().int().positive().default(INVENTORY_DEFAULT_LIST_PARAMS.page),
  pageSize: z
    .number()
    .int()
    .refine(
      (value) => INVENTORY_PAGE_SIZE_OPTIONS.includes(value),
      "Unsupported inventory page size",
    )
    .default(INVENTORY_DEFAULT_LIST_PARAMS.pageSize),
  sortBy: z
    .enum(INVENTORY_SORT_FIELDS)
    .default(INVENTORY_DEFAULT_LIST_PARAMS.sortBy),
  sortDirection: z
    .enum(["asc", "desc"])
    .default(INVENTORY_DEFAULT_LIST_PARAMS.sortDirection),
});
export const inventoryListResultSchema = z
  .object({
    items: inventoryItemsSchema,
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  })
  .refine(({ items, total }) => total >= items.length, {
    message: "Inventory total cannot be smaller than the returned page",
    path: ["total"],
  });

export const stockUsageInputSchema = z.object({
  projectId: inventoryIdentifierSchema,
  materialCode: inventoryIdentifierSchema,
  quantityConsumed: z.coerce
    .number({ message: "Enter a valid quantity" })
    .finite()
    .positive("Quantity must be greater than zero"),
  activity: z.string().trim().min(1, "Activity is required").max(255),
  location: z.string().trim().min(1, "Location is required").max(255),
});

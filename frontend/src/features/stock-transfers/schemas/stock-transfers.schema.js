import { z } from "zod";
import {
  TRANSFER_DEFAULT_LIST_PARAMS,
  TRANSFER_PAGE_SIZE_OPTIONS,
  TRANSFER_SORT_FIELDS,
  TRANSFER_STATUS_VALUES,
} from "../constants/stock-transfers.constants";

const identifierSchema = z.string().trim().min(1).max(128);
const nullableIdentifierSchema = identifierSchema.nullable().default(null);
const nullableIsoDateTimeSchema = z
  .string()
  .datetime({ offset: true })
  .nullable()
  .default(null);

export const transferStatusSchema = z.enum(TRANSFER_STATUS_VALUES);

/**
 * The read model returned to the UI. Source/destination project names and the
 * material name/unit are enriched onto the record by the service (the same
 * pattern `inventory.service.js` uses for `projectName`/`category`), so
 * screens never need to re-join against the project or material master.
 */
export const stockTransferSchema = z
  .object({
    id: identifierSchema,
    sourceProjectId: identifierSchema,
    sourceProjectName: z.string().trim().min(1).max(255),
    destinationProjectId: identifierSchema,
    destinationProjectName: z.string().trim().min(1).max(255),
    materialCode: identifierSchema,
    materialName: z.string().trim().min(1).max(255),
    unit: z.string().trim().min(1).max(32),
    quantity: z.number().finite().positive(),
    status: transferStatusSchema,
    requestedById: identifierSchema,
    requestedByName: z.string().trim().min(1).max(255),
    approvedById: nullableIdentifierSchema,
    approvedByName: z.string().trim().min(1).max(255).nullable().default(null),
    requestedAt: z.string().datetime({ offset: true }),
    dispatchedAt: nullableIsoDateTimeSchema,
    receivedAt: nullableIsoDateTimeSchema,
    vehicleNumber: z.string().trim().min(1).max(32).nullable().default(null),
    remarks: z.string().trim().max(500).nullable().default(null),
    rejectionReason: z.string().trim().max(500).nullable().default(null),
  })
  .refine(
    (transfer) => transfer.sourceProjectId !== transfer.destinationProjectId,
    {
      message: "Source and destination projects must differ",
      path: ["destinationProjectId"],
    },
  );
export const stockTransfersSchema = z.array(stockTransferSchema);

export const transferListParamsSchema = z.object({
  status: transferStatusSchema
    .nullable()
    .default(TRANSFER_DEFAULT_LIST_PARAMS.status),
  sourceProjectId: identifierSchema
    .nullable()
    .default(TRANSFER_DEFAULT_LIST_PARAMS.sourceProjectId),
  destinationProjectId: identifierSchema
    .nullable()
    .default(TRANSFER_DEFAULT_LIST_PARAMS.destinationProjectId),
  search: z
    .string()
    .trim()
    .max(200)
    .default(TRANSFER_DEFAULT_LIST_PARAMS.search),
  page: z.number().int().positive().default(TRANSFER_DEFAULT_LIST_PARAMS.page),
  pageSize: z
    .number()
    .int()
    .refine(
      (value) => TRANSFER_PAGE_SIZE_OPTIONS.includes(value),
      "Unsupported transfer page size",
    )
    .default(TRANSFER_DEFAULT_LIST_PARAMS.pageSize),
  sortBy: z
    .enum(TRANSFER_SORT_FIELDS)
    .default(TRANSFER_DEFAULT_LIST_PARAMS.sortBy),
  sortDirection: z
    .enum(["asc", "desc"])
    .default(TRANSFER_DEFAULT_LIST_PARAMS.sortDirection),
});
export const transferListResultSchema = z
  .object({
    items: stockTransfersSchema,
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  })
  .refine(({ items, total }) => total >= items.length, {
    message: "Transfer total cannot be smaller than the returned page",
    path: ["total"],
  });

/** Presentational "New Transfer Request" dialog form contract. */
export const newTransferRequestSchema = z
  .object({
    sourceProjectId: identifierSchema,
    destinationProjectId: identifierSchema,
    materialCode: identifierSchema,
    quantity: z.coerce
      .number({ message: "Enter a valid quantity" })
      .finite()
      .positive("Quantity must be greater than zero"),
    remarks: z.string().trim().max(500).optional().default(""),
  })
  .refine(
    (values) => values.sourceProjectId !== values.destinationProjectId,
    {
      message: "Source and destination projects must differ",
      path: ["destinationProjectId"],
    },
  );

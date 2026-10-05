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
/**
 * A person who can approve this indent's project, with contact details so
 * whoever's chasing it can reach out directly. Only populated on the detail
 * fetch, and only while the indent is actually awaiting approval.
 */
export const indentApproverSchema = z.object({
  id: identifierSchema,
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().max(255),
  mobile: z.string().trim().max(32).nullable().default(null),
  role: z.string().trim().min(1).max(64),
});
export const indentSchema = z.object({
  id: identifierSchema,
  projectId: identifierSchema,
  projectName: z.string().trim().min(1).max(255),
  requestedById: identifierSchema,
  // Resolved server-side from the user record; absent on older payloads.
  requestedByName: z.string().trim().min(1).max(255).optional(),
  requestedByRole: z.string().nullable().optional(),
  priority: indentPrioritySchema,
  status: indentStatusSchema,
  requiredDate: z.string().trim().min(1),
  purpose: z.string().trim().min(1).max(500),
  workLocation: z.string().trim().min(1).max(255),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  lines: z.array(indentLineSchema).min(1),
  hasProcurementRequest: z.boolean().default(false),
  // Where the indent's whole pipeline is currently stuck (not just the
  // indent-approval step) and who can move it — null/"completed"/"rejected"
  // mean there's nobody to chase right now.
  waitingOnStage: z.string().trim().max(64).nullable().default(null),
  waitingOnLabel: z.string().trim().max(255).nullable().default(null),
  waitingOn: z.array(indentApproverSchema).default([]),
});
export const indentsSchema = z.array(indentSchema);

/** One entry in the indent's end-to-end activity timeline. */
export const indentTimelineEventSchema = z.object({
  at: z.string().datetime({ offset: true }),
  label: z.string().trim().min(1).max(255),
  detail: z.string().trim().max(500).nullable().default(null),
  actorName: z.string().trim().max(255).nullable().default(null),
  actorRole: z.string().trim().max(64).nullable().default(null),
  vendorId: identifierSchema.nullable().default(null),
});
export const indentTimelineSchema = z.array(indentTimelineEventSchema);

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

/**
 * What the API accepts for one indent line: an existing catalogue item, or a
 * new item that the backend adds to the catalogue when the indent is created.
 */
export const indentLineInputSchema = z.union([
  z.object({
    materialCode: requiredString("Material"),
    requestedQuantity: positiveQuantitySchema,
  }),
  z.object({
    newMaterial: z.object({
      name: requiredString("Item name", 255),
      unit: requiredString("Unit", 32),
      category: requiredString("Category"),
      subcategory: requiredString("Category"),
    }),
    requestedQuantity: positiveQuantitySchema,
  }),
]);
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

/** One line of the "Raise Indent" form, before it's turned into the API shape. */
export const indentFormLineSchema = z
  .object({
    isNew: z.boolean(),
    materialCode: z.string().trim(),
    newName: z.string().trim().max(255, "Use at most 255 characters"),
    newUnit: z.string().trim(),
    // "<category>/<subcategory>", picked from one flat list.
    newCategory: z.string().trim(),
    requestedQuantity: positiveQuantitySchema,
  })
  .superRefine((line, context) => {
    const missing = (path, message) =>
      context.addIssue({ code: "custom", path: [path], message });
    if (line.isNew) {
      if (!line.newName) missing("newName", "Enter the item name");
      if (!line.newUnit) missing("newUnit", "Select a unit");
      if (!line.newCategory) missing("newCategory", "Select a category");
    } else if (!line.materialCode) {
      missing("materialCode", "Material is required");
    }
  });
export const createIndentFormSchema = z.object({
  projectId: requiredString("Project"),
  requiredDate: requiredString("Required date"),
  priority: indentPrioritySchema,
  purpose: requiredString("Purpose", 500),
  workLocation: requiredString("Work location"),
  lines: z
    .array(indentFormLineSchema)
    .min(1, "Add at least one material line"),
});
export const emptyIndentFormLine = {
  isNew: false,
  materialCode: "",
  newName: "",
  newUnit: "",
  newCategory: "",
  requestedQuantity: "",
};
export const createIndentFormDefaults = {
  projectId: "",
  requiredDate: "",
  priority: "medium",
  purpose: "",
  workLocation: "",
  lines: [emptyIndentFormLine],
};

/** Converts validated form values into the shape the API and service accept. */
export function toCreateIndentInput(values) {
  return {
    projectId: values.projectId,
    requiredDate: values.requiredDate,
    priority: values.priority,
    purpose: values.purpose,
    workLocation: values.workLocation,
    lines: values.lines.map((line) => {
      if (!line.isNew) {
        return {
          materialCode: line.materialCode,
          requestedQuantity: line.requestedQuantity,
        };
      }
      const [category, subcategory] = line.newCategory.split("/");
      return {
        newMaterial: {
          name: line.newName,
          unit: line.newUnit,
          category,
          subcategory,
        },
        requestedQuantity: line.requestedQuantity,
      };
    }),
  };
}

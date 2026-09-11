import { z } from "zod";
import { PROJECT_STATUS_VALUES } from "../constants/projects.constants";

const identifierSchema = z.string().trim().min(1).max(128);
const requiredField = (label, maximum = 255) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(maximum, `${label} must be ${maximum} characters or fewer`);
const optionalField = (maximum = 255) =>
  z.string().trim().max(maximum).optional();

export const projectStatusSchema = z.enum(PROJECT_STATUS_VALUES);
export const projectAddressSchema = z.object({
  line1: requiredField("Address line 1"),
  line2: optionalField(),
  landmark: optionalField(),
  city: requiredField("City", 100),
  state: requiredField("State", 100),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  country: requiredField("Country", 100),
});
export const projectSchema = z.object({
  id: identifierSchema,
  code: identifierSchema,
  name: z.string().trim().min(1).max(255),
  location: z.string().trim().min(1),
  status: projectStatusSchema,
  projectManagerId: identifierSchema,
  startDate: z.string().min(1),
  estimatedCompletionDate: z.string().min(1),
  progressPercent: z.number().min(0).max(100),
  description: z.string().trim().max(1000).optional(),
  address: projectAddressSchema,
});
export const projectsSchema = z.array(projectSchema);

export const createProjectInputSchema = z
  .object({
    code: requiredField("Project code", 32).regex(
      /^[A-Za-z0-9-]+$/,
      "Use only letters, numbers and hyphens",
    ),
    name: requiredField("Project name"),
    status: projectStatusSchema,
    projectManagerId: requiredField("Project manager", 128),
    startDate: requiredField("Start date", 10),
    estimatedCompletionDate: requiredField("Estimated completion date", 10),
    progressPercent: z.coerce
      .number({ error: "Enter a valid completion percentage" })
      .int("Completion must be a whole number")
      .min(0, "Completion cannot be below 0%")
      .max(100, "Completion cannot exceed 100%"),
    description: requiredField("Description", 1000),
    address: projectAddressSchema,
  })
  .refine(
    ({ estimatedCompletionDate, startDate }) =>
      estimatedCompletionDate >= startDate,
    {
      message: "Completion date must be on or after the start date",
      path: ["estimatedCompletionDate"],
    },
  );

export const createProjectInputDefaults = {
  code: "",
  name: "",
  status: "planning",
  projectManagerId: "",
  startDate: "",
  estimatedCompletionDate: "",
  progressPercent: 0,
  description: "",
  address: {
    line1: "",
    line2: "",
    landmark: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  },
};

/** Computed, read-only aggregate attached to each project by the service layer. */
export const projectSummarySchema = projectSchema.extend({
  inventoryValue: z.number().finite().nonnegative(),
  lowStockAlerts: z.number().int().nonnegative(),
  activeIndents: z.number().int().nonnegative(),
  pendingProcurement: z.number().int().nonnegative(),
});
export const projectSummariesSchema = z.array(projectSummarySchema);

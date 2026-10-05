import { z } from "zod";

import { APP_ROLES } from "@/config/permissions";
import {
  ADMIN_USER_DEFAULT_LIST_PARAMS,
  ADMIN_USER_PAGE_SIZE_OPTIONS,
  ADMIN_USER_SORT_FIELDS,
  ADMIN_USER_STATUS_VALUES,
  ASSIGNABLE_EMPLOYEE_ROLES,
} from "../constants/administration.constants";

const identifierSchema = z.string().trim().min(1).max(128);
export const adminUserStatusSchema = z.enum(ADMIN_USER_STATUS_VALUES);
export const adminUserSchema = z.object({
  id: identifierSchema,
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().min(1),
  role: z.enum(APP_ROLES),
  projectIds: z.array(identifierSchema).default([]),
  status: adminUserStatusSchema,
  lastLoginAt: z.string().nullable(),
  // Employee record — null for accounts created before these were collected.
  employeeId: z.string().nullable().default(null),
  department: z.string().nullable().default(null),
  reportingManagerId: z.string().nullable().default(null),
  reportingManagerName: z.string().nullable().default(null),
  mobile: z.string().nullable().default(null),
  joiningDate: z.string().nullable().default(null),
  avatarUrl: z.string().trim().nullable().default(null),
});
export const adminUsersSchema = z.array(adminUserSchema);
export const adminUserListParamsSchema = z.object({
  role: z
    .enum(APP_ROLES)
    .nullable()
    .default(ADMIN_USER_DEFAULT_LIST_PARAMS.role),
  status: adminUserStatusSchema
    .nullable()
    .default(ADMIN_USER_DEFAULT_LIST_PARAMS.status),
  search: z
    .string()
    .trim()
    .max(200)
    .default(ADMIN_USER_DEFAULT_LIST_PARAMS.search),
  page: z.number().int().positive().default(ADMIN_USER_DEFAULT_LIST_PARAMS.page),
  pageSize: z
    .number()
    .int()
    .refine((value) => ADMIN_USER_PAGE_SIZE_OPTIONS.includes(value))
    .default(ADMIN_USER_DEFAULT_LIST_PARAMS.pageSize),
  sortBy: z
    .enum(ADMIN_USER_SORT_FIELDS)
    .default(ADMIN_USER_DEFAULT_LIST_PARAMS.sortBy),
  sortDirection: z
    .enum(["asc", "desc"])
    .default(ADMIN_USER_DEFAULT_LIST_PARAMS.sortDirection),
});
export const adminUserListResultSchema = z.object({
  items: adminUsersSchema,
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});
export const createAdminUserInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  role: z.enum(ASSIGNABLE_EMPLOYEE_ROLES),
  projectIds: z.array(identifierSchema).default([]),
  department: z.string().trim().min(1, "Department is required").max(100),
  // Empty = no reporting manager (top of the reporting line).
  reportingManagerId: z.string().trim().max(128).default(""),
  mobile: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .regex(/^\+?[0-9][0-9\s\-()]{6,19}$/, "Enter a valid mobile number"),
  joiningDate: z.string().trim().min(1, "Joining date is required"),
});
export const createAdminUserResultSchema = z.object({
  user: adminUserSchema,
  temporaryPassword: z.string().min(1),
});

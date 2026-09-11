import { z } from "zod";

import { APP_ROLES } from "@/config/permissions";
import {
  ADMIN_USER_DEFAULT_LIST_PARAMS,
  ADMIN_USER_PAGE_SIZE_OPTIONS,
  ADMIN_USER_SORT_FIELDS,
  ADMIN_USER_STATUS_VALUES,
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

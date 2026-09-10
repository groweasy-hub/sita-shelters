import { sql } from "drizzle-orm";
import {
  check,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/**
 * Migration-only schema definition. Runtime queries intentionally use the raw
 * D1 prepared-statement API in `projects-repository.js`.
 */
export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    status: text("status").notNull(),
    projectManagerId: text("project_manager_id").notNull(),
    startDate: text("start_date").notNull(),
    estimatedCompletionDate: text("estimated_completion_date").notNull(),
    progressPercent: integer("progress_percent").notNull().default(0),
    description: text("description").notNull(),
    addressLine1: text("address_line_1").notNull(),
    addressLine2: text("address_line_2"),
    landmark: text("landmark"),
    city: text("city").notNull(),
    state: text("state").notNull(),
    postalCode: text("postal_code").notNull(),
    country: text("country").notNull().default("India"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("projects_code_unique").on(
      sql`${table.code} COLLATE NOCASE`,
    ),
    check(
      "projects_status_check",
      sql`${table.status} IN ('planning', 'active', 'on-hold', 'completed')`,
    ),
    check(
      "projects_progress_check",
      sql`${table.progressPercent} BETWEEN 0 AND 100`,
    ),
  ],
);

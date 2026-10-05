"use client";

import { useMemo } from "react";

import { ROLE_ACCESS_SCOPE } from "@/config/permissions";
import { useCurrentUser } from "./use-current-user";

/**
 * Shared by every operational list screen (Indents, Inventory, Inward, QC,
 * Material Issues, Consumption, Returns, Stock Transfers) so a
 * project-scoped role never has to filter a portfolio-wide table down to
 * their own site — construction-site accounts should land on exactly what
 * they need, not a bigger list they have to narrow themselves.
 *
 * - `scopeProjectIds`: `null` for workspace-wide roles (no restriction);
 *   otherwise the user's assigned project ids.
 * - `isLocked`: true when the user has exactly one project — screens should
 *   hide their project picker entirely and just show that project's data.
 * - `defaultProjectId`: the project a locked or first-load filter should
 *   default to (their first/only assigned project), or `null` when unscoped.
 */
export function useProjectScope() {
  const user = useCurrentUser();
  return useMemo(() => {
    if (!user) {
      return { scopeProjectIds: null, isLocked: false, defaultProjectId: null };
    }
    const isProjectScoped = ROLE_ACCESS_SCOPE[user.role] === "project";
    if (!isProjectScoped) {
      return { scopeProjectIds: null, isLocked: false, defaultProjectId: null };
    }
    return {
      scopeProjectIds: user.projectIds,
      isLocked: user.projectIds.length === 1,
      defaultProjectId: user.projectIds[0] ?? null,
    };
  }, [user]);
}

export function inProjectScope(scopeProjectIds, projectId) {
  return !scopeProjectIds || scopeProjectIds.includes(projectId);
}

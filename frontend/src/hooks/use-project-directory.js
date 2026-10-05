"use client";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { QUERY_DEFAULTS } from "@/config/constants";

/**
 * Lightweight, feature-agnostic live list of the projects the signed-in user
 * can work against — every project for workspace-wide roles, only assigned
 * ones for project-scoped roles (id/code/name/location/status only) — for
 * shared chrome: the header project switcher and the project filter used
 * across every operational list screen. Deliberately
 * does not import `@/features/projects` (shared components never depend on
 * a feature) and skips that feature's inventory-derived summary fields,
 * which nothing here needs.
 */
export function useProjectDirectory() {
  return useQuery({
    queryKey: ["project-directory"],
    queryFn: () => apiClient.get("/api/projects/mine"),
    staleTime: QUERY_DEFAULTS.staleTimeMs,
    initialData: [],
    // Without this, React Query treats the `[]` above as freshly fetched data
    // and never calls the API until it goes stale — so the list stays empty.
    initialDataUpdatedAt: 0,
  });
}

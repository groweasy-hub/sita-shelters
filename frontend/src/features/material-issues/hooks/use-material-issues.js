"use client";
import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { materialIssuesQueryKeys } from "../constants/material-issues.constants";
import { materialIssueListParamsSchema } from "../schemas/material-issues.schema";
import { materialIssuesService } from "../services/material-issues.service";

/** Reusable by client hooks today and by route-level prefetching in the future. */
export function materialIssuesListQueryOptions(params = {}) {
  const normalizedParams = materialIssueListParamsSchema.parse(params);
  return queryOptions({
    queryKey: materialIssuesQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) =>
      materialIssuesService.list(normalizedParams, { signal }),
    initialData: () => materialIssuesService.list(normalizedParams),
    placeholderData: keepPreviousData,
  });
}
export function useMaterialIssues(params = {}) {
  return useQuery(materialIssuesListQueryOptions(params));
}
/**
 * Cross-feature read model: every material issue, unpaginated. Used by the
 * Consumption and Returns features to resolve `materialIssueId` references
 * without duplicating issue data.
 */
export function useAllMaterialIssues() {
  return useQuery({
    queryKey: materialIssuesQueryKeys.all,
    queryFn: () => materialIssuesService.listAll(),
    initialData: () => materialIssuesService.listAll(),
    staleTime: Infinity,
  });
}

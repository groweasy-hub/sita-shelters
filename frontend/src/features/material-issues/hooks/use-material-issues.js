"use client";
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { inventoryQueryKeys } from "@/features/inventory";
import { materialIssuesQueryKeys } from "../constants/material-issues.constants";
import { materialIssueListParamsSchema } from "../schemas/material-issues.schema";
import {
  confirmIssueConsumption,
  listPendingConsumption,
} from "../services/material-issue-consumption.service";
import { materialIssuesService } from "../services/material-issues.service";

/** Reusable by client hooks today and by route-level prefetching in the future. */
export function materialIssuesListQueryOptions(params = {}) {
  const normalizedParams = materialIssueListParamsSchema.parse(params);
  return queryOptions({
    queryKey: materialIssuesQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) =>
      materialIssuesService.list(normalizedParams, { signal }),
    placeholderData: keepPreviousData,
  });
}
export function useMaterialIssues(params = {}) {
  return useQuery(materialIssuesListQueryOptions(params));
}
export function useMaterialIssue(issueId) {
  return useQuery({
    queryKey: materialIssuesQueryKeys.detail(issueId),
    queryFn: () => materialIssuesService.getById(issueId),
    enabled: Boolean(issueId),
  });
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
    staleTime: 60_000,
  });
}
export function useCreateMaterialIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => materialIssuesService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialIssuesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: materialIssuesQueryKeys.lists() });
      // A new issue is waiting for the Site Engineer / Project Manager's "Consumed".
      queryClient.invalidateQueries({ queryKey: ["consumption"] });
      // Issuing material deducts from the project's available site stock.
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.lists() });
    },
  });
}
/**
 * Issued material waiting for "Consumed". Polled so a Site Engineer or Project
 * Manager sees a new issue soon after the store raises it, and sees it clear
 * when the other of the two has marked it consumed.
 */
export function usePendingConsumption(options = {}) {
  return useQuery({
    enabled: options.enabled ?? true,
    queryKey: ["consumption", "pending"],
    queryFn: listPendingConsumption,
    staleTime: 10_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}
/**
 * "Mark consumed" on an issued material. The issue's running totals change and
 * a consumption entry appears, so both lists are refreshed (string key: the
 * consumption feature imports this one).
 */
export function useConfirmIssueConsumption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmIssueConsumption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialIssuesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: materialIssuesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["consumption"] });
    },
  });
}

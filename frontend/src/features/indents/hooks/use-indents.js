"use client";
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { materialsQueryKeys } from "@/features/materials/constants/materials.constants";
import { purchaseRequestsQueryKeys } from "@/features/procurement";
import { indentsQueryKeys } from "../constants/indents.constants";
import { indentListParamsSchema } from "../schemas/indents.schema";
import { indentsService } from "../services/indents.service";

/** Reusable by client hooks today and by route-level prefetching in the future. */
export function indentsListQueryOptions(params = {}) {
  const normalizedParams = indentListParamsSchema.parse(params);
  return queryOptions({
    queryKey: indentsQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) => indentsService.list(normalizedParams, { signal }),
    placeholderData: keepPreviousData,
  });
}
export function useIndents(params = {}) {
  return useQuery(indentsListQueryOptions(params));
}
export function useIndent(indentId) {
  return useQuery({
    queryKey: indentsQueryKeys.detail(indentId),
    queryFn: () => indentsService.get(indentId),
    enabled: Boolean(indentId),
  });
}
/** Every movement the indent has been through, end to end — see `getIndentTimeline` on the backend. */
export function useIndentTimeline(indentId) {
  return useQuery({
    queryKey: indentsQueryKeys.timeline(indentId),
    queryFn: () => indentsService.getTimeline(indentId),
    enabled: Boolean(indentId),
  });
}
/**
 * Cross-feature/global read model: every indent, unpaginated. Used for
 * dashboard-style KPI totals and for the stock-recommendation lookups that
 * need the full demand picture rather than the current table page.
 */
export function useAllIndents(options = {}) {
  return useQuery({
    enabled: options.enabled ?? true,
    queryKey: indentsQueryKeys.all,
    queryFn: () => indentsService.listAll(),
    staleTime: 60_000,
  });
}
export function useCreateIndent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => indentsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: indentsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: indentsQueryKeys.lists() });
      // An indent can add new items to the material catalogue.
      queryClient.invalidateQueries({ queryKey: materialsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: materialsQueryKeys.lists() });
    },
  });
}
/** Approves the indent and, in the same step, creates the procurement request it feeds into. */
export function useApproveIndent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (indentId) => indentsService.approve(indentId),
    onSuccess: (_data, indentId) => {
      queryClient.invalidateQueries({ queryKey: indentsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: indentsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: indentsQueryKeys.detail(indentId),
      });
      queryClient.invalidateQueries({
        queryKey: indentsQueryKeys.timeline(indentId),
      });
      queryClient.invalidateQueries({
        queryKey: purchaseRequestsQueryKeys.all,
      });
    },
  });
}

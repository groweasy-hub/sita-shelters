"use client";
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { materialIssuesQueryKeys } from "@/features/material-issues";
import { consumptionQueryKeys } from "../constants/consumption.constants";
import { consumptionListParamsSchema } from "../schemas/consumption.schema";
import { consumptionService } from "../services/consumption.service";

/** Reusable by client hooks today and by route-level prefetching in the future. */
export function consumptionListQueryOptions(params = {}) {
  const normalizedParams = consumptionListParamsSchema.parse(params);
  return queryOptions({
    queryKey: consumptionQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) =>
      consumptionService.list(normalizedParams, { signal }),
    placeholderData: keepPreviousData,
  });
}
export function useConsumption(params = {}) {
  return useQuery(consumptionListQueryOptions(params));
}
/** Cross-feature read model: every consumption entry, unpaginated. */
export function useAllConsumptionEntries() {
  return useQuery({
    queryKey: consumptionQueryKeys.all,
    queryFn: () => consumptionService.listAll(),
    staleTime: 60_000,
  });
}
export function useCreateConsumption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => consumptionService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consumptionQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: consumptionQueryKeys.lists() });
      // A logged consumption entry updates its parent issue's running totals.
      queryClient.invalidateQueries({ queryKey: materialIssuesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: materialIssuesQueryKeys.lists() });
    },
  });
}

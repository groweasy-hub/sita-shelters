"use client";
import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
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
    initialData: () => consumptionService.list(normalizedParams),
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
    initialData: () => consumptionService.listAll(),
    staleTime: Infinity,
  });
}

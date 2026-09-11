"use client";
import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { inwardQueryKeys } from "../constants/inward.constants";
import { inwardListParamsSchema } from "../schemas/inward.schema";
import { inwardService } from "../services/inward.service";

export function inwardListQueryOptions(params = {}) {
  const normalizedParams = inwardListParamsSchema.parse(params);
  return queryOptions({
    queryKey: inwardQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) => inwardService.list(normalizedParams, { signal }),
    initialData: () => inwardService.list(normalizedParams),
    placeholderData: keepPreviousData,
  });
}
export function useInward(params = {}) {
  return useQuery(inwardListQueryOptions(params));
}
export function useInwardRecord(inwardId) {
  return useQuery({
    queryKey: inwardQueryKeys.detail(inwardId),
    queryFn: () => inwardService.get(inwardId),
    enabled: Boolean(inwardId),
    initialData: () => inwardService.get(inwardId),
  });
}
/** Cross-feature/global read model used by KPI totals and QC linkage. */
export function useAllInwardRecords() {
  return useQuery({
    queryKey: inwardQueryKeys.all,
    queryFn: () => inwardService.listAll(),
    initialData: () => inwardService.listAll(),
    staleTime: Infinity,
  });
}

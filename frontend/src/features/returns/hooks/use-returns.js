"use client";
import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { returnsQueryKeys } from "../constants/returns.constants";
import { returnListParamsSchema } from "../schemas/returns.schema";
import { returnsService } from "../services/returns.service";

/** Reusable by client hooks today and by route-level prefetching in the future. */
export function returnsListQueryOptions(params = {}) {
  const normalizedParams = returnListParamsSchema.parse(params);
  return queryOptions({
    queryKey: returnsQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) => returnsService.list(normalizedParams, { signal }),
    initialData: () => returnsService.list(normalizedParams),
    placeholderData: keepPreviousData,
  });
}
export function useReturns(params = {}) {
  return useQuery(returnsListQueryOptions(params));
}
/** Cross-feature read model: every return record, unpaginated. */
export function useAllReturns() {
  return useQuery({
    queryKey: returnsQueryKeys.all,
    queryFn: () => returnsService.listAll(),
    initialData: () => returnsService.listAll(),
    staleTime: Infinity,
  });
}

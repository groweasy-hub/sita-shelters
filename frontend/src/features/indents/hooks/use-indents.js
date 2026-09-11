"use client";
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { indentsQueryKeys } from "../constants/indents.constants";
import { indentListParamsSchema } from "../schemas/indents.schema";
import { indentsService } from "../services/indents.service";

/** Reusable by client hooks today and by route-level prefetching in the future. */
export function indentsListQueryOptions(params = {}) {
  const normalizedParams = indentListParamsSchema.parse(params);
  return queryOptions({
    queryKey: indentsQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) => indentsService.list(normalizedParams, { signal }),
    initialData: () => indentsService.list(normalizedParams),
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
    initialData: () => indentsService.get(indentId),
  });
}
/**
 * Cross-feature/global read model: every indent, unpaginated. Used for
 * dashboard-style KPI totals and for the stock-recommendation lookups that
 * need the full demand picture rather than the current table page.
 */
export function useAllIndents() {
  return useQuery({
    queryKey: indentsQueryKeys.all,
    queryFn: () => indentsService.listAll(),
    initialData: () => indentsService.listAll(),
    staleTime: Infinity,
  });
}
/** Mock "Raise Indent" submission. No backend exists yet; resolves locally. */
export function useCreateIndent() {
  return useMutation({
    mutationFn: (payload) => indentsService.create(payload),
  });
}

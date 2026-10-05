"use client";
import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { resourcesQueryKeys } from "../constants/resources.constants";
import { resourceListParamsSchema } from "../schemas/resources.schema";
import { resourcesService } from "../services/resources.service";

/** Reusable by client hooks today and by route-level prefetching in the future. */
export function resourcesListQueryOptions(params = {}) {
  const normalizedParams = resourceListParamsSchema.parse(params);
  return queryOptions({
    queryKey: resourcesQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) =>
      resourcesService.list(normalizedParams, { signal }),
    initialData: () => resourcesService.list(normalizedParams),
    placeholderData: keepPreviousData,
  });
}
export function useResources(params = {}) {
  return useQuery(resourcesListQueryOptions(params));
}
export function useResource(resourceId) {
  return useQuery({
    queryKey: resourcesQueryKeys.detail(resourceId),
    queryFn: () => resourcesService.get(resourceId),
    enabled: Boolean(resourceId),
    initialData: () => resourcesService.get(resourceId),
  });
}
/** Cross-feature read model: every resource, unpaginated. */
export function useAllResources() {
  return useQuery({
    queryKey: resourcesQueryKeys.all,
    queryFn: () => resourcesService.listAll(),
    initialData: () => resourcesService.listAll(),
    staleTime: Infinity,
  });
}

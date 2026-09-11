"use client";
import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { inventoryQueryKeys } from "../constants/inventory.constants";
import { inventoryListParamsSchema } from "../schemas/inventory.schema";
import { inventoryService } from "../services/inventory.service";
/** Reusable by client hooks today and by route-level prefetching in the future. */
export function inventoryListQueryOptions(params = {}) {
  const normalizedParams = inventoryListParamsSchema.parse(params);
  return queryOptions({
    queryKey: inventoryQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) =>
      inventoryService.list(normalizedParams, { signal }),
    initialData: () => inventoryService.list(normalizedParams),
    placeholderData: keepPreviousData,
  });
}
export function useInventory(params = {}) {
  return useQuery(inventoryListQueryOptions(params));
}
/**
 * Cross-feature read model: every inventory row, unpaginated. Used by
 * material stock distribution, indent stock recommendations, transfer
 * candidate lookups and dashboard intelligence so those features never
 * re-implement inventory access.
 */
export function useAllInventoryItems() {
  return useQuery({
    queryKey: inventoryQueryKeys.all,
    queryFn: () => inventoryService.listAll(),
    initialData: () => inventoryService.listAll(),
    staleTime: Infinity,
  });
}

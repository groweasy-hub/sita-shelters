"use client";
import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import {
  INVENTORY_LIVE_REFETCH_MS,
  inventoryQueryKeys,
} from "../constants/inventory.constants";
import { inventoryListParamsSchema } from "../schemas/inventory.schema";
import { inventoryService } from "../services/inventory.service";
/** Reusable by client hooks today and by route-level prefetching in the future. */
export function inventoryListQueryOptions(params = {}) {
  const normalizedParams = inventoryListParamsSchema.parse(params);
  return queryOptions({
    queryKey: inventoryQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) =>
      inventoryService.list(normalizedParams, { signal }),
    placeholderData: keepPreviousData,
    refetchInterval: INVENTORY_LIVE_REFETCH_MS,
    refetchOnWindowFocus: true,
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
export function useAllInventoryItems(options = {}) {
  return useQuery({
    enabled: options.enabled ?? true,
    queryKey: inventoryQueryKeys.all,
    queryFn: () => inventoryService.listAll(),
    staleTime: 5_000,
    refetchInterval: INVENTORY_LIVE_REFETCH_MS,
    refetchOnWindowFocus: true,
  });
}

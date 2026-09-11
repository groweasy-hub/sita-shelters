"use client";
import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { stockTransfersQueryKeys } from "../constants/stock-transfers.constants";
import { transferListParamsSchema } from "../schemas/stock-transfers.schema";
import { stockTransfersService } from "../services/stock-transfers.service";

/** Reusable by client hooks today and by route-level prefetching in the future. */
export function stockTransfersListQueryOptions(params = {}) {
  const normalizedParams = transferListParamsSchema.parse(params);
  return queryOptions({
    queryKey: stockTransfersQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) =>
      stockTransfersService.list(normalizedParams, { signal }),
    initialData: () => stockTransfersService.list(normalizedParams),
    placeholderData: keepPreviousData,
  });
}
export function useStockTransfers(params = {}) {
  return useQuery(stockTransfersListQueryOptions(params));
}
export function useStockTransfer(transferId) {
  return useQuery({
    queryKey: stockTransfersQueryKeys.detail(transferId),
    queryFn: () => stockTransfersService.get(transferId),
    enabled: Boolean(transferId),
    initialData: () => stockTransfersService.get(transferId),
  });
}
/** Cross-feature read model: every transfer, unpaginated. */
export function useAllStockTransfers() {
  return useQuery({
    queryKey: stockTransfersQueryKeys.all,
    queryFn: () => stockTransfersService.listAll(),
    initialData: () => stockTransfersService.listAll(),
    staleTime: Infinity,
  });
}

"use client";
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
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
  });
}
/** Cross-feature read model: every transfer, unpaginated. */
export function useAllStockTransfers(options = {}) {
  return useQuery({
    enabled: options.enabled ?? true,
    queryKey: stockTransfersQueryKeys.all,
    queryFn: () => stockTransfersService.listAll(),
    staleTime: 60_000,
  });
}
function useInvalidateStockTransfers() {
  const queryClient = useQueryClient();
  return (transferId, { touchesStock = false } = {}) => {
    queryClient.invalidateQueries({ queryKey: stockTransfersQueryKeys.all });
    queryClient.invalidateQueries({
      queryKey: stockTransfersQueryKeys.lists(),
    });
    if (transferId) {
      queryClient.invalidateQueries({
        queryKey: stockTransfersQueryKeys.detail(transferId),
      });
    }
    // Dispatch and Receive are the two steps that actually move stock.
    if (touchesStock) {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    }
  };
}
export function useCreateStockTransfer() {
  const invalidate = useInvalidateStockTransfers();
  return useMutation({
    mutationFn: (input) => stockTransfersService.create(input),
    onSuccess: () => invalidate(),
  });
}
export function useApproveStockTransfer() {
  const invalidate = useInvalidateStockTransfers();
  return useMutation({
    mutationFn: ({ transferId }) => stockTransfersService.approve(transferId),
    onSuccess: (_data, variables) => invalidate(variables.transferId),
  });
}
export function useRejectStockTransfer() {
  const invalidate = useInvalidateStockTransfers();
  return useMutation({
    mutationFn: ({ transferId, ...input }) =>
      stockTransfersService.reject(transferId, input),
    onSuccess: (_data, variables) => invalidate(variables.transferId),
  });
}
export function useMarkTransferReadyForDispatch() {
  const invalidate = useInvalidateStockTransfers();
  return useMutation({
    mutationFn: ({ transferId }) =>
      stockTransfersService.markReadyForDispatch(transferId),
    onSuccess: (_data, variables) => invalidate(variables.transferId),
  });
}
export function useDispatchStockTransfer() {
  const invalidate = useInvalidateStockTransfers();
  return useMutation({
    mutationFn: ({ transferId, ...input }) =>
      stockTransfersService.dispatch(transferId, input),
    onSuccess: (_data, variables) =>
      invalidate(variables.transferId, { touchesStock: true }),
  });
}
export function useMarkTransferInTransit() {
  const invalidate = useInvalidateStockTransfers();
  return useMutation({
    mutationFn: ({ transferId }) =>
      stockTransfersService.markInTransit(transferId),
    onSuccess: (_data, variables) => invalidate(variables.transferId),
  });
}
export function useReceiveStockTransfer() {
  const invalidate = useInvalidateStockTransfers();
  return useMutation({
    mutationFn: ({ transferId }) => stockTransfersService.receive(transferId),
    onSuccess: (_data, variables) =>
      invalidate(variables.transferId, { touchesStock: true }),
  });
}

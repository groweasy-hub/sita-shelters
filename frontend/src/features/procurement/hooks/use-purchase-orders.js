"use client";
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { purchaseOrdersQueryKeys } from "../constants/procurement.constants";
import { purchaseOrderListParamsSchema } from "../schemas/procurement.schema";
import { purchaseOrdersService } from "../services/purchase-orders.service";

export function purchaseOrdersListQueryOptions(params = {}) {
  const normalizedParams = purchaseOrderListParamsSchema.parse(params);
  return queryOptions({
    queryKey: purchaseOrdersQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) =>
      purchaseOrdersService.list(normalizedParams, { signal }),
    placeholderData: keepPreviousData,
  });
}
export function usePurchaseOrders(params = {}) {
  return useQuery(purchaseOrdersListQueryOptions(params));
}
export function usePurchaseOrder(poId) {
  return useQuery({
    queryKey: purchaseOrdersQueryKeys.detail(poId),
    queryFn: () => purchaseOrdersService.get(poId),
    enabled: Boolean(poId),
  });
}
/** Cross-feature/global read model used by procurement's own KPI totals. */
export function useAllPurchaseOrders(options = {}) {
  return useQuery({
    enabled: options.enabled ?? true,
    queryKey: purchaseOrdersQueryKeys.all,
    queryFn: () => purchaseOrdersService.listAll(),
    staleTime: 60_000,
  });
}
/**
 * Public cross-feature read model. The indents feature's detail page may use
 * this, when available, to resolve the purchase order(s) raised against an
 * indent instead of only showing a static badge.
 */
export function usePurchaseOrdersForIndent(indentId) {
  return useQuery({
    queryKey: purchaseOrdersQueryKeys.byIndent(indentId),
    queryFn: () => purchaseOrdersService.listByIndent(indentId),
    enabled: Boolean(indentId),
  });
}
function useInvalidatePurchaseOrders() {
  const queryClient = useQueryClient();
  return (poId) => {
    queryClient.invalidateQueries({ queryKey: purchaseOrdersQueryKeys.all });
    queryClient.invalidateQueries({
      queryKey: purchaseOrdersQueryKeys.lists(),
    });
    if (poId) {
      queryClient.invalidateQueries({
        queryKey: purchaseOrdersQueryKeys.detail(poId),
      });
    }
  };
}
export function useCreatePurchaseOrder() {
  const invalidate = useInvalidatePurchaseOrders();
  return useMutation({
    mutationFn: (input) => purchaseOrdersService.create(input),
    onSuccess: () => invalidate(),
  });
}
export function useApprovePurchaseOrder() {
  const invalidate = useInvalidatePurchaseOrders();
  return useMutation({
    mutationFn: ({ poId, ...input }) =>
      purchaseOrdersService.approve(poId, input),
    onSuccess: (_data, variables) => invalidate(variables.poId),
  });
}
export function useRejectPurchaseOrder() {
  const invalidate = useInvalidatePurchaseOrders();
  return useMutation({
    mutationFn: ({ poId, ...input }) =>
      purchaseOrdersService.reject(poId, input),
    onSuccess: (_data, variables) => invalidate(variables.poId),
  });
}
export function useSendBackPurchaseOrder() {
  const invalidate = useInvalidatePurchaseOrders();
  return useMutation({
    mutationFn: ({ poId, ...input }) =>
      purchaseOrdersService.sendBack(poId, input),
    onSuccess: (_data, variables) => invalidate(variables.poId),
  });
}
export function useReleasePurchaseOrder() {
  const invalidate = useInvalidatePurchaseOrders();
  return useMutation({
    mutationFn: ({ poId, ...input }) =>
      purchaseOrdersService.release(poId, input),
    onSuccess: (_data, variables) => invalidate(variables.poId),
  });
}

"use client";
import {
  keepPreviousData,
  queryOptions,
  useQuery,
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
    initialData: () => purchaseOrdersService.list(normalizedParams),
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
    initialData: () => purchaseOrdersService.get(poId),
  });
}
/** Cross-feature/global read model used by procurement's own KPI totals. */
export function useAllPurchaseOrders() {
  return useQuery({
    queryKey: purchaseOrdersQueryKeys.all,
    queryFn: () => purchaseOrdersService.listAll(),
    initialData: () => purchaseOrdersService.listAll(),
    staleTime: Infinity,
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
    initialData: () => purchaseOrdersService.listByIndent(indentId),
  });
}

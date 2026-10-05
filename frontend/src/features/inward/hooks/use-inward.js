"use client";
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { inwardQueryKeys } from "../constants/inward.constants";
import { inwardListParamsSchema } from "../schemas/inward.schema";
import { inwardService } from "../services/inward.service";

export function inwardListQueryOptions(params = {}) {
  const normalizedParams = inwardListParamsSchema.parse(params);
  return queryOptions({
    queryKey: inwardQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) => inwardService.list(normalizedParams, { signal }),
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
  });
}
/** Cross-feature/global read model used by KPI totals and QC linkage. */
export function useAllInwardRecords(options = {}) {
  return useQuery({
    enabled: options.enabled ?? true,
    queryKey: inwardQueryKeys.all,
    queryFn: () => inwardService.listAll(),
    staleTime: 60_000,
  });
}
export function useInwardRecordsForPurchaseOrder(purchaseOrderId) {
  return useQuery({
    queryKey: inwardQueryKeys.byPurchaseOrder(purchaseOrderId),
    queryFn: () => inwardService.listByPurchaseOrder(purchaseOrderId),
    enabled: Boolean(purchaseOrderId),
  });
}
export function useCreateInwardRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => inwardService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inwardQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: inwardQueryKeys.lists() });
    },
  });
}
/**
 * A GRN workflow step. The Project Manager's approval posts stock and moves
 * the purchase order's delivered quantity; the store manager's confirmation
 * makes it available — so inventory and PO queries are refreshed too.
 */
export function useInwardWorkflowStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ inwardId, step, remarks }) =>
      inwardService.step(inwardId, step, { remarks }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: inwardQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: inwardQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: inwardQueryKeys.detail(variables.inwardId),
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["procurement", "purchase-orders"] });
    },
  });
}

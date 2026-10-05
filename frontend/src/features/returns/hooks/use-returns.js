"use client";
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { inventoryQueryKeys } from "@/features/inventory";
import { consumptionQueryKeys } from "@/features/consumption";
import { materialIssuesQueryKeys } from "@/features/material-issues";
import { returnsQueryKeys } from "../constants/returns.constants";
import { returnListParamsSchema } from "../schemas/returns.schema";
import { returnsService } from "../services/returns.service";

/** Reusable by client hooks today and by route-level prefetching in the future. */
export function returnsListQueryOptions(params = {}) {
  const normalizedParams = returnListParamsSchema.parse(params);
  return queryOptions({
    queryKey: returnsQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) => returnsService.list(normalizedParams, { signal }),
    placeholderData: keepPreviousData,
  });
}
export function useReturns(params = {}) {
  return useQuery(returnsListQueryOptions(params));
}
/** Cross-feature read model: every return record, unpaginated. */
export function useAllReturns(options = {}) {
  return useQuery({
    enabled: options.enabled ?? true,
    queryKey: returnsQueryKeys.all,
    queryFn: () => returnsService.listAll(),
    staleTime: 60_000,
  });
}
/** Rejected deliveries going back to the vendor (from QC), with replacement status. */
export function useVendorReturns() {
  return useQuery({
    queryKey: returnsQueryKeys.vendor(),
    queryFn: () => returnsService.listVendor(),
  });
}
export function useReturn(returnId) {
  return useQuery({
    queryKey: returnsQueryKeys.detail(returnId),
    queryFn: () => returnsService.get(returnId),
    enabled: Boolean(returnId),
  });
}
function useInvalidateReturns() {
  const queryClient = useQueryClient();
  return (returnId) => {
    queryClient.invalidateQueries({ queryKey: returnsQueryKeys.all });
    queryClient.invalidateQueries({ queryKey: returnsQueryKeys.lists() });
    if (returnId) {
      queryClient.invalidateQueries({
        queryKey: returnsQueryKeys.detail(returnId),
      });
    }
  };
}
export function useCreateReturn() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateReturns();
  return useMutation({
    mutationFn: (input) => returnsService.create(input),
    onSuccess: () => {
      invalidate();
      // A logged return updates its parent issue's running totals.
      queryClient.invalidateQueries({ queryKey: materialIssuesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: materialIssuesQueryKeys.lists() });
      // Consumption rows show the returns logged against their issue.
      queryClient.invalidateQueries({ queryKey: consumptionQueryKeys.all });
    },
  });
}
export function useInspectReturn() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateReturns();
  return useMutation({
    mutationFn: ({ returnId, ...input }) =>
      returnsService.inspect(returnId, input),
    onSuccess: (_data, variables) => {
      invalidate(variables.returnId);
      // Accepted (good) quantity moves back into site stock.
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.lists() });
    },
  });
}
export function useResolveReturn() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateReturns();
  return useMutation({
    mutationFn: ({ returnId, ...input }) =>
      returnsService.resolve(returnId, input),
    onSuccess: (_data, variables) => {
      invalidate(variables.returnId);
      // A replacement adds stock, and consumption rows show replaced quantity.
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: consumptionQueryKeys.all });
    },
  });
}
/** "Items replaced": a delivery of replacement material, added to site stock with its RPL id. */
export function useReceiveReturnReplacement() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateReturns();
  return useMutation({
    mutationFn: ({ returnId, ...input }) =>
      returnsService.receiveReplacement(returnId, input),
    onSuccess: (_data, variables) => {
      invalidate(variables.returnId);
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: consumptionQueryKeys.all });
    },
  });
}
/** "Refund completed": the money for a refund settlement has come back. */
export function useCompleteReturnRefund() {
  const invalidate = useInvalidateReturns();
  return useMutation({
    mutationFn: ({ returnId, ...input }) =>
      returnsService.completeRefund(returnId, input),
    onSuccess: (_data, variables) => invalidate(variables.returnId),
  });
}

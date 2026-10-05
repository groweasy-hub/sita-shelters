"use client";
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { qualityControlQueryKeys } from "../constants/quality-control.constants";
import { qcListParamsSchema } from "../schemas/quality-control.schema";
import { qualityControlService } from "../services/quality-control.service";

export function qualityControlListQueryOptions(params = {}) {
  const normalizedParams = qcListParamsSchema.parse(params);
  return queryOptions({
    queryKey: qualityControlQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) =>
      qualityControlService.list(normalizedParams, { signal }),
    placeholderData: keepPreviousData,
  });
}
export function useQualityControlInspections(params = {}) {
  return useQuery(qualityControlListQueryOptions(params));
}
export function useQualityControlInspection(qcId) {
  return useQuery({
    queryKey: qualityControlQueryKeys.detail(qcId),
    queryFn: () => qualityControlService.get(qcId),
    enabled: Boolean(qcId),
  });
}
/** Cross-feature/global read model used by KPI totals. */
export function useAllQualityControlInspections(options = {}) {
  return useQuery({
    enabled: options.enabled ?? true,
    queryKey: qualityControlQueryKeys.all,
    queryFn: () => qualityControlService.listAll(),
    staleTime: 60_000,
  });
}
/**
 * Public cross-feature read model. The inward feature's detail page uses
 * this to resolve the QC record(s) raised against a GRN instead of only
 * linking to the QC list.
 */
export function useQualityControlInspectionsForInward(inwardId) {
  return useQuery({
    queryKey: qualityControlQueryKeys.byInward(inwardId),
    queryFn: () => qualityControlService.listByInward(inwardId),
    enabled: Boolean(inwardId),
  });
}
/**
 * Accepting here posts stock and can roll the sourcing PO's delivery status
 * forward, and flips the parent GRN's status — so a successful inspect
 * invalidates inventory, purchase-order and inward queries too, not just
 * its own.
 */
export function useInspectQualityControlRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ qcId, ...input }) =>
      qualityControlService.inspect(qcId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: qualityControlQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: qualityControlQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: qualityControlQueryKeys.detail(variables.qcId),
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inward"] });
      queryClient.invalidateQueries({
        queryKey: ["procurement", "purchase-orders"],
      });
    },
  });
}
export function useResolveQualityControlRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ qcId, ...input }) =>
      qualityControlService.resolve(qcId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: qualityControlQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: qualityControlQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: qualityControlQueryKeys.detail(variables.qcId),
      });
      // Vendor returns on the Returns page.
      queryClient.invalidateQueries({ queryKey: ["returns"] });
    },
  });
}
/** "Items replaced": a delivery of replacement material, added to site stock with its RPL id. */
export function useReceiveQualityControlReplacement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ qcId, ...input }) =>
      qualityControlService.receiveReplacement(qcId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: qualityControlQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: qualityControlQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: qualityControlQueryKeys.detail(variables.qcId),
      });
      // Vendor returns on the Returns page, and the stock the delivery adds.
      queryClient.invalidateQueries({ queryKey: ["returns"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}
/** "Refund completed": the vendor's refund for a rejected delivery has come back. */
export function useCompleteQualityControlRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ qcId, ...input }) =>
      qualityControlService.completeRefund(qcId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: qualityControlQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: qualityControlQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: qualityControlQueryKeys.detail(variables.qcId),
      });
      queryClient.invalidateQueries({ queryKey: ["returns"] });
    },
  });
}

"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { quotationsQueryKeys } from "../constants/procurement.constants";
import { quotationsService } from "../services/quotations.service";

export function useAllQuotations() {
  return useQuery({
    queryKey: quotationsQueryKeys.all,
    queryFn: () => quotationsService.listAll(),
    staleTime: 60_000,
  });
}
export function useQuotationsForPurchaseRequest(purchaseRequestId) {
  return useQuery({
    queryKey: quotationsQueryKeys.byPurchaseRequest(purchaseRequestId),
    queryFn: () => quotationsService.listByPurchaseRequest(purchaseRequestId),
    enabled: Boolean(purchaseRequestId),
  });
}
export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => quotationsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationsQueryKeys.all });
    },
  });
}
export function useSelectQuotationLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quotationId) => quotationsService.selectLine(quotationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationsQueryKeys.all });
    },
  });
}
export function useDeselectQuotationLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quotationId) => quotationsService.deselectLine(quotationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationsQueryKeys.all });
    },
  });
}

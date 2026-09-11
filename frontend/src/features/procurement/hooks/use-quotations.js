"use client";
import { useQuery } from "@tanstack/react-query";
import { quotationsQueryKeys } from "../constants/procurement.constants";
import { quotationsService } from "../services/quotations.service";

export function useAllQuotations() {
  return useQuery({
    queryKey: quotationsQueryKeys.all,
    queryFn: () => quotationsService.listAll(),
    initialData: () => quotationsService.listAll(),
    staleTime: Infinity,
  });
}
export function useQuotationsForPurchaseRequest(purchaseRequestId) {
  return useQuery({
    queryKey: quotationsQueryKeys.byPurchaseRequest(purchaseRequestId),
    queryFn: () => quotationsService.listByPurchaseRequest(purchaseRequestId),
    enabled: Boolean(purchaseRequestId),
    initialData: () =>
      quotationsService.listByPurchaseRequest(purchaseRequestId),
  });
}

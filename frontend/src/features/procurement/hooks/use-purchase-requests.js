"use client";
import { useQuery } from "@tanstack/react-query";
import { purchaseRequestsQueryKeys } from "../constants/procurement.constants";
import { purchaseRequestsService } from "../services/purchase-requests.service";

export function useAllPurchaseRequests() {
  return useQuery({
    queryKey: purchaseRequestsQueryKeys.all,
    queryFn: () => purchaseRequestsService.listAll(),
    staleTime: 60_000,
  });
}
export function usePurchaseRequest(purchaseRequestId) {
  return useQuery({
    queryKey: purchaseRequestsQueryKeys.detail(purchaseRequestId),
    queryFn: () => purchaseRequestsService.get(purchaseRequestId),
    enabled: Boolean(purchaseRequestId),
  });
}

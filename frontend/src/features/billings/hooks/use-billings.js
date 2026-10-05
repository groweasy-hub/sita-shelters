"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { billingsService } from "../services/billings.service";

export const billingsQueryKeys = {
  all: ["billings"],
};

export function useBillings() {
  return useQuery({
    queryKey: billingsQueryKeys.all,
    queryFn: () => billingsService.listAll(),
    staleTime: 60_000,
  });
}

export function useUpdateBillingCharges() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, input }) =>
      billingsService.updateCharges(invoiceId, input),
    onSuccess(records) {
      queryClient.setQueryData(billingsQueryKeys.all, records);
      queryClient.invalidateQueries({ queryKey: billingsQueryKeys.all });
    },
  });
}

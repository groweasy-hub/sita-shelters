"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryQueryKeys } from "../constants/inventory.constants";
import { recordStockUsage } from "../services/inventory-usage.service";

/**
 * "Record usage" from site stock. Stock drops and the ledger gains an entry,
 * and the usage shows up as a material issue and a consumption entry — so all
 * of those are refreshed. (String keys: those features import this one.)
 */
export function useRecordStockUsage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordStockUsage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["consumption"] });
      queryClient.invalidateQueries({ queryKey: ["material-issues"] });
    },
  });
}

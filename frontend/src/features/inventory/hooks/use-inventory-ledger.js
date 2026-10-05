"use client";
import { useQuery } from "@tanstack/react-query";
import { INVENTORY_LIVE_REFETCH_MS } from "../constants/inventory.constants";
import {
  getSiteStockRegister,
  listInventoryLedger,
} from "../services/inventory-ledger.service";

export function useInventoryLedger() {
  return useQuery({
    queryKey: ["inventory", "ledger"],
    queryFn: () => listInventoryLedger(),
    staleTime: 5_000,
    refetchInterval: INVENTORY_LIVE_REFETCH_MS,
    refetchOnWindowFocus: true,
  });
}
export function useSiteStockRegister(projectId) {
  return useQuery({
    queryKey: ["inventory", "site-stock-register", projectId ?? null],
    queryFn: () => getSiteStockRegister(projectId),
    staleTime: 5_000,
    refetchInterval: INVENTORY_LIVE_REFETCH_MS,
    refetchOnWindowFocus: true,
  });
}

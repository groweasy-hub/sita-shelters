"use client";
import { useQuery } from "@tanstack/react-query";
import { listInventoryLedger } from "../services/inventory-ledger.service";

export function useInventoryLedger() {
  return useQuery({
    queryKey: ["inventory", "ledger"],
    queryFn: () => listInventoryLedger(),
    initialData: () => listInventoryLedger(),
    staleTime: Infinity,
  });
}

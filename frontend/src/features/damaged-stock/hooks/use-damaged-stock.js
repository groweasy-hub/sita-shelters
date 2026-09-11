"use client";
import { useQuery } from "@tanstack/react-query";
import { damagedStockQueryKeys } from "../constants/damaged-stock.constants";
import { damagedStockService } from "../services/damaged-stock.service";

export function useDamagedStockRecords() {
  return useQuery({
    queryKey: damagedStockQueryKeys.list(),
    queryFn: () => damagedStockService.listAll(),
    staleTime: Infinity,
  });
}

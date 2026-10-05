"use client";
import { useQuery } from "@tanstack/react-query";
import { resourceMaintenanceQueryKeys } from "../constants/resources.constants";
import { listResourceMaintenanceRecords } from "../services/resource-maintenance.service";

/** Cross-resource maintenance log, used by the maintenance screen and resource detail tabs. */
export function useResourceMaintenance() {
  return useQuery({
    queryKey: resourceMaintenanceQueryKeys.all,
    queryFn: () => listResourceMaintenanceRecords(),
    initialData: () => listResourceMaintenanceRecords(),
    staleTime: Infinity,
  });
}

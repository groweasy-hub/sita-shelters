"use client";
import { useQuery } from "@tanstack/react-query";
import { resourceAssignmentsQueryKeys } from "../constants/resources.constants";
import { listResourceAssignments } from "../services/resource-assignments.service";

/** Cross-resource assignment log, used by the assignments screen and resource detail tabs. */
export function useResourceAssignments() {
  return useQuery({
    queryKey: resourceAssignmentsQueryKeys.all,
    queryFn: () => listResourceAssignments(),
    initialData: () => listResourceAssignments(),
    staleTime: Infinity,
  });
}

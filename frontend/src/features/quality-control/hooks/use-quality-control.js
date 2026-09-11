"use client";
import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { qualityControlQueryKeys } from "../constants/quality-control.constants";
import { qcListParamsSchema } from "../schemas/quality-control.schema";
import { qualityControlService } from "../services/quality-control.service";

export function qualityControlListQueryOptions(params = {}) {
  const normalizedParams = qcListParamsSchema.parse(params);
  return queryOptions({
    queryKey: qualityControlQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) =>
      qualityControlService.list(normalizedParams, { signal }),
    initialData: () => qualityControlService.list(normalizedParams),
    placeholderData: keepPreviousData,
  });
}
export function useQualityControlInspections(params = {}) {
  return useQuery(qualityControlListQueryOptions(params));
}
export function useQualityControlInspection(qcId) {
  return useQuery({
    queryKey: qualityControlQueryKeys.detail(qcId),
    queryFn: () => qualityControlService.get(qcId),
    enabled: Boolean(qcId),
    initialData: () => qualityControlService.get(qcId),
  });
}
/** Cross-feature/global read model used by KPI totals. */
export function useAllQualityControlInspections() {
  return useQuery({
    queryKey: qualityControlQueryKeys.all,
    queryFn: () => qualityControlService.listAll(),
    initialData: () => qualityControlService.listAll(),
    staleTime: Infinity,
  });
}
/**
 * Public cross-feature read model. The inward feature's detail page uses
 * this to resolve the QC record(s) raised against a GRN instead of only
 * linking to the QC list.
 */
export function useQualityControlInspectionsForInward(inwardId) {
  return useQuery({
    queryKey: qualityControlQueryKeys.byInward(inwardId),
    queryFn: () => qualityControlService.listByInward(inwardId),
    enabled: Boolean(inwardId),
    initialData: () => qualityControlService.listByInward(inwardId),
  });
}

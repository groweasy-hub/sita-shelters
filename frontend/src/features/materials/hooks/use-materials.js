"use client";
import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { materialsQueryKeys } from "../constants/materials.constants";
import { materialListParamsSchema } from "../schemas/materials.schema";
import { materialsService } from "../services/materials.service";

export function materialsListQueryOptions(params = {}) {
  const normalizedParams = materialListParamsSchema.parse(params);
  return queryOptions({
    queryKey: materialsQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) =>
      materialsService.list(normalizedParams, { signal }),
    initialData: () => materialsService.list(normalizedParams),
    placeholderData: keepPreviousData,
  });
}
export function useMaterials(params = {}) {
  return useQuery(materialsListQueryOptions(params));
}
export function useMaterial(materialId) {
  return useQuery({
    queryKey: materialsQueryKeys.detail(materialId),
    queryFn: () => materialsService.get(materialId),
    enabled: Boolean(materialId),
    initialData: () => materialsService.get(materialId),
  });
}
export function useAllMaterials() {
  return useQuery({
    queryKey: materialsQueryKeys.all,
    queryFn: () => materialsService.listAll(),
    initialData: () => materialsService.listAll(),
    staleTime: Infinity,
  });
}

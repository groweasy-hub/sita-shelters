"use client";
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
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
  });
}
/** Approved vendors plus every vendor this material has actually been ordered from. */
export function useMaterialVendors(materialId) {
  return useQuery({
    queryKey: [...materialsQueryKeys.detail(materialId), "vendors"],
    queryFn: () => materialsService.listVendors(materialId),
    enabled: Boolean(materialId),
  });
}
export function useAllMaterials() {
  return useQuery({
    queryKey: materialsQueryKeys.all,
    queryFn: () => materialsService.listAll(),
    staleTime: Infinity,
  });
}
export function useUpdateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ materialId, ...input }) =>
      materialsService.update(materialId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: materialsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: materialsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: materialsQueryKeys.detail(variables.materialId),
      });
    },
  });
}

"use client";
import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { vendorsQueryKeys } from "../constants/vendors.constants";
import { vendorListParamsSchema } from "../schemas/vendors.schema";
import { vendorsService } from "../services/vendors.service";

export function vendorsListQueryOptions(params = {}) {
  const normalizedParams = vendorListParamsSchema.parse(params);
  return queryOptions({
    queryKey: vendorsQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) => vendorsService.list(normalizedParams, { signal }),
    initialData: () => vendorsService.list(normalizedParams),
    placeholderData: keepPreviousData,
  });
}
export function useVendors(params = {}) {
  return useQuery(vendorsListQueryOptions(params));
}
export function useVendor(vendorId) {
  return useQuery({
    queryKey: vendorsQueryKeys.detail(vendorId),
    queryFn: () => vendorsService.get(vendorId),
    enabled: Boolean(vendorId),
    initialData: () => vendorsService.get(vendorId),
  });
}
export function useAllVendors() {
  return useQuery({
    queryKey: vendorsQueryKeys.all,
    queryFn: () => vendorsService.listAll(),
    initialData: () => vendorsService.listAll(),
    staleTime: Infinity,
  });
}

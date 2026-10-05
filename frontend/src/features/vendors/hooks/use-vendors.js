"use client";
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { vendorsQueryKeys } from "../constants/vendors.constants";
import { vendorListParamsSchema } from "../schemas/vendors.schema";
import { vendorsService } from "../services/vendors.service";

export function vendorsListQueryOptions(params = {}) {
  const normalizedParams = vendorListParamsSchema.parse(params);
  return queryOptions({
    queryKey: vendorsQueryKeys.list(normalizedParams),
    queryFn: ({ signal }) => vendorsService.list(normalizedParams, { signal }),
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
  });
}
export function useAllVendors() {
  return useQuery({
    queryKey: vendorsQueryKeys.all,
    queryFn: () => vendorsService.listAll(),
    staleTime: Infinity,
  });
}
export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => vendorsService.create(input),
    onSuccess: (vendor) => {
      // Add it to the cached roster straight away: a dropdown that's handed an
      // id it doesn't list yet resets its value, so callers that select the
      // new vendor immediately would otherwise lose the selection.
      queryClient.setQueryData(vendorsQueryKeys.all, (vendors = []) => [
        ...vendors.filter((candidate) => candidate.id !== vendor.id),
        vendor,
      ]);
      queryClient.invalidateQueries({ queryKey: vendorsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: vendorsQueryKeys.lists() });
    },
  });
}

/** Replaces which material categories a vendor supplies. */
export function useUpdateVendorCapabilities() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, materialCategories }) =>
      vendorsService.updateCapabilities(vendorId, { materialCategories }),
    onSuccess: (vendor) => {
      queryClient.setQueryData(vendorsQueryKeys.detail(vendor.id), vendor);
      queryClient.invalidateQueries({ queryKey: vendorsQueryKeys.all });
    },
  });
}

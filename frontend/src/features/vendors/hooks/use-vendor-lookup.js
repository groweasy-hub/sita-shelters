"use client";

import { useMemo } from "react";

import { getVendorById as getDemoVendorById } from "@/lib/mock-data/vendors";
import { useAllVendors } from "./use-vendors";

/**
 * Resolves vendor ids to real vendor records. Everything that shows or acts on
 * a vendor (purchase orders, goods inward, quotations, reports) must go
 * through this rather than the built-in demo list, or a vendor you add
 * yourself can't be used. Falls back to the demo names only for roles that
 * can't read the vendor list.
 */
export function useVendorLookup() {
  const { data: vendors, isPending } = useAllVendors();
  return useMemo(() => {
    const byId = new Map((vendors ?? []).map((vendor) => [vendor.id, vendor]));
    const getVendor = (vendorId) =>
      byId.get(vendorId) ?? getDemoVendorById(vendorId) ?? null;
    return {
      getVendor,
      getName: (vendorId) => getVendor(vendorId)?.name ?? vendorId,
      vendors: vendors ?? [],
      isPending,
    };
  }, [vendors, isPending]);
}

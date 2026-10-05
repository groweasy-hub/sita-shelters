"use client";

import { useVendorLookup } from "../hooks/use-vendor-lookup";

/** A vendor's name from its id — for table cells and inline text. */
export function VendorName({ vendorId }) {
  const { getName } = useVendorLookup();
  return getName(vendorId);
}

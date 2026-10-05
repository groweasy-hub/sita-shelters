"use client";

import styled from "styled-components";

import { PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { formatCompactNumber } from "@/lib/formatters";
import { useVendorReturns } from "../hooks/use-returns";
import { VendorReturnsPanel } from "./vendor-returns-panel";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;

/**
 * Material rejected at goods inward and sent back to the vendor, with the
 * replacement or refund that settles each one. Opening a row shows its full
 * detail, where replacement deliveries and refund receipt are recorded.
 */
export function ReturnsScreen() {
  const { data: vendorReturns = [] } = useVendorReturns();
  return (
    <Root>
      <PageHeader
        description="Material rejected at goods inward and sent back to the vendor — whether it is being replaced or refunded, and how much has come back."
        eyebrow="Site operations"
        meta={
          <Badge variant="outline">
            {formatCompactNumber(vendorReturns.length)} returns
          </Badge>
        }
        title="Returns & Replacements"
      />
      <VendorReturnsPanel />
    </Root>
  );
}

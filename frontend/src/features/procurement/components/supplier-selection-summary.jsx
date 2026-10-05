"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PackageCheck, ShoppingCart } from "lucide-react";
import styled from "styled-components";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { getMaterialByCode } from "@/lib/mock-data/materials";
import { useVendorLookup } from "@/features/vendors";

const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const PanelHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.875rem;
  font-weight: 650;
`;
const Grid = styled.div`
  display: grid;
  gap: 1px;
  background: ${({ theme }) => theme.colors.border};
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
`;
const SupplierGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background: ${({ theme }) => theme.colors.card};
`;
const SupplierName = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 650;
`;
const ItemList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-size: 0.8125rem;
`;
const ItemRow = styled.li`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
`;
const ItemName = styled.span`
  color: ${({ theme }) => theme.colors.foreground};
`;

/**
 * Groups the request's `selected` quotation lines supplier-wise (spec §12):
 * different items on one indent may go to different suppliers, and each
 * supplier group becomes a separate PO candidate ("PO Ready", spec §13).
 */
export function SupplierSelectionSummary({
  canCreatePo = false,
  materials = [],
  purchaseOrders = [],
  purchaseRequestId,
  quotes = [],
}) {
  const { getVendor } = useVendorLookup();
  const groups = useMemo(() => {
    const selected = quotes.filter((quote) => quote.status === "selected");
    const byVendor = new Map();
    selected.forEach((quote) => {
      const bucket = byVendor.get(quote.vendorId) ?? [];
      bucket.push(quote);
      byVendor.set(quote.vendorId, bucket);
    });
    return Array.from(byVendor.entries()).map(([vendorId, lines]) => {
      // A PO already covers this vendor's selection once any of its lines
      // appear on an existing PO's quotationLineIds — once that's true,
      // "Create PO" should point at the PO that already exists instead of
      // inviting a duplicate.
      const lineIds = new Set(lines.map((line) => line.id));
      const existingPo = purchaseOrders.find((po) =>
        (po.quotationLineIds ?? []).some((id) => lineIds.has(id)),
      );
      return {
        vendorId,
        vendor: getVendor(vendorId),
        lines,
        existingPo,
      };
    });
  }, [quotes, getVendor, purchaseOrders]);
  const selectedMaterialCodes = useMemo(
    () =>
      new Set(
        quotes
          .filter((q) => q.status === "selected")
          .map((q) => q.materialCode),
      ),
    [quotes],
  );
  const allItemsCovered =
    materials.length > 0 &&
    materials.every((m) => selectedMaterialCodes.has(m.materialCode));

  if (groups.length === 0) {
    return (
      <Panel>
        <PanelHeader>Supplier selection</PanelHeader>
        <EmptyState
          compact
          description="Select a supplier for at least one item above to see PO-ready groups here."
          icon={<ShoppingCart aria-hidden="true" strokeWidth={1.75} />}
          title="Nothing selected yet"
        />
      </Panel>
    );
  }
  return (
    <Panel>
      <PanelHeader>
        Supplier selection
        <Badge variant={allItemsCovered ? "success" : "accent"}>
          {allItemsCovered
            ? "All items PO ready"
            : `${selectedMaterialCodes.size}/${materials.length} items selected`}
        </Badge>
      </PanelHeader>
      <Grid>
        {groups.map((group) => (
          <SupplierGroup key={group.vendorId}>
            <SupplierName>
              {group.vendor?.name ?? group.vendorId}
              <Badge variant={group.existingPo ? "outline" : "success"}>
                <PackageCheck aria-hidden="true" strokeWidth={1.75} />
                {group.existingPo ? "PO Created" : "PO Ready"}
              </Badge>
            </SupplierName>
            <ItemList>
              {group.lines.map((line) => (
                <ItemRow key={line.id}>
                  <ItemName>
                    {getMaterialByCode(line.materialCode)?.name ??
                      line.materialCode}
                  </ItemName>
                  {line.deliveryDays !== null && line.deliveryDays !== undefined ? (
                    <span>{line.deliveryDays}d delivery</span>
                  ) : null}
                </ItemRow>
              ))}
            </ItemList>
            {group.existingPo ? (
              <Button asChild size="sm" variant="outline">
                <Link href={`/procurement/purchase-orders/${group.existingPo.id}`}>
                  View {group.existingPo.id}
                </Link>
              </Button>
            ) : null}
            {!group.existingPo && canCreatePo ? (
              <Button asChild size="sm" variant="outline">
                <Link
                  href={`/procurement/purchase-orders/new?purchaseRequestId=${purchaseRequestId}&vendorId=${group.vendorId}`}
                >
                  Create PO for {group.vendor?.name ?? group.vendorId}
                </Link>
              </Button>
            ) : null}
          </SupplierGroup>
        ))}
      </Grid>
    </Panel>
  );
}

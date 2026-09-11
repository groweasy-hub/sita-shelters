"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Boxes, IndianRupee, Layers, Star } from "lucide-react";
import styled from "styled-components";

import { KpiCard, KpiGrid, PageHeader, StatusBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAllInventoryItems, useInventoryLedger } from "@/features/inventory";
import {
  formatCurrency,
  formatDateTime,
  formatQuantity,
} from "@/lib/formatters";
import {
  getCategoryName,
  getSubcategoryName,
} from "@/lib/mock-data/material-categories";
import { getVendorById } from "@/lib/mock-data/vendors";
import { useMaterial } from "../hooks/use-materials";

const Root = styled.div`
  display: grid;
  max-width: 84rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
  }
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`;
const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const PanelHeader = styled.header`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.875rem;
  font-weight: 650;
`;
const DefinitionGrid = styled.dl`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  margin: 0;
  padding: 1.25rem;
  dt {
    color: ${({ theme }) => theme.colors.mutedForeground};
    font-size: 0.7rem;
    font-weight: 650;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  dd {
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
    font-weight: 600;
  }
`;
const StockRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) repeat(3, 6rem);
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8125rem;
  &:last-child {
    border-bottom: 0;
  }
`;
const StockRowHead = styled(StockRow)`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.7rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;
const Num = styled.span`
  text-align: right;
  font-variant-numeric: tabular-nums;
`;
const VendorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child {
    border-bottom: 0;
  }
`;
const VendorName = styled.p`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 650;
`;
const VendorMeta = styled.p`
  margin: 0.125rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const HistoryRow = styled.div`
  display: grid;
  grid-template-columns: 9rem minmax(0, 1fr) 7rem 8rem;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8125rem;
  &:last-child {
    border-bottom: 0;
  }
`;

export function MaterialDetailScreen({ materialId }) {
  const router = useRouter();
  const { data: material } = useMaterial(materialId);
  const { data: inventoryItems = [] } = useAllInventoryItems();
  const { data: ledger = [] } = useInventoryLedger();
  if (!material) {
    return (
      <EmptyState
        action={
          <Button onClick={() => router.push("/materials")} variant="outline">
            Back to materials
          </Button>
        }
        description="This material may have been removed from the catalogue."
        title="Material not found"
      />
    );
  }
  const stockRows = inventoryItems.filter(
    (item) => item.materialCode === material.code,
  );
  const totalAvailable = stockRows.reduce(
    (sum, row) => sum + row.availableQuantity,
    0,
  );
  const totalValue = totalAvailable * material.lastPurchasePrice;
  const vendors = material.approvedVendorIds
    .map((vendorId) => getVendorById(vendorId))
    .filter(Boolean);
  const history = ledger
    .filter((entry) => entry.materialCode === material.code)
    .slice(0, 15);
  return (
    <Root>
      <div>
        <BackLink href="/materials">
          <ArrowLeft aria-hidden="true" />
          Back to materials
        </BackLink>
      </div>
      <PageHeader
        description={material.specification}
        eyebrow={`${getCategoryName(material.category)} · ${getSubcategoryName(material.category, material.subcategory)}`}
        meta={
          <>
            <Badge variant="outline">{material.code}</Badge>
            <StatusBadge status={material.status} />
          </>
        }
        title={material.name}
      />
      <KpiGrid>
        <KpiCard
          icon={Boxes}
          label="Available across projects"
          value={formatQuantity(totalAvailable, material.unit)}
        />
        <KpiCard
          icon={IndianRupee}
          label="Stock valuation"
          value={formatCurrency(totalValue, { maximumFractionDigits: 0 })}
        />
        <KpiCard
          icon={Layers}
          label="Projects holding stock"
          value={stockRows.length}
        />
        <KpiCard
          icon={Star}
          label="Last purchase price"
          value={formatCurrency(material.lastPurchasePrice)}
        />
      </KpiGrid>
      <Panel>
        <PanelHeader>Master data</PanelHeader>
        <DefinitionGrid>
          <div>
            <dt>Item type</dt>
            <dd>{material.itemType || "Stock"}</dd>
          </div>
          <div>
            <dt>Packing</dt>
            <dd>{material.packing || "-"}</dd>
          </div>
          <div>
            <dt>HSN/SAC</dt>
            <dd>{material.hsnSacCode || "-"}</dd>
          </div>
          <div>
            <dt>GST</dt>
            <dd>{material.gstRate == null ? "-" : `${material.gstRate}%`}</dd>
          </div>
          <div>
            <dt>Manufacturer</dt>
            <dd>{material.manufacturer || "-"}</dd>
          </div>
        </DefinitionGrid>
      </Panel>
      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">Stock distribution</TabsTrigger>
          <TabsTrigger value="vendors">Vendor information</TabsTrigger>
          <TabsTrigger value="history">Transaction history</TabsTrigger>
        </TabsList>
        <TabsContent value="stock">
          <Panel>
            <PanelHeader>Stock by project</PanelHeader>
            {stockRows.length ? (
              <div>
                <StockRowHead>
                  <span>Project</span>
                  <Num>Available</Num>
                  <Num>Reserved</Num>
                  <Num>Reorder level</Num>
                </StockRowHead>
                {stockRows.map((row) => (
                  <StockRow key={row.id}>
                    <Link href={`/projects/${row.projectId}`}>
                      {row.projectName}
                    </Link>
                    <Num>
                      {formatQuantity(row.availableQuantity, material.unit)}
                    </Num>
                    <Num>
                      {formatQuantity(row.reservedQuantity, material.unit)}
                    </Num>
                    <Num>{formatQuantity(row.reorderLevel, material.unit)}</Num>
                  </StockRow>
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                description="No project currently holds stock of this material."
                title="No stock recorded"
              />
            )}
          </Panel>
        </TabsContent>
        <TabsContent value="vendors">
          <Panel>
            <PanelHeader>Approved vendors</PanelHeader>
            {vendors.length ? (
              vendors.map((vendor) => (
                <VendorRow key={vendor.id}>
                  <div>
                    <VendorName>{vendor.name}</VendorName>
                    <VendorMeta>
                      {vendor.type} · {vendor.code} · Rating{" "}
                      {vendor.rating.toFixed(1)}
                    </VendorMeta>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/vendors/${vendor.id}`}>View vendor</Link>
                  </Button>
                </VendorRow>
              ))
            ) : (
              <EmptyState
                compact
                description="No vendor has been approved to supply this material yet."
                title="No approved vendors"
              />
            )}
          </Panel>
        </TabsContent>
        <TabsContent value="history">
          <Panel>
            <PanelHeader>Recent movements</PanelHeader>
            {history.length ? (
              history.map((entry) => (
                <HistoryRow key={entry.id}>
                  <span>{formatDateTime(entry.date)}</span>
                  <span>{entry.projectName}</span>
                  <Badge variant="muted">{entry.movementLabel}</Badge>
                  <Num>
                    {entry.quantity > 0 ? "+" : ""}
                    {formatQuantity(entry.quantity, material.unit)}
                  </Num>
                </HistoryRow>
              ))
            ) : (
              <EmptyState
                compact
                description="No recorded movement yet for this material."
                title="No transaction history"
              />
            )}
          </Panel>
        </TabsContent>
      </Tabs>
    </Root>
  );
}

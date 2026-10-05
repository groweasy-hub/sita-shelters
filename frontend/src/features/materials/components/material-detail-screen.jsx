"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Boxes,
  IndianRupee,
  Layers,
  Pencil,
  Star,
} from "lucide-react";
import styled from "styled-components";

import { ConfirmationDialog, KpiCard, KpiGrid, PageHeader, StatusBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/feedback/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasPermission } from "@/config/permissions";
import { useAllInventoryItems, useInventoryLedger } from "@/features/inventory";
import { useCurrentUser } from "@/features/profile";
import {
  formatCurrency,
  formatDateTime,
  formatQuantity,
} from "@/lib/formatters";
import {
  getCategoryName,
  getSubcategoryName,
} from "@/lib/mock-data/material-categories";
import { MATERIAL_STATUS_OPTIONS } from "../constants/materials.constants";
import { useMaterial, useMaterialVendors, useUpdateMaterial } from "../hooks/use-materials";
import { useVendorLookup } from "@/features/vendors";

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
const StockScroller = styled.div`
  overflow-x: auto;
`;
const StockTable = styled.div`
  min-width: 54rem;
`;
const StockRow = styled.div`
  display: grid;
  grid-template-columns:
    minmax(11rem, 1.3fr) minmax(12rem, 2fr) 6rem 8rem 7rem 8.5rem;
  gap: 1.25rem;
  align-items: center;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8125rem;
  &:last-child {
    border-bottom: 0;
  }
`;
const StockRowHead = styled(StockRow)`
  padding-block: 0.625rem;
  background: ${({ theme }) => theme.colors.muted};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.6875rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;
const StockRowTotal = styled(StockRow)`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.muted};
  font-weight: 650;
`;
const ProjectCell = styled.div`
  display: grid;
  min-width: 0;
  justify-items: start;
  gap: 0.375rem;
  a {
    color: ${({ theme }) => theme.colors.foreground};
    font-size: 0.875rem;
    font-weight: 650;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
`;
const ShareCell = styled.div`
  display: grid;
  gap: 0.375rem;
`;
const ShareFigures = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  font-variant-numeric: tabular-nums;
  strong {
    font-size: 0.9375rem;
    font-weight: 700;
  }
  span {
    color: ${({ theme }) => theme.colors.mutedForeground};
    font-size: 0.75rem;
  }
`;
const ShareTrack = styled.div`
  height: 0.375rem;
  overflow: hidden;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.border};
`;
const ShareFill = styled.div`
  width: ${({ $percent }) => $percent}%;
  height: 100%;
  border-radius: 999px;
  background: ${({ $warn, theme }) =>
    $warn ? theme.colors.warning : theme.colors.primary};
`;
const CellNote = styled.span`
  display: block;
  color: ${({ $warn, theme }) =>
    $warn ? theme.colors.warning : theme.colors.mutedForeground};
  font-size: 0.6875rem;
  font-weight: ${({ $warn }) => ($warn ? 650 : 500)};
`;
const Reference = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;
  font-weight: 600;
`;
const movementTone = {
  "goods-inward": "success",
  replacement: "success",
  issue: "secondary",
  consumption: "muted",
  return: "info",
  "transfer-in": "success",
  "transfer-out": "warning",
  damage: "destructive",
};
const Num = styled.span`
  text-align: right;
  font-variant-numeric: tabular-nums;
`;
const VendorRow = styled.div`
  display: grid;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child {
    border-bottom: 0;
  }
`;
const VendorHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;
const VendorTitle = styled.div`
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
`;
const VendorName = styled(Link)`
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.9375rem;
  font-weight: 650;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;
const VendorMeta = styled.p`
  margin: 0.125rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const VendorStats = styled.dl`
  display: grid;
  margin: 0;
  gap: 0.75rem 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
  dt {
    color: ${({ theme }) => theme.colors.mutedForeground};
    font-size: 0.6875rem;
    font-weight: 650;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  dd {
    margin: 0.125rem 0 0;
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }
`;
const HistoryScroller = styled.div`
  overflow-x: auto;
`;
const HistoryTable = styled.div`
  min-width: 56rem;
`;
const HistoryRow = styled.div`
  display: grid;
  grid-template-columns:
    9.5rem 9rem 6.5rem minmax(8rem, 1fr) minmax(9rem, 1.2fr) 7rem 7rem;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8125rem;
  &:last-child {
    border-bottom: 0;
  }
`;
const HistoryHead = styled(HistoryRow)`
  background: ${({ theme }) => theme.colors.muted};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.6875rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;
const Signed = styled(Num)`
  color: ${({ $negative, theme }) =>
    $negative ? theme.colors.danger : theme.colors.success};
  font-weight: 650;
`;
const Dim = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
`;
const HistoryFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const DialogField = styled.div`
  display: grid;
  gap: 0.375rem;
  margin-top: 0.75rem;
  text-align: left;
`;

function EditSpecsDialog({ material }) {
  const updateMaterial = useUpdateMaterial();
  const [specification, setSpecification] = useState(
    material.specification ?? "",
  );
  const [reorderLevel, setReorderLevel] = useState(String(material.reorderLevel));
  const [lastPurchasePrice, setLastPurchasePrice] = useState(
    String(material.lastPurchasePrice),
  );
  const [status, setStatus] = useState(material.status);

  function reset() {
    setSpecification(material.specification ?? "");
    setReorderLevel(String(material.reorderLevel));
    setLastPurchasePrice(String(material.lastPurchasePrice));
    setStatus(material.status);
  }

  return (
    <ConfirmationDialog
      confirmLabel="Save changes"
      description="Updates the material's specification, reorder level, last purchase price and status."
      onConfirm={() =>
        updateMaterial.mutateAsync({
          materialId: material.id,
          specification,
          reorderLevel: Number(reorderLevel),
          lastPurchasePrice: Number(lastPurchasePrice),
          status,
        })
      }
      onOpenChange={(open) => {
        if (!open) reset();
      }}
      pending={updateMaterial.isPending}
      title="Edit material specs"
      trigger={
        <Button variant="outline">
          <Pencil aria-hidden="true" strokeWidth={1.75} />
          Edit Specs
        </Button>
      }
    >
      <DialogField>
        <Label htmlFor="material-specification">Specification</Label>
        <Textarea
          id="material-specification"
          onChange={(event) => setSpecification(event.target.value)}
          rows={3}
          value={specification}
        />
      </DialogField>
      <DialogField>
        <Label htmlFor="material-reorder-level">
          Reorder level ({material.unit})
        </Label>
        <Input
          id="material-reorder-level"
          min="0"
          onChange={(event) => setReorderLevel(event.target.value)}
          step="any"
          type="number"
          value={reorderLevel}
        />
      </DialogField>
      <DialogField>
        <Label htmlFor="material-last-price">Last purchase price</Label>
        <Input
          id="material-last-price"
          min="0"
          onChange={(event) => setLastPurchasePrice(event.target.value)}
          step="any"
          type="number"
          value={lastPurchasePrice}
        />
      </DialogField>
      <DialogField>
        <Label htmlFor="material-status">Status</Label>
        <Select onValueChange={setStatus} value={status}>
          <SelectTrigger id="material-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MATERIAL_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DialogField>
    </ConfirmationDialog>
  );
}

export function MaterialDetailScreen({ materialId }) {
  const { getVendor } = useVendorLookup();
  const router = useRouter();
  const { data: material } = useMaterial(materialId);
  const currentUser = useCurrentUser();
  const canManageSpecs =
    currentUser && hasPermission(currentUser.role, "materials:manage");
  const { data: inventoryItems = [] } = useAllInventoryItems();
  const { data: ledger = [] } = useInventoryLedger();
  const { data: materialVendors = [] } = useMaterialVendors(materialId);
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
  // Includes stock posted but not yet confirmed by the Store Manager
  // (`pendingReceiptQuantity`), matching the Inventory overview and Site
  // Stock register — otherwise newly posted deliveries read as zero here
  // until someone confirms receipt.
  const totalAvailable = stockRows.reduce(
    (sum, row) => sum + row.availableQuantity + (row.pendingReceiptQuantity ?? 0),
    0,
  );
  const totalValue = stockRows.reduce((sum, row) => sum + row.stockValue, 0);
  const materialLedger = ledger.filter(
    (entry) => entry.materialCode === material.code,
  );
  const history = materialLedger.slice(0, 25);
  return (
    <Root>
      <div>
        <BackLink href="/materials">
          <ArrowLeft aria-hidden="true" />
          Back to materials
        </BackLink>
      </div>
      <PageHeader
        actions={canManageSpecs ? <EditSpecsDialog material={material} /> : null}
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
              <StockScroller>
                <StockTable>
                  <StockRowHead>
                    <span>Project</span>
                    <span>Available · share of total</span>
                    <Num>Reserved</Num>
                    <Num>Reorder level</Num>
                    <Num>Stock value</Num>
                    <Num>Last updated</Num>
                  </StockRowHead>
                  {[...stockRows]
                    .sort(
                      (a, b) =>
                        b.availableQuantity + (b.pendingReceiptQuantity ?? 0) -
                        (a.availableQuantity + (a.pendingReceiptQuantity ?? 0)),
                    )
                    .map((row) => {
                      const rowQuantity =
                        row.availableQuantity + (row.pendingReceiptQuantity ?? 0);
                      const share =
                        totalAvailable > 0 ? (rowQuantity / totalAvailable) * 100 : 0;
                      const belowReorder =
                        row.reorderLevel > 0 &&
                        row.availableQuantity < row.reorderLevel;
                      return (
                        <StockRow key={row.id}>
                          <ProjectCell>
                            <Link href={`/projects/${row.projectId}`}>
                              {row.projectName}
                            </Link>
                            <StatusBadge status={row.status} />
                          </ProjectCell>
                          <ShareCell>
                            <ShareFigures>
                              <strong>
                                {formatQuantity(rowQuantity, material.unit)}
                              </strong>
                              <span>{share.toFixed(share >= 10 ? 0 : 1)}% of total</span>
                            </ShareFigures>
                            <ShareTrack aria-hidden="true">
                              <ShareFill $percent={share} $warn={belowReorder} />
                            </ShareTrack>
                          </ShareCell>
                          <Num>
                            {formatQuantity(row.reservedQuantity, material.unit)}
                          </Num>
                          <Num>
                            {row.reorderLevel > 0
                              ? formatQuantity(row.reorderLevel, material.unit)
                              : "—"}
                            {row.reorderLevel > 0 ? (
                              <CellNote $warn={belowReorder}>
                                {belowReorder
                                  ? `${formatQuantity(row.reorderLevel - row.availableQuantity, material.unit)} below`
                                  : "Above reorder level"}
                              </CellNote>
                            ) : null}
                          </Num>
                          <Num>
                            {formatCurrency(row.stockValue, {
                              maximumFractionDigits: 0,
                            })}
                          </Num>
                          <Num>
                            <CellNote>{formatDateTime(row.updatedAt)}</CellNote>
                          </Num>
                        </StockRow>
                      );
                    })}
                  <StockRowTotal>
                    <span>
                      Total · {stockRows.length}{" "}
                      {stockRows.length === 1 ? "project" : "projects"}
                    </span>
                    <span>{formatQuantity(totalAvailable, material.unit)}</span>
                    <Num>
                      {formatQuantity(
                        stockRows.reduce((sum, row) => sum + row.reservedQuantity, 0),
                        material.unit,
                      )}
                    </Num>
                    <Num />
                    <Num>
                      {formatCurrency(
                        stockRows.reduce((sum, row) => sum + row.stockValue, 0),
                        { maximumFractionDigits: 0 },
                      )}
                    </Num>
                    <Num />
                  </StockRowTotal>
                </StockTable>
              </StockScroller>
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
            <PanelHeader>Vendors for this material</PanelHeader>
            {materialVendors.length ? (
              materialVendors.map((entry) => {
                const vendor = getVendor(entry.vendorId);
                const rating = vendor?.rating ?? entry.rating;
                const type = vendor?.type ?? entry.vendorType;
                const code = vendor?.code ?? entry.vendorCode;
                return (
                  <VendorRow key={entry.vendorId}>
                    <VendorHead>
                      <div>
                        <VendorTitle>
                          <VendorName href={`/vendors/${entry.vendorId}`}>
                            {vendor?.name ?? entry.vendorName}
                          </VendorName>
                          {entry.approved ? (
                            <Badge variant="success">Approved</Badge>
                          ) : null}
                          {entry.orderCount > 0 ? (
                            <Badge variant="info">Supplied</Badge>
                          ) : null}
                        </VendorTitle>
                        <VendorMeta>
                          {[type, code].filter(Boolean).join(" · ")}
                          {rating !== null && rating !== undefined
                            ? `${type || code ? " · " : ""}Rating ${rating.toFixed(1)}`
                            : ""}
                        </VendorMeta>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/vendors/${entry.vendorId}`}>View vendor</Link>
                      </Button>
                    </VendorHead>
                    {entry.orderCount > 0 ? (
                      <VendorStats>
                        <div>
                          <dt>Orders</dt>
                          <dd>
                            {entry.orderCount}
                            {entry.lastOrderNumber ? ` · latest ${entry.lastOrderNumber}` : ""}
                          </dd>
                        </div>
                        <div>
                          <dt>Ordered</dt>
                          <dd>{formatQuantity(entry.orderedQuantity, material.unit)}</dd>
                        </div>
                        <div>
                          <dt>Delivered</dt>
                          <dd>{formatQuantity(entry.receivedQuantity, material.unit)}</dd>
                        </div>
                        <div>
                          <dt>Last unit price</dt>
                          <dd>
                            {entry.lastUnitPrice !== null
                              ? formatCurrency(entry.lastUnitPrice)
                              : "—"}
                          </dd>
                        </div>
                        <div>
                          <dt>Last ordered</dt>
                          <dd>
                            {entry.lastOrderedAt
                              ? formatDateTime(entry.lastOrderedAt)
                              : "—"}
                          </dd>
                        </div>
                      </VendorStats>
                    ) : (
                      <VendorMeta>Approved, but not ordered from yet.</VendorMeta>
                    )}
                  </VendorRow>
                );
              })
            ) : (
              <EmptyState
                compact
                description="No vendor is approved for this material and none has been ordered from yet."
                title="No vendors yet"
              />
            )}
          </Panel>
        </TabsContent>
        <TabsContent value="history">
          <Panel>
            <PanelHeader>Transaction history</PanelHeader>
            {history.length ? (
              <>
                <HistoryScroller>
                  <HistoryTable>
                    <HistoryHead>
                      <span>Date</span>
                      <span>Movement</span>
                      <span>Reference</span>
                      <span>Project</span>
                      <span>Vendor</span>
                      <Num>Quantity</Num>
                      <Num>Balance</Num>
                    </HistoryHead>
                    {history.map((entry) => (
                      <HistoryRow key={entry.id}>
                        <span>{formatDateTime(entry.date)}</span>
                        <span>
                          <Badge variant={movementTone[entry.movementType] ?? "muted"}>
                            {entry.movementLabel}
                          </Badge>
                        </span>
                        <Reference>{entry.referenceId ?? "—"}</Reference>
                        <span>{entry.projectName}</span>
                        {entry.vendorName ? (
                          <span>{entry.vendorName}</span>
                        ) : (
                          <Dim>—</Dim>
                        )}
                        <Signed $negative={entry.quantity < 0}>
                          {entry.quantity > 0 ? "+" : ""}
                          {formatQuantity(entry.quantity, material.unit)}
                        </Signed>
                        <Num>{formatQuantity(entry.balanceAfter, material.unit)}</Num>
                      </HistoryRow>
                    ))}
                  </HistoryTable>
                </HistoryScroller>
                <HistoryFooter>
                  <span>
                    Showing the latest {history.length} of {materialLedger.length}{" "}
                    movements
                  </span>
                  <Link href="/inventory/ledger">View full stock ledger</Link>
                </HistoryFooter>
              </>
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

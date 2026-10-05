"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Boxes,
  PackageX,
  ShieldAlert,
  Warehouse,
} from "lucide-react";
import styled from "styled-components";

import {
  DataTable,
  KpiCard,
  KpiGrid,
  PageHeader,
  ProjectFilterSelect,
} from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useProjectScope } from "@/features/profile";
import { formatCompactNumber, formatCurrency } from "@/lib/formatters";
import { useDamagedStockRecords } from "@/features/damaged-stock";
import { useProjectContextStore } from "@/stores/project-context-store";
import { INVENTORY_STATUS_OPTIONS } from "../constants/inventory.constants";
import { useAllInventoryItems, useInventory } from "../hooks/use-inventory";
import { inventoryColumns } from "./inventory-columns";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const StatusFilterLabel = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-weight: 650;
`;
const TableEmptyState = styled.div`
  padding: 1rem;
  text-align: center;
`;

export function InventoryScreen({
  description,
  eyebrow = "Stock control",
  forcedProjectId,
  forcedStatus,
  title = "Inventory",
}) {
  const router = useRouter();
  const { scopeProjectIds, isLocked, defaultProjectId } = useProjectScope();
  const effectiveForcedProjectId = forcedProjectId ?? (isLocked ? defaultProjectId : null);
  const globalProjectId = useProjectContextStore(
    (state) => state.selectedProjectId,
  );
  const [projectId, setProjectId] = useState(
    effectiveForcedProjectId ?? defaultProjectId ?? globalProjectId ?? null,
  );
  const [status, setStatus] = useState(forcedStatus ?? "");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([{ id: "materialName", desc: false }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const effectiveStatuses = forcedStatus
    ? [forcedStatus]
    : status
      ? [status]
      : [];
  const params = {
    projectId: effectiveForcedProjectId ?? projectId,
    search,
    statuses: effectiveStatuses,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id ?? "materialName",
    sortDirection: sorting[0]?.desc ? "desc" : "asc",
  };
  const { data } = useInventory(params);
  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  // KPIs cover everything in the selected project(s) — not just the table page you're on.
  const { data: allItems = [] } = useAllInventoryItems();
  const { data: damageRecords = [] } = useDamagedStockRecords();
  const scopeProjectId = effectiveForcedProjectId ?? projectId;
  const kpis = useMemo(() => {
    const inScope = (record) =>
      (!scopeProjectIds || scopeProjectIds.includes(record.projectId)) &&
      (!scopeProjectId || record.projectId === scopeProjectId);
    const scoped = allItems.filter(inScope);
    return {
      stockValue: scoped.reduce((sum, item) => sum + item.stockValue, 0),
      lowStockCount: scoped.filter(
        (item) =>
          item.status === "low-stock" ||
          (item.reorderLevel > 0 && item.availableQuantity < item.reorderLevel),
      ).length,
      damagedValue: damageRecords
        .filter((record) => record.type === "damage" && inScope(record))
        .reduce((sum, record) => sum + record.financialValue, 0),
      inTransitCount: scoped.filter((item) => item.status === "in-transit").length,
    };
  }, [allItems, damageRecords, scopeProjectId, scopeProjectIds]);
  return (
    <Root>
      <PageHeader
        description={
          description ??
          "Available, reserved, low-stock, damaged and in-transit positions across every project."
        }
        eyebrow={eyebrow}
        meta={
          <Badge variant="outline">
            {formatCompactNumber(total)} SKU positions
          </Badge>
        }
        title={title}
      />
      <KpiGrid>
        <KpiCard
          icon={Warehouse}
          label="Stock value"
          value={formatCurrency(kpis.stockValue, { maximumFractionDigits: 0 })}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Below reorder level"
          tone="warning"
          value={kpis.lowStockCount}
        />
        <KpiCard
          icon={PackageX}
          label="Damaged value"
          tone="danger"
          value={formatCurrency(kpis.damagedValue, {
            maximumFractionDigits: 0,
          })}
        />
        <KpiCard
          icon={ShieldAlert}
          label="In transit"
          tone="info"
          value={kpis.inTransitCount}
        />
      </KpiGrid>
      <DataTable
        ariaLabel={title}
        columns={inventoryColumns}
        data={items}
        emptyState={
          <TableEmptyState>
            <Boxes aria-hidden="true" size={20} />
            <p>No inventory positions match the current filters.</p>
          </TableEmptyState>
        }
        filters={
          <>
            <ProjectFilterSelect
              isLocked={Boolean(effectiveForcedProjectId)}
              onChange={setProjectId}
              scopeProjectIds={scopeProjectIds}
              value={projectId}
            />
            {!forcedStatus ? (
              <Select
                onValueChange={(value) =>
                  setStatus(value === "all" ? "" : value)
                }
                value={status || "all"}
              >
                <SelectTrigger aria-label="Filter by status" size="sm">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {INVENTORY_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <StatusFilterLabel>
                Showing {forcedStatus.replaceAll("-", " ")} only
              </StatusFilterLabel>
            )}
          </>
        }
        manualFiltering
        manualPagination
        manualSorting
        onPaginationChange={setPagination}
        onResetFilters={() => {
          setProjectId(effectiveForcedProjectId ?? defaultProjectId ?? null);
          if (!forcedStatus) setStatus("");
          setSearch("");
        }}
        onRowClick={(row) => {
          if (row.materialId) router.push(`/materials/${row.materialId}`);
        }}
        onSearchChange={setSearch}
        onSortingChange={setSorting}
        pageCount={Math.max(1, Math.ceil(total / pagination.pageSize))}
        rowCount={total}
        search={{ placeholder: "Search material, project or code" }}
        state={{ pagination, sorting }}
      />
    </Root>
  );
}

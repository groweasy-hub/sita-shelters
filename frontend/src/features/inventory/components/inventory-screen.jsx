"use client";

import { useMemo, useState } from "react";
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
import { getMaterialByCode } from "@/lib/mock-data/materials";
import { useProjectContextStore } from "@/stores/project-context-store";
import { INVENTORY_STATUS_OPTIONS } from "../constants/inventory.constants";
import { useInventory } from "../hooks/use-inventory";
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

function inventoryValue(items) {
  return items.reduce((total, item) => {
    const material = getMaterialByCode(item.materialCode);
    const price = material?.lastPurchasePrice ?? 0;
    return total + item.availableQuantity * price;
  }, 0);
}

export function InventoryScreen({
  description,
  eyebrow = "Stock control",
  forcedProjectId,
  forcedStatus,
  title = "Inventory",
}) {
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
  const kpis = useMemo(() => {
    const lowStockCount = items.filter(
      (item) =>
        item.status === "low-stock" ||
        item.availableQuantity < item.reorderLevel,
    ).length;
    const damagedItems = items.filter((item) => item.status === "damaged");
    return {
      stockValue: inventoryValue(items),
      lowStockCount,
      damagedValue: inventoryValue(damagedItems),
      inTransitCount: items.filter((item) => item.status === "in-transit")
        .length,
    };
  }, [items]);
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
          label="Stock value (page)"
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
          label="Damaged value (page)"
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

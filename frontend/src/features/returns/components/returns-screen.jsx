"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck, PackageX, RotateCcw, ShieldCheck } from "lucide-react";
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
import {
  RETURN_INSPECTION_STATUS_OPTIONS,
  RETURN_REASON_OPTIONS,
} from "../constants/returns.constants";
import { useReturns } from "../hooks/use-returns";
import { returnsColumns } from "./returns-columns";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;

function inspectionValue(items, key) {
  return items.reduce((total, item) => {
    const material = getMaterialByCode(item.materialCode);
    const price = material?.lastPurchasePrice ?? 0;
    return total + item.inspection[key] * price;
  }, 0);
}

export function ReturnsScreen() {
  const { scopeProjectIds, isLocked, defaultProjectId } = useProjectScope();
  const globalProjectId = useProjectContextStore(
    (state) => state.selectedProjectId,
  );
  const [projectId, setProjectId] = useState(
    defaultProjectId ?? globalProjectId ?? null,
  );
  const [inspectionStatus, setInspectionStatus] = useState(null);
  const [reason, setReason] = useState(null);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([{ id: "returnedAt", desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const params = {
    projectId,
    search,
    inspectionStatus,
    reason,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id ?? "returnedAt",
    sortDirection: sorting[0]?.desc ? "desc" : "asc",
  };
  const { data } = useReturns(params);
  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const kpis = useMemo(() => {
    const pendingCount = items.filter(
      (item) => item.inspection.status === "pending-inspection",
    ).length;
    return {
      count: items.length,
      pendingCount,
      goodValue: inspectionValue(items, "goodQuantity"),
      damagedValue: inspectionValue(items, "damagedQuantity"),
    };
  }, [items]);
  return (
    <Root>
      <PageHeader
        description="Unused material returned to store, with its quality-check inspection recorded alongside the return."
        eyebrow="Site operations"
        meta={
          <Badge variant="outline">
            {formatCompactNumber(total)} return records
          </Badge>
        }
        title="Material Returns"
      />
      <KpiGrid>
        <KpiCard
          icon={RotateCcw}
          label="Returns (page)"
          value={formatCompactNumber(kpis.count)}
        />
        <KpiCard
          icon={ClipboardCheck}
          label="Pending inspection"
          tone="warning"
          value={kpis.pendingCount}
        />
        <KpiCard
          icon={ShieldCheck}
          label="Good-condition value recovered"
          tone="success"
          value={formatCurrency(kpis.goodValue, { maximumFractionDigits: 0 })}
        />
        <KpiCard
          icon={PackageX}
          label="Damaged value"
          tone="danger"
          value={formatCurrency(kpis.damagedValue, {
            maximumFractionDigits: 0,
          })}
        />
      </KpiGrid>
      <DataTable
        ariaLabel="Material returns"
        columns={returnsColumns}
        data={items}
        filters={
          <>
            <ProjectFilterSelect
              isLocked={isLocked}
              onChange={setProjectId}
              scopeProjectIds={scopeProjectIds}
              value={projectId}
            />
            <Select
              onValueChange={(value) =>
                setInspectionStatus(value === "all" ? null : value)
              }
              value={inspectionStatus ?? "all"}
            >
              <SelectTrigger aria-label="Filter by inspection status" size="sm">
                <SelectValue placeholder="All inspection statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All inspection statuses</SelectItem>
                {RETURN_INSPECTION_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) =>
                setReason(value === "all" ? null : value)
              }
              value={reason ?? "all"}
            >
              <SelectTrigger aria-label="Filter by reason" size="sm">
                <SelectValue placeholder="All reasons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All reasons</SelectItem>
                {RETURN_REASON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
        manualFiltering
        manualPagination
        manualSorting
        onPaginationChange={setPagination}
        onResetFilters={() => {
          setProjectId(defaultProjectId ?? null);
          setInspectionStatus(null);
          setReason(null);
          setSearch("");
        }}
        onSearchChange={setSearch}
        onSortingChange={setSorting}
        pageCount={Math.max(1, Math.ceil(total / pagination.pageSize))}
        rowCount={total}
        search={{ placeholder: "Search return #, material, reason" }}
        state={{ pagination, sorting }}
      />
    </Root>
  );
}

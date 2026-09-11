"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PackageSearch, ScanSearch, ShieldAlert, Truck } from "lucide-react";
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
import { inProjectScope, useProjectScope } from "@/features/profile";
import { formatCompactNumber } from "@/lib/formatters";
import { INWARD_STATUS_OPTIONS } from "../constants/inward.constants";
import { useAllInwardRecords, useInward } from "../hooks/use-inward";
import { inwardColumns } from "./inward-columns";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;

export function InwardScreen() {
  const router = useRouter();
  const { scopeProjectIds, isLocked, defaultProjectId } = useProjectScope();
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [status, setStatus] = useState(null);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([{ id: "receivedAt", desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const params = {
    projectId,
    status,
    search,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id ?? "receivedAt",
    sortDirection: sorting[0]?.desc ? "desc" : "asc",
  };
  const { data } = useInward(params);
  const { data: rawAllRecords = [] } = useAllInwardRecords();
  const allRecords = useMemo(
    () => rawAllRecords.filter((record) => inProjectScope(scopeProjectIds, record.projectId)),
    [rawAllRecords, scopeProjectIds],
  );
  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const kpis = useMemo(
    () => ({
      total: allRecords.length,
      pendingQc: allRecords.filter((record) => record.status === "pending-qc")
        .length,
      underInspection: allRecords.filter(
        (record) => record.status === "under-inspection",
      ).length,
      rejected: allRecords.filter((record) => record.status === "rejected")
        .length,
    }),
    [allRecords],
  );
  return (
    <Root>
      <PageHeader
        description="Vendor deliveries received on site. Arrival here does not mean available stock — every record waits for quality control before it reaches inventory."
        eyebrow="Goods inward"
        title="Goods Inward"
      />
      <KpiGrid>
        <KpiCard
          icon={Truck}
          label="Total GRNs"
          value={formatCompactNumber(kpis.total)}
        />
        <KpiCard
          icon={PackageSearch}
          label="Pending QC"
          tone="warning"
          value={kpis.pendingQc}
        />
        <KpiCard
          icon={ScanSearch}
          label="Under inspection"
          tone="info"
          value={kpis.underInspection}
        />
        <KpiCard
          icon={ShieldAlert}
          label="Rejected"
          tone="danger"
          value={kpis.rejected}
        />
      </KpiGrid>
      <DataTable
        ariaLabel="Goods inward"
        columns={inwardColumns}
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
                setStatus(value === "all" ? null : value)
              }
              value={status ?? "all"}
            >
              <SelectTrigger aria-label="Filter by status" size="sm">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {INWARD_STATUS_OPTIONS.map((option) => (
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
          setProjectId(defaultProjectId);
          setStatus(null);
          setSearch("");
        }}
        onRowClick={(row) => router.push(`/inward/${row.id}`)}
        onSearchChange={setSearch}
        onSortingChange={setSorting}
        pageCount={Math.max(1, Math.ceil(total / pagination.pageSize))}
        rowCount={total}
        search={{ placeholder: "Search GRN, PO or invoice" }}
        state={{ pagination, sorting }}
      />
    </Root>
  );
}

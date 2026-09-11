"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardCheck,
  PackageX,
  ScanSearch,
  ShieldCheck,
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
import { inProjectScope, useProjectScope } from "@/features/profile";
import { formatCompactNumber } from "@/lib/formatters";
import { QC_STATUS_OPTIONS } from "../constants/quality-control.constants";
import {
  useAllQualityControlInspections,
  useQualityControlInspections,
} from "../hooks/use-quality-control";
import { qcColumns } from "./qc-columns";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;

export function QualityControlScreen() {
  const router = useRouter();
  const { scopeProjectIds, isLocked, defaultProjectId } = useProjectScope();
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [status, setStatus] = useState(null);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([{ id: "id", desc: false }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const params = {
    projectId,
    status,
    search,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id ?? "id",
    sortDirection: sorting[0]?.desc ? "desc" : "asc",
  };
  const { data } = useQualityControlInspections(params);
  const { data: rawAllInspections = [] } = useAllQualityControlInspections();
  const allInspections = useMemo(
    () => rawAllInspections.filter((record) => inProjectScope(scopeProjectIds, record.projectId)),
    [rawAllInspections, scopeProjectIds],
  );
  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const kpis = useMemo(
    () => ({
      total: allInspections.length,
      pending: allInspections.filter(
        (record) =>
          record.status === "pending-inspection" ||
          record.status === "under-inspection",
      ).length,
      accepted: allInspections.filter((record) => record.status === "accepted")
        .length,
      rejected: allInspections.filter((record) => record.status === "rejected")
        .length,
    }),
    [allInspections],
  );
  return (
    <Root>
      <PageHeader
        description="Every accept or reject verdict recorded against a goods-inward delivery, before material reaches site stock."
        eyebrow="Quality control"
        title="Quality Control"
      />
      <KpiGrid>
        <KpiCard
          icon={ClipboardCheck}
          label="Total inspections"
          value={formatCompactNumber(kpis.total)}
        />
        <KpiCard
          icon={ScanSearch}
          label="Awaiting / in progress"
          tone="warning"
          value={kpis.pending}
        />
        <KpiCard
          icon={ShieldCheck}
          label="Accepted"
          tone="success"
          value={kpis.accepted}
        />
        <KpiCard
          icon={PackageX}
          label="Rejected"
          tone="danger"
          value={kpis.rejected}
        />
      </KpiGrid>
      <DataTable
        ariaLabel="Quality control inspections"
        columns={qcColumns}
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
                {QC_STATUS_OPTIONS.map((option) => (
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
        onRowClick={(row) => router.push(`/quality-control/${row.id}`)}
        onSearchChange={setSearch}
        onSortingChange={setSorting}
        pageCount={Math.max(1, Math.ceil(total / pagination.pageSize))}
        rowCount={total}
        search={{ placeholder: "Search QC, GRN or material" }}
        state={{ pagination, sorting }}
      />
    </Root>
  );
}

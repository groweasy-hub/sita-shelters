"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  ClockAlert,
  PackageCheck,
  PlusCircle,
} from "lucide-react";
import styled from "styled-components";

import {
  DataTable,
  KpiCard,
  KpiGrid,
  PageHeader,
  ProjectFilterSelect,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCompactNumber } from "@/lib/formatters";
import { inProjectScope, useProjectScope } from "@/features/profile";
import {
  INDENT_PRIORITY_OPTIONS,
  INDENT_STATUS_OPTIONS,
} from "../constants/indents.constants";
import { useAllIndents, useIndents } from "../hooks/use-indents";
import { indentColumns } from "./indent-columns";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;

function isThisMonth(dateValue) {
  const now = new Date("2026-09-04T00:00:00+05:30");
  const date = new Date(dateValue);
  return (
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth()
  );
}

export function IndentsScreen() {
  const router = useRouter();
  const { scopeProjectIds, isLocked, defaultProjectId } = useProjectScope();
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [status, setStatus] = useState(null);
  const [priority, setPriority] = useState(null);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([{ id: "createdAt", desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const params = {
    projectId,
    status,
    priority,
    search,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id ?? "createdAt",
    sortDirection: sorting[0]?.desc ? "desc" : "asc",
  };
  const { data } = useIndents(params);
  const { data: rawAllIndents = [] } = useAllIndents();
  const allIndents = useMemo(
    () => rawAllIndents.filter((record) => inProjectScope(scopeProjectIds, record.projectId)),
    [rawAllIndents, scopeProjectIds],
  );
  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const kpis = useMemo(() => {
    const pendingApproval = allIndents.filter(
      (record) =>
        record.status === "submitted" || record.status === "under-review",
    ).length;
    const awaitingFulfilment = allIndents.filter(
      (record) => record.status === "approved",
    ).length;
    const completedThisMonth = allIndents.filter(
      (record) =>
        record.status === "completed" && isThisMonth(record.updatedAt),
    ).length;
    return {
      total: allIndents.length,
      pendingApproval,
      awaitingFulfilment,
      completedThisMonth,
    };
  }, [allIndents]);
  return (
    <Root>
      <PageHeader
        actions={
          <Button onClick={() => router.push("/indents/create")}>
            <PlusCircle aria-hidden="true" />
            Raise Indent
          </Button>
        }
        description="Material demand requests raised by project and site engineers, with the approval and fulfilment lifecycle."
        eyebrow="Demand planning"
        title="Indents"
      />
      <KpiGrid>
        <KpiCard
          icon={ClipboardList}
          label="Total indents"
          value={formatCompactNumber(kpis.total)}
        />
        <KpiCard
          icon={ClockAlert}
          label="Pending approval"
          tone="warning"
          value={kpis.pendingApproval}
        />
        <KpiCard
          icon={PackageCheck}
          label="Approved, awaiting fulfilment"
          tone="info"
          value={kpis.awaitingFulfilment}
        />
        <KpiCard
          icon={PackageCheck}
          label="Completed this month"
          tone="success"
          value={kpis.completedThisMonth}
        />
      </KpiGrid>
      <DataTable
        ariaLabel="Indents"
        columns={indentColumns}
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
                {INDENT_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) =>
                setPriority(value === "all" ? null : value)
              }
              value={priority ?? "all"}
            >
              <SelectTrigger aria-label="Filter by priority" size="sm">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {INDENT_PRIORITY_OPTIONS.map((option) => (
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
          setPriority(null);
          setSearch("");
        }}
        onRowClick={(row) => router.push(`/indents/${row.id}`)}
        onSearchChange={setSearch}
        onSortingChange={setSorting}
        pageCount={Math.max(1, Math.ceil(total / pagination.pageSize))}
        rowCount={total}
        search={{ placeholder: "Search indent, project or material" }}
        state={{ pagination, sorting }}
      />
    </Root>
  );
}

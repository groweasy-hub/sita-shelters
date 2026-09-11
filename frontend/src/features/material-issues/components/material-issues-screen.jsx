"use client";

import { useMemo, useState } from "react";
import { IndianRupee, PackageMinus, PackageOpen, PackageX } from "lucide-react";
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
  MATERIAL_ISSUE_DEPARTMENT_OPTIONS,
  MATERIAL_ISSUE_STATUS_OPTIONS,
} from "../constants/material-issues.constants";
import { useMaterialIssues } from "../hooks/use-material-issues";
import { materialIssuesColumns } from "./material-issues-columns";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;

function issuedValue(items) {
  return items.reduce((total, item) => {
    const material = getMaterialByCode(item.materialCode);
    const price = material?.lastPurchasePrice ?? 0;
    return total + item.issuedQuantity * price;
  }, 0);
}

export function MaterialIssuesScreen() {
  const { scopeProjectIds, isLocked, defaultProjectId } = useProjectScope();
  const globalProjectId = useProjectContextStore(
    (state) => state.selectedProjectId,
  );
  const [projectId, setProjectId] = useState(
    defaultProjectId ?? globalProjectId ?? null,
  );
  const [status, setStatus] = useState(null);
  const [department, setDepartment] = useState(null);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([{ id: "issuedAt", desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const params = {
    projectId,
    search,
    status,
    department,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id ?? "issuedAt",
    sortDirection: sorting[0]?.desc ? "desc" : "asc",
  };
  const { data } = useMaterialIssues(params);
  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const kpis = useMemo(() => {
    const unconsumedCount = items.filter(
      (item) => item.consumedQuantity === 0 && item.returnedQuantity === 0,
    ).length;
    const consumedCount = items.filter(
      (item) => item.status === "consumed",
    ).length;
    return {
      count: items.length,
      value: issuedValue(items),
      unconsumedCount,
      consumedCount,
    };
  }, [items]);
  return (
    <Root>
      <PageHeader
        description="Issue material to work teams and track how much of each issue remains unconsumed."
        eyebrow="Site operations"
        meta={
          <Badge variant="outline">
            {formatCompactNumber(total)} issue records
          </Badge>
        }
        title="Issue Material"
      />
      <KpiGrid>
        <KpiCard
          icon={PackageMinus}
          label="Issues (page)"
          value={formatCompactNumber(kpis.count)}
        />
        <KpiCard
          icon={IndianRupee}
          label="Issued value (page)"
          value={formatCurrency(kpis.value, { maximumFractionDigits: 0 })}
        />
        <KpiCard
          icon={PackageOpen}
          label="Not yet consumed"
          tone="info"
          value={kpis.unconsumedCount}
        />
        <KpiCard
          icon={PackageX}
          label="Fully consumed"
          tone="success"
          value={kpis.consumedCount}
        />
      </KpiGrid>
      <DataTable
        ariaLabel="Material issues"
        columns={materialIssuesColumns}
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
                {MATERIAL_ISSUE_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) =>
                setDepartment(value === "all" ? null : value)
              }
              value={department ?? "all"}
            >
              <SelectTrigger aria-label="Filter by department" size="sm">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {MATERIAL_ISSUE_DEPARTMENT_OPTIONS.map((option) => (
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
          setStatus(null);
          setDepartment(null);
          setSearch("");
        }}
        onSearchChange={setSearch}
        onSortingChange={setSorting}
        pageCount={Math.max(1, Math.ceil(total / pagination.pageSize))}
        rowCount={total}
        search={{ placeholder: "Search issue #, material, recipient" }}
        state={{ pagination, sorting }}
      />
    </Root>
  );
}

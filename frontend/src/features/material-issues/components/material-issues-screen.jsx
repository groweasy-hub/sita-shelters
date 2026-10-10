"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  IndianRupee,
  PackageMinus,
  PackageOpen,
  PackageX,
  Plus,
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
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/config/permissions";
import { useAllMaterials } from "@/features/materials";
import { useCurrentUser, useProjectScope } from "@/features/profile";
import { formatCompactNumber, formatCurrency } from "@/lib/formatters";
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

function issuedValue(items, priceByCode) {
  return items.reduce((total, item) => {
    const price = priceByCode.get(item.materialCode) ?? 0;
    return total + item.issuedQuantity * price;
  }, 0);
}

export function MaterialIssuesScreen() {
  const currentUser = useCurrentUser();
  const canIssueMaterial = Boolean(
    currentUser && hasPermission(currentUser.role, "material-issues:manage"),
  );
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
  // Live catalogue prices, so an edited price on the Materials page is reflected here.
  const { data: materials = [] } = useAllMaterials();
  const priceByCode = useMemo(
    () => new Map(materials.map((material) => [material.code, material.lastPurchasePrice])),
    [materials],
  );
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
      value: issuedValue(items, priceByCode),
      unconsumedCount,
      consumedCount,
    };
  }, [items, priceByCode]);
  const showAllIssues = () => {
    setStatus(null);
    setDepartment(null);
    setSearch("");
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };
  const showStatus = (nextStatus) => {
    setStatus(nextStatus);
    setDepartment(null);
    setSearch("");
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };
  return (
    <Root>
      <PageHeader
        actions={
          canIssueMaterial ? (
            <Button asChild>
              <Link href="/material-issues/create">
                <Plus aria-hidden="true" strokeWidth={1.75} />
                Issue Material
              </Link>
            </Button>
          ) : null
        }
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
          onClick={showAllIssues}
          value={formatCompactNumber(kpis.count)}
        />
        <KpiCard
          icon={IndianRupee}
          label="Issued value (page)"
          onClick={showAllIssues}
          value={formatCurrency(kpis.value, { maximumFractionDigits: 0 })}
        />
        <KpiCard
          icon={PackageOpen}
          label="Not yet consumed"
          onClick={() => showStatus("issued")}
          tone="info"
          value={kpis.unconsumedCount}
        />
        <KpiCard
          icon={PackageX}
          label="Fully consumed"
          onClick={() => showStatus("consumed")}
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

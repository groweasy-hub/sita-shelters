"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes, CircleCheckBig, HardHat, Wrench } from "lucide-react";
import styled from "styled-components";

import { DataTable, KpiCard, KpiGrid, PageHeader } from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ALL_PROJECTS_VALUE, PROJECT_OPTIONS } from "@/config/constants";
import { formatCompactNumber } from "@/lib/formatters";
import { useProjectContextStore } from "@/stores/project-context-store";
import {
  RESOURCE_CATEGORY_OPTIONS,
  RESOURCE_STATUS_OPTIONS,
} from "../constants/resources.constants";
import { useResources } from "../hooks/use-resources";
import { resourcesColumns } from "./resources-columns";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const TableEmptyState = styled.div`
  padding: 1rem;
  text-align: center;
`;
const ALL_VALUE = "all";

export function ResourcesScreen() {
  const globalProjectId = useProjectContextStore(
    (state) => state.selectedProjectId,
  );
  const [projectId, setProjectId] = useState(globalProjectId ?? null);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([{ id: "name", desc: false }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const params = {
    projectId,
    category: category || null,
    status: status || null,
    search,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id ?? "name",
    sortDirection: sorting[0]?.desc ? "desc" : "asc",
  };
  const { data } = useResources(params);
  const router = useRouter();
  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const kpis = useMemo(
    () => ({
      total,
      deployed: items.filter(
        (item) => item.status === "assigned" || item.status === "in-use",
      ).length,
      underMaintenance: items.filter(
        (item) => item.status === "under-maintenance",
      ).length,
      available: items.filter((item) => item.status === "available").length,
    }),
    [items, total],
  );
  return (
    <Root>
      <PageHeader
        description="Reusable physical assets — machinery, equipment, water tankers, tools, scaffolding and vehicles — that move between projects repeatedly instead of being consumed like material stock."
        eyebrow="Resource planning"
        meta={
          <Badge variant="outline">
            {formatCompactNumber(total)} resources
          </Badge>
        }
        title="Resources"
      />
      <KpiGrid>
        <KpiCard icon={Boxes} label="Total resources" value={kpis.total} />
        <KpiCard
          icon={HardHat}
          label="Assigned / in use (page)"
          tone="accent"
          value={kpis.deployed}
        />
        <KpiCard
          icon={Wrench}
          label="Under maintenance (page)"
          tone="warning"
          value={kpis.underMaintenance}
        />
        <KpiCard
          icon={CircleCheckBig}
          label="Available (page)"
          tone="success"
          value={kpis.available}
        />
      </KpiGrid>
      <DataTable
        ariaLabel="Resources"
        columns={resourcesColumns}
        data={items}
        emptyState={
          <TableEmptyState>
            <Boxes aria-hidden="true" size={20} />
            <p>No resources match the current filters.</p>
          </TableEmptyState>
        }
        filters={
          <>
            <Select
              onValueChange={(value) =>
                setProjectId(value === ALL_PROJECTS_VALUE ? null : value)
              }
              value={projectId ?? ALL_PROJECTS_VALUE}
            >
              <SelectTrigger aria-label="Filter by project" size="sm">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_PROJECTS_VALUE}>All Projects</SelectItem>
                {PROJECT_OPTIONS.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) =>
                setCategory(value === ALL_VALUE ? "" : value)
              }
              value={category || ALL_VALUE}
            >
              <SelectTrigger aria-label="Filter by category" size="sm">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All categories</SelectItem>
                {RESOURCE_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) =>
                setStatus(value === ALL_VALUE ? "" : value)
              }
              value={status || ALL_VALUE}
            >
              <SelectTrigger aria-label="Filter by status" size="sm">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
                {RESOURCE_STATUS_OPTIONS.map((option) => (
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
          setProjectId(null);
          setCategory("");
          setStatus("");
          setSearch("");
        }}
        onRowClick={(row) => router.push(`/resources/${row.id}`)}
        onSearchChange={setSearch}
        onSortingChange={setSorting}
        pageCount={Math.max(1, Math.ceil(total / pagination.pageSize))}
        rowCount={total}
        search={{ placeholder: "Search asset ID, name or category" }}
        state={{ pagination, sorting }}
      />
    </Root>
  );
}

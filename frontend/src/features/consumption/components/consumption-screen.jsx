"use client";

import { useMemo, useState } from "react";
import { CalendarClock, IndianRupee, ListChecks, Tags } from "lucide-react";
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
import { CONSUMPTION_CATEGORY_OPTIONS } from "../constants/consumption.constants";
import { useConsumption } from "../hooks/use-consumption";
import { consumptionColumns } from "./consumption-columns";
import { ConsumptionTrend } from "./consumption-trend";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const MainGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  @media (min-width: 1280px) {
    grid-template-columns: minmax(0, 1fr) minmax(20rem, 0.55fr);
    align-items: start;
  }
`;

function consumedValue(items) {
  return items.reduce((total, item) => {
    const material = getMaterialByCode(item.materialCode);
    const price = material?.lastPurchasePrice ?? 0;
    return total + item.quantityConsumed * price;
  }, 0);
}
function topCategoryByCount(items) {
  const counts = new Map();
  items.forEach((item) => {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  });
  let topCategory = null;
  let topCount = 0;
  counts.forEach((count, category) => {
    if (count > topCount) {
      topCount = count;
      topCategory = category;
    }
  });
  return topCategory ?? "—";
}
function countThisWeek(items) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
  return items.filter((item) => {
    const consumedAt = new Date(item.consumedAt);
    return consumedAt >= weekAgo && consumedAt <= now;
  }).length;
}

export function ConsumptionScreen() {
  const { scopeProjectIds, isLocked, defaultProjectId } = useProjectScope();
  const globalProjectId = useProjectContextStore(
    (state) => state.selectedProjectId,
  );
  const [projectId, setProjectId] = useState(
    defaultProjectId ?? globalProjectId ?? null,
  );
  const [categoryId, setCategoryId] = useState(null);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([{ id: "consumedAt", desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const params = {
    projectId,
    search,
    categoryId,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id ?? "consumedAt",
    sortDirection: sorting[0]?.desc ? "desc" : "asc",
  };
  const { data } = useConsumption(params);
  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const kpis = useMemo(
    () => ({
      count: items.length,
      value: consumedValue(items),
      topCategory: topCategoryByCount(items),
      thisWeek: countThisWeek(items),
    }),
    [items],
  );
  return (
    <Root>
      <PageHeader
        description="What each work team actually used against the material they were issued."
        eyebrow="Site operations"
        meta={
          <Badge variant="outline">
            {formatCompactNumber(total)} consumption entries
          </Badge>
        }
        title="Consumption"
      />
      <KpiGrid>
        <KpiCard
          icon={ListChecks}
          label="Entries (page)"
          value={formatCompactNumber(kpis.count)}
        />
        <KpiCard
          icon={IndianRupee}
          label="Value consumed (page)"
          value={formatCurrency(kpis.value, { maximumFractionDigits: 0 })}
        />
        <KpiCard icon={Tags} label="Top category" value={kpis.topCategory} />
        <KpiCard
          icon={CalendarClock}
          label="Recorded this week"
          tone="info"
          value={kpis.thisWeek}
        />
      </KpiGrid>
      <MainGrid>
        <DataTable
          ariaLabel="Consumption entries"
          columns={consumptionColumns}
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
                  setCategoryId(value === "all" ? null : value)
                }
                value={categoryId ?? "all"}
              >
                <SelectTrigger aria-label="Filter by category" size="sm">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CONSUMPTION_CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
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
            setCategoryId(null);
            setSearch("");
          }}
          onSearchChange={setSearch}
          onSortingChange={setSorting}
          pageCount={Math.max(1, Math.ceil(total / pagination.pageSize))}
          rowCount={total}
          search={{ placeholder: "Search consumption #, material, activity" }}
          state={{ pagination, sorting }}
        />
        <ConsumptionTrend entries={items} />
      </MainGrid>
    </Root>
  );
}

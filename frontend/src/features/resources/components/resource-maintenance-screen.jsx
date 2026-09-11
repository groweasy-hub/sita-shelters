"use client";

import { useMemo, useState } from "react";
import { CalendarClock, IndianRupee, Wrench } from "lucide-react";
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
import { formatCompactNumber, formatCurrency } from "@/lib/formatters";
import {
  MAINTENANCE_STATUS_OPTIONS,
  MAINTENANCE_TYPE_OPTIONS,
  RESOURCE_CATEGORY_OPTIONS,
} from "../constants/resources.constants";
import { useAllResources } from "../hooks/use-resources";
import { useResourceMaintenance } from "../hooks/use-resource-maintenance";
import { resourceMaintenanceColumns } from "./resource-maintenance-columns";

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

export function ResourceMaintenanceScreen() {
  const { data: records = [] } = useResourceMaintenance();
  const { data: resources = [] } = useAllResources();
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const resourcesById = useMemo(() => {
    const map = new Map();
    resources.forEach((resource) => map.set(resource.id, resource));
    return map;
  }, [resources]);
  const rows = useMemo(() => {
    return records
      .map((record) => {
        const resource = resourcesById.get(record.resourceId);
        return {
          ...record,
          resourceName: resource?.name ?? record.resourceId,
          resourceCategory: resource?.category ?? null,
        };
      })
      .filter(
        (row) =>
          (!category || row.resourceCategory === category) &&
          (!status || row.status === status) &&
          (!type || row.type === type),
      );
  }, [records, resourcesById, category, status, type]);
  const kpis = useMemo(
    () => ({
      totalCost: rows.reduce((sum, row) => sum + row.cost, 0),
      upcomingCount: rows.filter((row) => row.status === "scheduled").length,
      breakdownCount: rows.filter((row) => row.type === "breakdown").length,
    }),
    [rows],
  );
  return (
    <Root>
      <PageHeader
        description="Scheduled service, breakdown repair and inspection events recorded across the resource register."
        eyebrow="Resource planning"
        meta={
          <Badge variant="outline">
            {formatCompactNumber(records.length)} maintenance records
          </Badge>
        }
        title="Resource Maintenance"
      />
      <KpiGrid>
        <KpiCard
          icon={IndianRupee}
          label="Total maintenance cost"
          value={formatCurrency(kpis.totalCost, { maximumFractionDigits: 0 })}
        />
        <KpiCard
          icon={CalendarClock}
          label="Scheduled upcoming"
          tone="info"
          value={kpis.upcomingCount}
        />
        <KpiCard
          icon={Wrench}
          label="Breakdown repairs"
          tone="danger"
          value={kpis.breakdownCount}
        />
      </KpiGrid>
      <DataTable
        ariaLabel="Resource maintenance"
        columns={resourceMaintenanceColumns}
        data={rows}
        emptyState={
          <TableEmptyState>
            <Wrench aria-hidden="true" size={20} />
            <p>No maintenance records match the current filters.</p>
          </TableEmptyState>
        }
        filters={
          <>
            <Select
              onValueChange={(value) =>
                setCategory(value === ALL_VALUE ? "" : value)
              }
              value={category || ALL_VALUE}
            >
              <SelectTrigger aria-label="Filter by resource category" size="sm">
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
                setType(value === ALL_VALUE ? "" : value)
              }
              value={type || ALL_VALUE}
            >
              <SelectTrigger aria-label="Filter by maintenance type" size="sm">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All types</SelectItem>
                {MAINTENANCE_TYPE_OPTIONS.map((option) => (
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
                {MAINTENANCE_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
        initialState={{ sorting: [{ id: "date", desc: true }] }}
        onResetFilters={() => {
          setCategory("");
          setStatus("");
          setType("");
        }}
        search={{ placeholder: "Search resource, type or description" }}
      />
    </Root>
  );
}

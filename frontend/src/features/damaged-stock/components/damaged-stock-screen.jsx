"use client";

import { useMemo, useState } from "react";
import { PackageX, Recycle, TrendingDown, TriangleAlert } from "lucide-react";
import styled from "styled-components";

import { DataTable, KpiCard, KpiGrid, PageHeader } from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_PROJECTS_VALUE, PROJECT_OPTIONS } from "@/config/constants";
import { inProjectScope, useProjectScope } from "@/features/profile";
import { formatCurrency } from "@/lib/formatters";
import {
  DAMAGE_RECORD_TYPE_OPTIONS,
  DAMAGE_REASON_OPTIONS,
} from "../constants/damaged-stock.constants";
import { damagedStockColumns } from "./damaged-stock-columns";
import { useDamagedStockRecords } from "../hooks/use-damaged-stock";

const Root = styled.div`
  display: grid;
  gap: 1.25rem;
`;
const Note = styled.p`
  margin: 0;
  padding: 0.875rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceMuted}66;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  line-height: 1.4rem;
`;

export function DamagedStockScreen() {
  const { scopeProjectIds, isLocked, defaultProjectId } = useProjectScope();
  const { data: rawRecords = [], isLoading } = useDamagedStockRecords();
  const records = useMemo(
    () => rawRecords.filter((record) => inProjectScope(scopeProjectIds, record.projectId)),
    [rawRecords, scopeProjectIds],
  );
  const [type, setType] = useState("all");
  const [reason, setReason] = useState("all");
  const [projectId, setProjectId] = useState(defaultProjectId ?? ALL_PROJECTS_VALUE);
  const filtered = useMemo(() => {
    return records.filter(
      (record) =>
        (type === "all" || record.type === type) &&
        (reason === "all" || record.reason === reason) &&
        (projectId === ALL_PROJECTS_VALUE || record.projectId === projectId),
    );
  }, [records, type, reason, projectId]);
  const kpis = useMemo(() => {
    const damageValue = records
      .filter((record) => record.type === "damage")
      .reduce((sum, record) => sum + record.financialValue, 0);
    const wastageValue = records
      .filter((record) => record.type === "wastage")
      .reduce((sum, record) => sum + record.financialValue, 0);
    const reasonTotals = new Map();
    records.forEach((record) => {
      reasonTotals.set(
        record.reason,
        (reasonTotals.get(record.reason) ?? 0) + record.financialValue,
      );
    });
    const topReason = [...reasonTotals.entries()].sort(
      (first, second) => second[1] - first[1],
    )[0];
    return {
      damageValue,
      wastageValue,
      topReasonLabel:
        DAMAGE_REASON_OPTIONS.find((option) => option.value === topReason?.[0])
          ?.label ?? "—",
    };
  }, [records]);
  return (
    <Root>
      <PageHeader
        description="Damaged material and construction wastage are tracked and reported separately, sourced from goods-inward QC rejections, return inspections and directly logged site incidents."
        eyebrow="Stock control"
        title="Damaged &amp; Wastage Management"
      />
      <Note>
        Damaged material (transportation, vendor defect, site handling,
        weather, storage, expiry, accidental damage) is a distinct category
        from construction wastage (offcuts and process loss). Both are logged
        here but reported separately below.
      </Note>
      <KpiGrid>
        <KpiCard
          icon={PackageX}
          label="Damaged material value"
          tone="danger"
          value={formatCurrency(kpis.damageValue, { maximumFractionDigits: 0 })}
        />
        <KpiCard
          icon={Recycle}
          label="Construction wastage value"
          tone="warning"
          value={formatCurrency(kpis.wastageValue, {
            maximumFractionDigits: 0,
          })}
        />
        <KpiCard
          icon={TrendingDown}
          label="Total incidents"
          value={records.length}
        />
        <KpiCard
          icon={TriangleAlert}
          label="Leading reason by value"
          value={kpis.topReasonLabel}
        />
      </KpiGrid>
      <DataTable
        ariaLabel="Damaged and wastage records"
        columns={damagedStockColumns}
        data={filtered}
        filters={
          <>
            <Select onValueChange={setType} value={type}>
              <SelectTrigger aria-label="Filter by type" size="sm">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {DAMAGE_RECORD_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setReason} value={reason}>
              <SelectTrigger aria-label="Filter by reason" size="sm">
                <SelectValue placeholder="All reasons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All reasons</SelectItem>
                {DAMAGE_REASON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isLocked ? null : (
              <Select onValueChange={setProjectId} value={projectId}>
                <SelectTrigger aria-label="Filter by project" size="sm">
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  {scopeProjectIds ? null : (
                    <SelectItem value={ALL_PROJECTS_VALUE}>
                      All Projects
                    </SelectItem>
                  )}
                  {(scopeProjectIds
                    ? PROJECT_OPTIONS.filter((project) =>
                        scopeProjectIds.includes(project.id),
                      )
                    : PROJECT_OPTIONS
                  ).map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </>
        }
        isLoading={isLoading}
        onResetFilters={() => {
          setType("all");
          setReason("all");
          setProjectId(defaultProjectId ?? ALL_PROJECTS_VALUE);
        }}
        search={{ placeholder: "Search material, project or remarks" }}
      />
    </Root>
  );
}

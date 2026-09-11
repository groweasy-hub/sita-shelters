"use client";

import { useMemo } from "react";

import { useAllConsumptionEntries } from "@/features/consumption";
import { getMaterialByCode } from "@/lib/mock-data/materials";
import { formatCurrency, formatQuantity } from "@/lib/formatters";
import { groupAndSum, topN } from "../lib/aggregate";
import { BarList } from "./bar-list";
import { KpiCard, KpiGrid } from "@/components/shared";
import { Activity, Boxes } from "lucide-react";
import {
  Panel,
  PanelHeader,
  PanelSubtitle,
  PanelTitle,
  ReportGrid,
} from "./report-layout";

function entryValue(entry) {
  const material = getMaterialByCode(entry.materialCode);
  return entry.quantityConsumed * (material?.lastPurchasePrice ?? 0);
}

export function ConsumptionReportTab({ projectId }) {
  const { data: allEntries = [] } = useAllConsumptionEntries();
  const entries = useMemo(
    () => (projectId ? allEntries.filter((entry) => entry.projectId === projectId) : allEntries),
    [allEntries, projectId],
  );
  const byProject = useMemo(() => {
    const totals = groupAndSum(entries, (entry) => entry.projectName, entryValue);
    return topN(totals, 8).map((entry) => ({
      label: entry.key,
      value: entry.value,
      formattedValue: formatCurrency(entry.value, { maximumFractionDigits: 0 }),
    }));
  }, [entries]);
  const byMaterial = useMemo(() => {
    const totals = groupAndSum(
      entries,
      (entry) => entry.materialName,
      (entry) => entry.quantityConsumed,
    );
    return topN(totals, 8).map((entry) => ({
      label: entry.key,
      value: entry.value,
      formattedValue: formatQuantity(entry.value, ""),
    }));
  }, [entries]);
  const totalValue = entries.reduce((sum, entry) => sum + entryValue(entry), 0);
  const thisMonthCount = entries.filter((entry) => {
    const date = new Date(entry.consumedAt);
    const now = new Date("2026-09-05T00:00:00+05:30");
    return date.getUTCFullYear() === now.getUTCFullYear() && date.getUTCMonth() === now.getUTCMonth();
  }).length;
  return (
    <ReportGrid $columns="1fr">
      <KpiGrid>
        <KpiCard icon={Activity} label="Consumption entries" value={entries.length} />
        <KpiCard
          icon={Boxes}
          label="Total value consumed"
          value={formatCurrency(totalValue, { maximumFractionDigits: 0 })}
        />
        <KpiCard label="Entries this month" value={thisMonthCount} />
      </KpiGrid>
      <ReportGrid>
        <Panel>
          <PanelHeader>
            <div>
              <PanelTitle>Consumption by project</PanelTitle>
              <PanelSubtitle>Valued at last purchase rate</PanelSubtitle>
            </div>
          </PanelHeader>
          <BarList items={byProject} tone="info" />
        </Panel>
        <Panel>
          <PanelHeader>
            <div>
              <PanelTitle>Highest-consumption materials</PanelTitle>
              <PanelSubtitle>By total quantity consumed</PanelSubtitle>
            </div>
          </PanelHeader>
          <BarList items={byMaterial} tone="success" />
        </Panel>
      </ReportGrid>
    </ReportGrid>
  );
}

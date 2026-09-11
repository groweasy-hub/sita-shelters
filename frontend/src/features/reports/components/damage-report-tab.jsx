"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PackageX, Recycle } from "lucide-react";

import { KpiCard, KpiGrid } from "@/components/shared";
import { DAMAGE_REASON_LABELS, useDamagedStockRecords } from "@/features/damaged-stock";
import { formatCurrency } from "@/lib/formatters";
import { groupAndSum, topN } from "../lib/aggregate";
import { BarList } from "./bar-list";
import {
  Panel,
  PanelHeader,
  PanelSubtitle,
  PanelTitle,
  ReportGrid,
} from "./report-layout";

export function DamageReportTab({ projectId }) {
  const { data: allRecords = [] } = useDamagedStockRecords();
  const records = useMemo(
    () => (projectId ? allRecords.filter((record) => record.projectId === projectId) : allRecords),
    [allRecords, projectId],
  );
  const damage = records.filter((record) => record.type === "damage");
  const wastage = records.filter((record) => record.type === "wastage");
  const byReason = useMemo(() => {
    const totals = groupAndSum(
      damage,
      (record) => DAMAGE_REASON_LABELS[record.reason],
      (record) => record.financialValue,
    );
    return topN(totals, 8).map((entry) => ({
      label: entry.key,
      value: entry.value,
      formattedValue: formatCurrency(entry.value, { maximumFractionDigits: 0 }),
    }));
  }, [damage]);
  const byProject = useMemo(() => {
    const totals = groupAndSum(
      records,
      (record) => record.projectName,
      (record) => record.financialValue,
    );
    return topN(totals, 8).map((entry) => ({
      label: entry.key,
      value: entry.value,
      formattedValue: formatCurrency(entry.value, { maximumFractionDigits: 0 }),
    }));
  }, [records]);
  const byWastageSource = useMemo(() => {
    const totals = groupAndSum(
      wastage,
      (record) => record.materialName,
      (record) => record.financialValue,
    );
    return topN(totals, 8).map((entry) => ({
      label: entry.key,
      value: entry.value,
      formattedValue: formatCurrency(entry.value, { maximumFractionDigits: 0 }),
    }));
  }, [wastage]);
  const damageValue = damage.reduce((sum, record) => sum + record.financialValue, 0);
  const wastageValue = wastage.reduce((sum, record) => sum + record.financialValue, 0);
  return (
    <ReportGrid $columns="1fr">
      <KpiGrid>
        <KpiCard
          icon={PackageX}
          label="Damaged material value"
          tone="danger"
          value={formatCurrency(damageValue, { maximumFractionDigits: 0 })}
        />
        <KpiCard
          icon={Recycle}
          label="Construction wastage value"
          tone="warning"
          value={formatCurrency(wastageValue, { maximumFractionDigits: 0 })}
        />
        <KpiCard label="Total incidents" value={records.length} />
      </KpiGrid>
      <ReportGrid>
        <Panel>
          <PanelHeader>
            <div>
              <PanelTitle>Damage by reason</PanelTitle>
              <PanelSubtitle>Financial value, excluding wastage</PanelSubtitle>
            </div>
          </PanelHeader>
          <BarList items={byReason} tone="danger" />
        </Panel>
        <Panel>
          <PanelHeader>
            <div>
              <PanelTitle>Damage &amp; wastage by project</PanelTitle>
              <PanelSubtitle>Combined financial value</PanelSubtitle>
            </div>
          </PanelHeader>
          <BarList items={byProject} tone="warning" />
        </Panel>
      </ReportGrid>
      <Panel>
        <PanelHeader>
          <div>
            <PanelTitle>Wastage by material</PanelTitle>
            <PanelSubtitle>Where construction wastage concentrates</PanelSubtitle>
          </div>
          <Link href="/inventory/damaged">View full log</Link>
        </PanelHeader>
        <BarList items={byWastageSource} />
      </Panel>
    </ReportGrid>
  );
}

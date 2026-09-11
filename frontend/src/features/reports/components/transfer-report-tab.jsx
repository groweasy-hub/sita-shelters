"use client";

import { useMemo } from "react";
import { ArrowLeftRight, Clock } from "lucide-react";

import { KpiCard, KpiGrid } from "@/components/shared";
import { useAllStockTransfers } from "@/features/stock-transfers";
import { groupAndSum, topN } from "../lib/aggregate";
import { BarList } from "./bar-list";
import {
  Panel,
  PanelHeader,
  PanelSubtitle,
  PanelTitle,
  ReportGrid,
  SimpleTable,
} from "./report-layout";

function daysBetween(start, end) {
  return (new Date(end).getTime() - new Date(start).getTime()) / 86_400_000;
}

export function TransferReportTab({ projectId }) {
  const { data: allTransfers = [] } = useAllStockTransfers();
  const transfers = useMemo(
    () =>
      projectId
        ? allTransfers.filter(
            (transfer) =>
              transfer.sourceProjectId === projectId ||
              transfer.destinationProjectId === projectId,
          )
        : allTransfers,
    [allTransfers, projectId],
  );
  const byRoute = useMemo(() => {
    const totals = groupAndSum(
      transfers,
      (transfer) => `${transfer.sourceProjectName} → ${transfer.destinationProjectName}`,
      () => 1,
    );
    return topN(totals, 10);
  }, [transfers]);
  const byMaterial = useMemo(() => {
    const totals = groupAndSum(transfers, (transfer) => transfer.materialName, () => 1);
    return topN(totals, 8).map((entry) => ({
      label: entry.key,
      value: entry.value,
      formattedValue: `${entry.value} transfer${entry.value === 1 ? "" : "s"}`,
    }));
  }, [transfers]);
  const received = transfers.filter((transfer) => transfer.status === "received" && transfer.receivedAt);
  const averageDuration =
    received.reduce((sum, transfer) => sum + daysBetween(transfer.requestedAt, transfer.receivedAt), 0) /
    Math.max(received.length, 1);
  return (
    <ReportGrid $columns="1fr">
      <KpiGrid>
        <KpiCard icon={ArrowLeftRight} label="Total transfers" value={transfers.length} />
        <KpiCard
          icon={Clock}
          label="Average request-to-receipt time"
          value={received.length ? `${averageDuration.toFixed(1)} days` : "—"}
        />
        <KpiCard label="Completed transfers" value={received.length} />
      </KpiGrid>
      <ReportGrid>
        <Panel>
          <PanelHeader>
            <div>
              <PanelTitle>Source → destination routes</PanelTitle>
              <PanelSubtitle>Most frequent project pairs</PanelSubtitle>
            </div>
          </PanelHeader>
          <SimpleTable>
            <thead>
              <tr>
                <th scope="col">Route</th>
                <th className="numeric" scope="col">
                  Transfers
                </th>
              </tr>
            </thead>
            <tbody>
              {byRoute.map((row) => (
                <tr key={row.key}>
                  <td>{row.key}</td>
                  <td className="numeric">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </SimpleTable>
        </Panel>
        <Panel>
          <PanelHeader>
            <div>
              <PanelTitle>Most-transferred materials</PanelTitle>
              <PanelSubtitle>By number of transfer records</PanelSubtitle>
            </div>
          </PanelHeader>
          <BarList items={byMaterial} tone="info" />
        </Panel>
      </ReportGrid>
    </ReportGrid>
  );
}

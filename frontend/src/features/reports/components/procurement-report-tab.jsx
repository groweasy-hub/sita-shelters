"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FileClock, IndianRupee } from "lucide-react";

import { KpiCard, KpiGrid, StatusBadge } from "@/components/shared";
import {
  calculateDeliveryProgress,
  calculatePurchaseOrderValue,
  useAllPurchaseOrders,
} from "@/features/procurement";
import { formatCurrency } from "@/lib/formatters";
import { getProjectName } from "@/lib/mock-data/projects";
import { getVendorById } from "@/lib/mock-data/vendors";
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

export function ProcurementReportTab({ projectId }) {
  const { data: allOrders = [] } = useAllPurchaseOrders();
  const orders = useMemo(
    () => (projectId ? allOrders.filter((order) => order.projectId === projectId) : allOrders),
    [allOrders, projectId],
  );
  const byVendor = useMemo(() => {
    const totals = groupAndSum(
      orders,
      (order) => getVendorById(order.vendorId)?.name ?? order.vendorId,
      calculatePurchaseOrderValue,
    );
    return topN(totals, 8).map((entry) => ({
      label: entry.key,
      value: entry.value,
      formattedValue: formatCurrency(entry.value, { maximumFractionDigits: 0 }),
    }));
  }, [orders]);
  const byMaterial = useMemo(() => {
    const materialTotals = new Map();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const value = item.orderedQuantity * item.unitPrice * (1 + item.taxPercent / 100);
        materialTotals.set(
          item.materialName,
          (materialTotals.get(item.materialName) ?? 0) + value,
        );
      });
    });
    return topN(
      [...materialTotals.entries()]
        .map(([label, value]) => ({ label, value }))
        .sort((first, second) => second.value - first.value),
      8,
    ).map((entry) => ({
      ...entry,
      formattedValue: formatCurrency(entry.value, { maximumFractionDigits: 0 }),
    }));
  }, [orders]);
  const pendingDeliveries = useMemo(
    () =>
      orders.filter(
        (order) => order.status === "sent" || order.status === "partially-supplied",
      ),
    [orders],
  );
  const totalValue = orders.reduce((sum, order) => sum + calculatePurchaseOrderValue(order), 0);
  return (
    <ReportGrid $columns="1fr">
      <KpiGrid>
        <KpiCard icon={IndianRupee} label="Total order value" value={formatCurrency(totalValue, { maximumFractionDigits: 0 })} />
        <KpiCard label="Purchase orders" value={orders.length} />
        <KpiCard icon={FileClock} label="Pending deliveries" tone="warning" value={pendingDeliveries.length} />
      </KpiGrid>
      <ReportGrid>
        <Panel>
          <PanelHeader>
            <div>
              <PanelTitle>Vendor-wise purchases</PanelTitle>
              <PanelSubtitle>Total order value, tax included</PanelSubtitle>
            </div>
          </PanelHeader>
          <BarList items={byVendor} tone="info" />
        </Panel>
        <Panel>
          <PanelHeader>
            <div>
              <PanelTitle>Material purchase history</PanelTitle>
              <PanelSubtitle>Top materials by ordered value</PanelSubtitle>
            </div>
          </PanelHeader>
          <BarList items={byMaterial} />
        </Panel>
      </ReportGrid>
      <Panel>
        <PanelHeader>
          <div>
            <PanelTitle>Pending deliveries</PanelTitle>
            <PanelSubtitle>Purchase orders still awaiting full supply</PanelSubtitle>
          </div>
          <Link href="/procurement/purchase-orders">View all</Link>
        </PanelHeader>
        <SimpleTable>
          <thead>
            <tr>
              <th scope="col">PO</th>
              <th scope="col">Vendor</th>
              <th scope="col">Project</th>
              <th className="numeric" scope="col">
                Deliveries
              </th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {topN(pendingDeliveries, 10).map((order) => {
              const progress = calculateDeliveryProgress(order);
              return (
                <tr key={order.id}>
                  <td>
                    <Link href={`/procurement/purchase-orders/${order.id}`}>{order.id}</Link>
                  </td>
                  <td>{getVendorById(order.vendorId)?.name ?? order.vendorId}</td>
                  <td>{getProjectName(order.projectId)}</td>
                  <td className="numeric">
                    {progress.delivered}/{progress.total}
                  </td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </SimpleTable>
      </Panel>
    </ReportGrid>
  );
}

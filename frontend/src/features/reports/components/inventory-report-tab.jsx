"use client";

import { useMemo } from "react";
import Link from "next/link";

import { StatusBadge } from "@/components/shared";
import { useAllInventoryItems } from "@/features/inventory";
import { formatCurrency, formatQuantity } from "@/lib/formatters";
import { getMaterialByCode } from "@/lib/mock-data/materials";
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

function itemValue(item) {
  const material = getMaterialByCode(item.materialCode);
  return item.availableQuantity * (material?.lastPurchasePrice ?? 0);
}

export function InventoryReportTab({ projectId }) {
  const { data: allItems = [] } = useAllInventoryItems();
  const items = useMemo(
    () => (projectId ? allItems.filter((item) => item.projectId === projectId) : allItems),
    [allItems, projectId],
  );
  const byProject = useMemo(() => {
    const entries = groupAndSum(items, (item) => item.projectName, itemValue);
    return entries.map((entry) => ({
      ...entry,
      lowStockCount: items.filter(
        (item) =>
          item.projectName === entry.key &&
          (item.status === "low-stock" || item.availableQuantity < item.reorderLevel),
      ).length,
    }));
  }, [items]);
  const byMaterial = useMemo(() => {
    const entries = groupAndSum(items, (item) => item.materialName, itemValue);
    return topN(entries, 8).map((entry) => ({
      label: entry.key,
      value: entry.value,
      formattedValue: formatCurrency(entry.value, { maximumFractionDigits: 0 }),
    }));
  }, [items]);
  const lowStock = useMemo(
    () =>
      topN(
        items
          .filter((item) => item.availableQuantity < item.reorderLevel)
          .sort(
            (first, second) =>
              first.availableQuantity / first.reorderLevel -
              second.availableQuantity / second.reorderLevel,
          ),
        8,
      ),
    [items],
  );
  const deadStock = useMemo(
    () =>
      topN(
        items.filter(
          (item) => item.availableQuantity === 0 && item.status !== "in-transit",
        ),
        8,
      ),
    [items],
  );
  return (
    <ReportGrid>
      <Panel>
        <PanelHeader>
          <div>
            <PanelTitle>Stock valuation by project</PanelTitle>
            <PanelSubtitle>Available stock, priced at last purchase rate</PanelSubtitle>
          </div>
        </PanelHeader>
        <SimpleTable>
          <thead>
            <tr>
              <th scope="col">Project</th>
              <th className="numeric" scope="col">
                Stock value
              </th>
              <th className="numeric" scope="col">
                Low stock
              </th>
            </tr>
          </thead>
          <tbody>
            {byProject.map((row) => (
              <tr key={row.key}>
                <td>{row.key}</td>
                <td className="numeric">
                  {formatCurrency(row.value, { maximumFractionDigits: 0 })}
                </td>
                <td className="numeric">{row.lowStockCount}</td>
              </tr>
            ))}
          </tbody>
        </SimpleTable>
      </Panel>
      <Panel>
        <PanelHeader>
          <div>
            <PanelTitle>Highest-value materials</PanelTitle>
            <PanelSubtitle>Top 8 by current stock value</PanelSubtitle>
          </div>
        </PanelHeader>
        <BarList items={byMaterial} />
      </Panel>
      <Panel>
        <PanelHeader>
          <div>
            <PanelTitle>Low stock</PanelTitle>
            <PanelSubtitle>Furthest below reorder level</PanelSubtitle>
          </div>
          <Link href="/inventory/low-stock">View all</Link>
        </PanelHeader>
        <SimpleTable>
          <thead>
            <tr>
              <th scope="col">Material</th>
              <th scope="col">Project</th>
              <th className="numeric" scope="col">
                Available
              </th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {lowStock.map((item) => (
              <tr key={item.id}>
                <td>{item.materialName}</td>
                <td>{item.projectName}</td>
                <td className="numeric">
                  {formatQuantity(item.availableQuantity, item.unit)}
                </td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </SimpleTable>
      </Panel>
      <Panel>
        <PanelHeader>
          <div>
            <PanelTitle>Dead stock</PanelTitle>
            <PanelSubtitle>Zero available quantity, not in transit</PanelSubtitle>
          </div>
        </PanelHeader>
        <SimpleTable>
          <thead>
            <tr>
              <th scope="col">Material</th>
              <th scope="col">Project</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {deadStock.map((item) => (
              <tr key={item.id}>
                <td>{item.materialName}</td>
                <td>{item.projectName}</td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </SimpleTable>
      </Panel>
    </ReportGrid>
  );
}

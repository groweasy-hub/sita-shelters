"use client";

import Link from "next/link";
import { ArrowRightLeft, PackageCheck, ShoppingCart } from "lucide-react";
import styled from "styled-components";

import { Button } from "@/components/ui/button";
import { useAllInventoryItems } from "@/features/inventory";
import { formatQuantity } from "@/lib/formatters";
import { getProjectName } from "@/lib/mock-data/projects";

const Callout = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  border: 1px solid
    ${({ theme, $tone }) =>
      $tone === "success"
        ? theme.colors.success
        : $tone === "warning"
          ? theme.colors.warning
          : theme.colors.info}40;
  background: ${({ theme, $tone }) =>
    $tone === "success"
      ? theme.colors.success
      : $tone === "warning"
        ? theme.colors.warning
        : theme.colors.info}0d;
  font-size: 0.8125rem;
`;
const Copy = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.foreground};
  svg {
    width: 1rem;
    height: 1rem;
    flex: 0 0 auto;
    color: ${({ theme, $tone }) =>
      $tone === "success"
        ? theme.colors.success
        : $tone === "warning"
          ? theme.colors.warning
          : theme.colors.info};
  }
`;

/**
 * Cross-project stock intelligence shared by the indent create form and the
 * indent detail "Stock check" panel. Looks up the same unpaginated
 * inventory read model the inventory feature exposes publicly and never
 * duplicates its data.
 */
export function StockRecommendation({ materialCode, projectId, requestedQuantity, unit }) {
  const { data: inventoryItems = [] } = useAllInventoryItems();
  if (!materialCode || !projectId || !requestedQuantity || requestedQuantity <= 0) {
    return null;
  }
  const matchingItems = inventoryItems.filter(
    (item) => item.materialCode === materialCode,
  );
  const currentProjectAvailable = matchingItems
    .filter((item) => item.projectId === projectId)
    .reduce((sum, item) => sum + item.availableQuantity, 0);
  if (currentProjectAvailable >= requestedQuantity) {
    return (
      <Callout $tone="success">
        <Copy $tone="success">
          <PackageCheck aria-hidden="true" strokeWidth={1.75} />
          Sufficient stock on hand at {getProjectName(projectId)}:{" "}
          {formatQuantity(currentProjectAvailable, unit)} available.
        </Copy>
      </Callout>
    );
  }
  const shortfall = requestedQuantity - currentProjectAvailable;
  const surplusElsewhere = matchingItems
    .filter((item) => item.projectId !== projectId && item.availableQuantity > 0)
    .sort((first, second) => second.availableQuantity - first.availableQuantity);
  const bestMatch = surplusElsewhere.find(
    (item) => item.availableQuantity >= shortfall,
  );
  if (bestMatch) {
    return (
      <Callout $tone="info">
        <Copy $tone="info">
          <ArrowRightLeft aria-hidden="true" strokeWidth={1.75} />
          Recommended: transfer {formatQuantity(shortfall, unit)} from{" "}
          {bestMatch.projectName} ({formatQuantity(bestMatch.availableQuantity, unit)}{" "}
          available there).
        </Copy>
        <Button asChild size="sm" variant="outline">
          <Link href="/stock-transfers">Raise transfer request</Link>
        </Button>
      </Callout>
    );
  }
  return (
    <Callout $tone="warning">
      <Copy $tone="warning">
        <ShoppingCart aria-hidden="true" strokeWidth={1.75} />
        No project holds enough surplus stock ({formatQuantity(shortfall, unit)} short).
        Will require procurement.
      </Copy>
    </Callout>
  );
}

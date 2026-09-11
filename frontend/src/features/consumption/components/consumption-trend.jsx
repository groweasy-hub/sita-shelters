"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import styled from "styled-components";

import { formatQuantity } from "@/lib/formatters";

const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const PanelTitle = styled.h2`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 650;
`;
const PanelSubtitle = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const Icon = styled(TrendingUp)`
  color: ${({ theme }) => theme.colors.mutedForeground};
  width: 1.0625rem;
  height: 1.0625rem;
`;
const Rows = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
`;
const Row = styled.div`
  display: grid;
  gap: 0.375rem;
`;
const RowLabel = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.8125rem;
`;
const MaterialName = styled.span`
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const RowValue = styled.span`
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
`;
const Track = styled.div`
  height: 0.5rem;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.muted};
`;
const Fill = styled.div`
  width: ${({ $percent }) => $percent}%;
  height: 100%;
  border-radius: inherit;
  background: ${({ theme }) => theme.colors.primary};
`;
const Empty = styled.p`
  margin: 0;
  padding: 1.25rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
`;

/** Plain styled-components bar list — no charting library, per architecture rules. */
export function ConsumptionTrend({ entries }) {
  const topMaterials = useMemo(() => {
    const totals = new Map();
    entries.forEach((entry) => {
      const existing = totals.get(entry.materialCode);
      if (existing) {
        existing.quantity += entry.quantityConsumed;
      } else {
        totals.set(entry.materialCode, {
          materialCode: entry.materialCode,
          materialName: entry.materialName,
          unit: entry.unit,
          quantity: entry.quantityConsumed,
        });
      }
    });
    return [...totals.values()]
      .sort((first, second) => second.quantity - first.quantity)
      .slice(0, 5);
  }, [entries]);
  const maxQuantity = topMaterials[0]?.quantity ?? 0;
  return (
    <Panel aria-labelledby="consumption-trend-heading">
      <PanelHeader>
        <div>
          <PanelTitle id="consumption-trend-heading">
            Consumption trend
          </PanelTitle>
          <PanelSubtitle>Top 5 materials by total quantity used</PanelSubtitle>
        </div>
        <Icon aria-hidden="true" />
      </PanelHeader>
      {topMaterials.length ? (
        <Rows>
          {topMaterials.map((material) => (
            <Row key={material.materialCode}>
              <RowLabel>
                <MaterialName>{material.materialName}</MaterialName>
                <RowValue>
                  {formatQuantity(material.quantity, material.unit)}
                </RowValue>
              </RowLabel>
              <Track>
                <Fill
                  $percent={
                    maxQuantity > 0
                      ? (material.quantity / maxQuantity) * 100
                      : 0
                  }
                />
              </Track>
            </Row>
          ))}
        </Rows>
      ) : (
        <Empty>No consumption recorded for the current filters.</Empty>
      )}
    </Panel>
  );
}

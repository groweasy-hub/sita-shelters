"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import styled from "styled-components";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { useAllInventoryItems } from "@/features/inventory";
import { formatQuantity } from "@/lib/formatters";
import { getMaterialByCode } from "@/lib/mock-data/materials";

const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const HeaderIcon = styled.span`
  display: grid;
  width: 1.75rem;
  height: 1.75rem;
  place-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accentForeground};
  svg {
    width: 0.9375rem;
    height: 0.9375rem;
  }
`;
const Title = styled.h2`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 650;
`;
const Subtitle = styled.p`
  margin: 0.125rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8125rem;
  &:last-child {
    border-bottom: 0;
  }
`;
const Flow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  svg {
    width: 0.875rem;
    height: 0.875rem;
    color: ${({ theme }) => theme.colors.mutedForeground};
    flex: 0 0 auto;
  }
`;
const MaterialLink = styled(Link)`
  font-weight: 650;
  color: ${({ theme }) => theme.colors.foreground};
`;
const Note = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
`;

/**
 * Cross-project transfer intelligence: for every material, finds projects
 * sitting on surplus (well above reorder level) and projects running short
 * (below reorder level) and recommends an internal transfer instead of a
 * fresh purchase. This is a read-only recommendation layer over inventory —
 * it never mutates stock.
 */
function computeRecommendations(inventoryItems) {
  const byMaterial = new Map();
  inventoryItems.forEach((item) => {
    if (!byMaterial.has(item.materialCode)) {
      byMaterial.set(item.materialCode, []);
    }
    byMaterial.get(item.materialCode).push(item);
  });
  const recommendations = [];
  byMaterial.forEach((rows, materialCode) => {
    const surplus = rows
      .filter((row) => row.availableQuantity > row.reorderLevel * 1.6)
      .sort((first, second) => second.availableQuantity - first.availableQuantity);
    const shortage = rows
      .filter((row) => row.availableQuantity < row.reorderLevel)
      .sort((first, second) => first.availableQuantity - second.availableQuantity);
    if (surplus.length && shortage.length) {
      const source = surplus[0];
      const target = shortage[0];
      if (source.projectId === target.projectId) return;
      const transferable = Math.round(
        Math.min(
          source.availableQuantity - source.reorderLevel,
          target.reorderLevel - target.availableQuantity,
        ) * 100,
      ) / 100;
      if (transferable > 0) {
        recommendations.push({
          materialCode,
          materialName: target.materialName,
          unit: target.unit,
          from: source,
          to: target,
          transferable,
        });
      }
    }
  });
  return recommendations
    .sort((first, second) => second.transferable - first.transferable)
    .slice(0, 6);
}

export function MaterialIntelligencePanel() {
  const { data: inventoryItems = [] } = useAllInventoryItems();
  const recommendations = useMemo(
    () => computeRecommendations(inventoryItems),
    [inventoryItems],
  );
  return (
    <Panel>
      <Header>
        <HeaderIcon>
          <Sparkles aria-hidden="true" strokeWidth={1.8} />
        </HeaderIcon>
        <div>
          <Title>Material intelligence</Title>
          <Subtitle>
            Surplus in one project matched against shortage in another —
            transfer instead of purchasing.
          </Subtitle>
        </div>
      </Header>
      {recommendations.length ? (
        recommendations.map((recommendation) => {
          const material = getMaterialByCode(recommendation.materialCode);
          return (
            <Row key={`${recommendation.materialCode}:${recommendation.to.projectId}`}>
              <Flow>
                {material ? (
                  <MaterialLink href={`/materials/${material.id}`}>
                    {recommendation.materialName}
                  </MaterialLink>
                ) : (
                  <strong>{recommendation.materialName}</strong>
                )}
                <Note>
                  {formatQuantity(recommendation.transferable, recommendation.unit)}
                </Note>
                <Badge variant="outline">{recommendation.from.projectName}</Badge>
                <ArrowRight aria-hidden="true" />
                <Badge variant="warning">{recommendation.to.projectName}</Badge>
              </Flow>
              <Note>
                Avoids a fresh purchase for {recommendation.to.projectName}
              </Note>
            </Row>
          );
        })
      ) : (
        <EmptyState
          compact
          description="No cross-project surplus currently matches a shortage."
          title="No recommendations right now"
        />
      )}
    </Panel>
  );
}

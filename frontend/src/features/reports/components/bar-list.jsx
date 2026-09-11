"use client";

import styled from "styled-components";

import { EmptyState } from "@/components/feedback/empty-state";

const List = styled.div`
  display: grid;
  gap: 0.875rem;
  padding: 1.25rem;
`;
const Row = styled.div`
  display: grid;
  gap: 0.375rem;
`;
const Labels = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.8125rem;
`;
const Name = styled.span`
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const Value = styled.span`
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.mutedForeground};
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
  background: ${({ theme, $tone }) =>
    $tone ? theme.colors[$tone] : theme.colors.primary};
`;

/** A dependency-free "top N" bar visualization — no charting library. */
export function BarList({ emptyLabel = "No data yet", items, tone }) {
  if (!items.length) {
    return <EmptyState compact description={emptyLabel} title="Nothing to show" />;
  }
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <List>
      {items.map((item) => (
        <Row key={item.label}>
          <Labels>
            <Name>{item.label}</Name>
            <Value>{item.formattedValue}</Value>
          </Labels>
          <Track>
            <Fill $percent={(item.value / max) * 100} $tone={tone} />
          </Track>
        </Row>
      ))}
    </List>
  );
}

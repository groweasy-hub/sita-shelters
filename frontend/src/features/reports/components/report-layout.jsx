"use client";

import styled from "styled-components";

export const ReportGrid = styled.div`
  display: grid;
  gap: 1.25rem;
  @media (min-width: 1024px) {
    grid-template-columns: ${({ $columns }) => $columns ?? "repeat(2, 1fr)"};
  }
`;
export const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
export const PanelHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
export const PanelTitle = styled.h3`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 650;
`;
export const PanelSubtitle = styled.p`
  margin: 0.125rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
export const SimpleTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
  th,
  td {
    padding: 0.625rem 1.25rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
  th {
    color: ${({ theme }) => theme.colors.mutedForeground};
    font-size: 0.7rem;
    font-weight: 650;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  tbody tr:last-child td {
    border-bottom: 0;
  }
  td.numeric,
  th.numeric {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
`;

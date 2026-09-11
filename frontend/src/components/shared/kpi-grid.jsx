"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import styled from "styled-components";

const Grid = styled.section`
  display: grid;
  gap: 1px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.border};
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
`;
const Card = styled.article`
  padding: 1.25rem;
  background: ${({ theme }) => theme.colors.card};
  ${({ $onClick }) => ($onClick ? "cursor: pointer;" : "")}
`;
const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
`;
const Label = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 550;
`;
const IconFrame = styled.span`
  display: inline-flex;
  color: ${({ $tone, theme }) =>
    $tone ? theme.colors[$tone] : theme.colors.mutedForeground};
  svg {
    width: 1.0625rem;
    height: 1.0625rem;
  }
`;
const Value = styled.p`
  margin: 1.25rem 0 0;
  font-size: 1.5rem;
  font-weight: 650;
  letter-spacing: -0.035em;
`;
const Note = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  svg {
    width: 0.8125rem;
    height: 0.8125rem;
  }
`;
const Up = styled(ArrowUpRight)`
  color: ${({ theme }) => theme.colors.success};
`;
const Down = styled(ArrowDownRight)`
  color: ${({ theme }) => theme.colors.warning};
`;

export function KpiGrid({ children, ...props }) {
  return <Grid {...props}>{children}</Grid>;
}

export function KpiCard({
  direction,
  icon: Icon,
  label,
  note,
  onClick,
  tone,
  value,
  ...props
}) {
  return (
    <Card
      $onClick={Boolean(onClick)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      <Top>
        <Label>{label}</Label>
        {Icon ? (
          <IconFrame $tone={tone}>
            <Icon aria-hidden="true" strokeWidth={1.7} />
          </IconFrame>
        ) : null}
      </Top>
      <Value>{value}</Value>
      {note ? (
        <Note>
          {direction === "up" ? (
            <Up aria-hidden="true" />
          ) : direction === "down" ? (
            <Down aria-hidden="true" />
          ) : null}
          {note}
        </Note>
      ) : null}
    </Card>
  );
}

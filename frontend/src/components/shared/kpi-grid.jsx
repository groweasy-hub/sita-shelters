"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import styled from "styled-components";

const Grid = styled.section`
  display: grid;
  gap: 1px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.border};
  grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  }
`;
const Card = styled.article`
  position: relative;
  min-width: 0;
  padding: 1rem;
  @media (min-width: 640px) {
    padding: 1.25rem;
  }
  background: ${({ theme }) => theme.colors.card};
  color: inherit;
  text-decoration: none;
  ${({ $interactive }) => ($interactive ? "cursor: pointer;" : "")}
  ${({ $interactive, theme }) =>
    $interactive
      ? `
        transition:
          background-color 150ms ease,
          box-shadow 150ms ease,
          transform 150ms ease;
        &:hover {
          background: ${theme.colors.muted};
          box-shadow: inset 0 0 0 1px ${theme.colors.border};
        }
        &:active {
          transform: translateY(1px);
        }
        &:focus-visible {
          outline: 2px solid ${theme.colors.ring};
          outline-offset: -2px;
        }
      `
      : ""}
`;
const ActionCue = styled.span`
  position: absolute;
  right: 0.875rem;
  bottom: 0.875rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.mutedForeground};
  background: ${({ theme }) => theme.colors.surface};
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
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
  margin: 0.75rem 0 0;
  font-size: 1.25rem;
  overflow-wrap: anywhere;
  @media (min-width: 640px) {
    margin-top: 1.25rem;
    font-size: 1.5rem;
  }
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
  href,
  icon: Icon,
  label,
  note,
  onClick,
  tone,
  value,
  ...props
}) {
  const interactive = Boolean(href || onClick);
  const handleKeyDown = (event) => {
    if (!onClick || href) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick(event);
    }
  };
  const cardProps = href
    ? { as: Link, href }
    : {
        onClick,
        onKeyDown: handleKeyDown,
        role: onClick ? "button" : undefined,
        tabIndex: onClick ? 0 : undefined,
      };
  return (
    <Card
      $interactive={interactive}
      aria-label={interactive ? `View ${label}` : undefined}
      title={interactive ? `View ${label}` : undefined}
      {...cardProps}
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
      {interactive ? (
        <ActionCue aria-hidden="true">
          <ArrowRight strokeWidth={1.8} />
        </ActionCue>
      ) : null}
    </Card>
  );
}

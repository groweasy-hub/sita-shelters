"use client";

import { ChevronDown, Circle, CornerDownRight, ShieldCheck, ShieldX } from "lucide-react";
import styled, { css } from "styled-components";

import { ROLE_LABELS, getPermissionActionLabel } from "@/config/permissions";

const stateConfig = {
  granted: { label: "Granted Directly", icon: ShieldCheck, tone: "success" },
  inherited: { label: "Inherited", icon: CornerDownRight, tone: "info" },
  restricted: { label: "Restricted by Administrator", icon: ShieldX, tone: "danger" },
  unavailable: { label: "Not Available", icon: Circle, tone: "muted" },
};
const toneStyles = {
  success: css`
    color: ${({ theme }) => theme.colors.success};
  `,
  info: css`
    color: ${({ theme }) => theme.colors.info};
  `,
  danger: css`
    color: ${({ theme }) => theme.colors.danger};
  `,
  muted: css`
    color: ${({ theme }) => theme.colors.mutedForeground};
  `,
};
const State = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  ${({ $tone }) => toneStyles[$tone]}
  svg {
    width: 0.8125rem;
    height: 0.8125rem;
    flex: 0 0 auto;
  }
`;

/** Renders one of "granted" | "inherited" | "restricted" | "unavailable". */
export function PermissionStateBadge({ resolution, ...props }) {
  const config = stateConfig[resolution.state] ?? stateConfig.unavailable;
  const Icon = config.icon;
  const label =
    resolution.state === "inherited" && resolution.from
      ? `Inherited from ${ROLE_LABELS[resolution.from] ?? resolution.from}`
      : config.label;
  return (
    <State $tone={config.tone} {...props}>
      <Icon aria-hidden="true" />
      {label}
    </State>
  );
}

const Details = styled.details`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  &:first-of-type {
    border-top: 0;
  }
  &[open] > summary svg:last-child {
    transform: rotate(180deg);
  }
`;
const Summary = styled.summary`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  cursor: pointer;
  list-style: none;
  &::-webkit-details-marker {
    display: none;
  }
`;
const SummaryLeft = styled.span`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.84375rem;
  font-weight: 650;
  svg:first-child {
    width: 0.9375rem;
    height: 0.9375rem;
    color: ${({ theme }) => theme.colors.mutedForeground};
  }
`;
const SummaryRight = styled.span`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-weight: 500;
  svg:last-child {
    width: 1rem;
    height: 1rem;
    transition: transform 150ms ease;
  }
`;
const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 0 1.25rem 1rem 3.125rem;
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.8125rem;
`;

/** One collapsible module category in the Module Permissions panel. */
export function PermissionGroup({
  group,
  granted = 0,
  icon: Icon,
  open = false,
  resolvePermission,
}) {
  return (
    <Details open={open}>
      <Summary>
        <SummaryLeft>
          {Icon ? <Icon aria-hidden="true" strokeWidth={1.75} /> : null}
          {group.label}
        </SummaryLeft>
        <SummaryRight>
          {granted} of {group.permissions.length} granted
          <ChevronDown aria-hidden="true" />
        </SummaryRight>
      </Summary>
      <Rows>
        {group.permissions.map((permission) => (
          <Row key={permission}>
            <span>{getPermissionActionLabel(permission)}</span>
            <PermissionStateBadge resolution={resolvePermission(permission)} />
          </Row>
        ))}
      </Rows>
    </Details>
  );
}

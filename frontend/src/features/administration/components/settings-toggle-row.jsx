"use client";

import styled from "styled-components";

import { Badge } from "@/components/ui/badge";

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child {
    border-bottom: 0;
  }
`;
const Copy = styled.div`
  min-width: 0;
`;
const Label = styled.p`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
`;
const Description = styled.p`
  margin: 0.125rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const Track = styled.span`
  display: inline-flex;
  width: 2.25rem;
  height: 1.25rem;
  flex: 0 0 auto;
  align-items: center;
  padding: 0.125rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $on, theme }) =>
    $on ? theme.colors.success : theme.colors.muted};
  opacity: 0.7;
  cursor: not-allowed;
  transition: background 150ms ease;
`;
const Thumb = styled.span`
  width: 1rem;
  height: 1rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.card};
  transform: translateX(${({ $on }) => ($on ? "1rem" : "0")});
  transition: transform 150ms ease;
`;
const Control = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
`;

/** Read-only, presentation-only toggle row: no state persistence exists yet. */
export function SettingsToggleRow({ description, enabled, label }) {
  return (
    <Row>
      <Copy>
        <Label>{label}</Label>
        {description ? <Description>{description}</Description> : null}
      </Copy>
      <Control>
        <Badge variant="outline">{enabled ? "Enabled" : "Disabled"}</Badge>
        <Track
          $on={enabled}
          aria-checked={enabled}
          aria-disabled="true"
          role="switch"
        >
          <Thumb $on={enabled} />
        </Track>
      </Control>
    </Row>
  );
}

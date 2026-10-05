"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import styled from "styled-components";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Bar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;
const Group = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
`;
const Label = styled.span`
  display: inline-flex;
  height: 2rem;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.25rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  svg {
    width: 1rem;
    height: 1rem;
  }
`;
const Actions = styled.div`
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
  @media (min-width: 1024px) {
    justify-content: flex-end;
  }
`;

export function FilterBar({
  actions,
  activeFilterCount = 0,
  children,
  clearDisabled = false,
  clearLabel = "Reset filters",
  leading,
  onClear,
  ...props
}) {
  return (
    <Bar aria-label="Table filters" role="group" {...props}>
      <Group>
        {leading ?? (
          <Label>
            <SlidersHorizontal aria-hidden="true" strokeWidth={1.75} />
            Filters
          </Label>
        )}
        {activeFilterCount > 0 ? (
          <Badge
            aria-label={`${activeFilterCount} active filters`}
            variant="secondary"
          >
            {activeFilterCount}
          </Badge>
        ) : null}
        {children}
      </Group>
      {onClear || actions ? (
        <Actions>
          {onClear ? (
            <Button
              disabled={clearDisabled || activeFilterCount === 0}
              onClick={onClear}
              size="sm"
              variant="ghost"
            >
              <RotateCcw aria-hidden="true" />
              {clearLabel}
            </Button>
          ) : null}
          {actions}
        </Actions>
      ) : null}
    </Bar>
  );
}

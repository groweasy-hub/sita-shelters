"use client";

import { Inbox } from "lucide-react";
import styled from "styled-components";

const State = styled.div`
  display: flex;
  min-height: ${({ $compact }) => ($compact ? "8rem" : "16rem")};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ $compact }) => ($compact ? "1.5rem" : "2.5rem")} 1.5rem;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceMuted}66;
  text-align: center;
`;

const IconFrame = styled.span`
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 1rem;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.mutedForeground};
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;
const Title = styled.h2`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 650;
`;
const Description = styled.div`
  max-width: 28rem;
  margin-top: 0.25rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.875rem;
  line-height: 1.5rem;
`;
const Action = styled.div`
  margin-top: 1.25rem;
`;

export function EmptyState({
  action,
  compact = false,
  description = "There is no information to display yet.",
  icon,
  title = "No results found",
  ...props
}) {
  return (
    <State $compact={compact} {...props}>
      <IconFrame>
        {icon ?? <Inbox aria-hidden="true" strokeWidth={1.75} />}
      </IconFrame>
      <Title>{title}</Title>
      {description ? <Description>{description}</Description> : null}
      {action ? <Action>{action}</Action> : null}
    </State>
  );
}

"use client";

import { CircleAlert, RefreshCw } from "lucide-react";
import styled from "styled-components";

import { Button } from "@/components/ui/button";

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
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.danger}18;
  color: ${({ theme }) => theme.colors.danger};
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
const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

export function ErrorState({
  action,
  compact = false,
  description = "Something went wrong while loading this content.",
  onRetry,
  retryLabel = "Try again",
  title = "Unable to load content",
  ...props
}) {
  return (
    <State $compact={compact} role="alert" {...props}>
      <IconFrame>
        <CircleAlert aria-hidden="true" strokeWidth={1.75} />
      </IconFrame>
      <Title>{title}</Title>
      {description ? <Description>{description}</Description> : null}
      {onRetry || action ? (
        <Actions>
          {onRetry ? (
            <Button onClick={onRetry} size="sm" variant="outline">
              <RefreshCw aria-hidden="true" />
              {retryLabel}
            </Button>
          ) : null}
          {action}
        </Actions>
      ) : null}
    </State>
  );
}

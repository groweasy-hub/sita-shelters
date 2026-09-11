"use client";

import { Fragment } from "react";
import { Check, X } from "lucide-react";
import styled from "styled-components";

import { getStatusConfig } from "@/config/status";
import { TRANSFER_FORWARD_STATUSES } from "../constants/stock-transfers.constants";

const Root = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  padding: 1.25rem;
  list-style: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;
const StepItem = styled.li`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  padding: 0.375rem 0;
  @media (min-width: 768px) {
    flex: 1 1 0;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0;
    text-align: center;
  }
`;
const Connector = styled.div`
  width: 2px;
  height: 1.5rem;
  margin-left: 0.8125rem;
  background: ${({ theme, $complete }) =>
    $complete ? theme.colors.success : theme.colors.border};
  @media (min-width: 768px) {
    width: auto;
    height: 2px;
    flex: 1 1 auto;
    margin: 0.875rem 0.25rem 0;
  }
`;
function circleBackground({ $state, theme }) {
  if ($state === "complete") return theme.colors.success;
  if ($state === "rejected") return theme.colors.danger;
  return theme.colors.card;
}
function circleBorder({ $state, theme }) {
  if ($state === "complete") return theme.colors.success;
  if ($state === "active") return theme.colors.info;
  if ($state === "rejected") return theme.colors.danger;
  return theme.colors.border;
}
function circleColor({ $state, theme }) {
  if ($state === "complete") return theme.colors.successForeground;
  if ($state === "rejected") return theme.colors.dangerForeground;
  if ($state === "active") return theme.colors.info;
  return theme.colors.mutedForeground;
}
const Circle = styled.span`
  display: grid;
  flex: 0 0 auto;
  width: 1.75rem;
  height: 1.75rem;
  place-items: center;
  border: 2px solid ${circleBorder};
  border-radius: 999px;
  background: ${circleBackground};
  color: ${circleColor};
  font-size: 0.75rem;
  font-weight: 700;
  svg {
    width: 0.9375rem;
    height: 0.9375rem;
  }
`;
const StepLabel = styled.span`
  color: ${({ theme, $state }) =>
    $state === "upcoming"
      ? theme.colors.mutedForeground
      : theme.colors.foreground};
  font-size: 0.8125rem;
  font-weight: ${({ $state }) => ($state === "active" ? 700 : 600)};
`;

/**
 * Horizontal (desktop) / vertical (mobile) rendering of the seven forward
 * transfer stages from `workflowConfig.transfer`. When `status` is
 * `rejected`, the steps that actually happened stay marked complete and the
 * remaining stages are replaced by a single red "Rejected" terminal node,
 * branching off `requested` or `approved` depending on whether the transfer
 * had already been approved.
 */
export function TransferWorkflowStepper({ approvedById, status }) {
  const steps = TRANSFER_FORWARD_STATUSES;
  const isRejected = status === "rejected";
  const currentIndex = isRejected
    ? steps.indexOf(approvedById ? "approved" : "requested")
    : steps.indexOf(status);
  const visibleSteps = isRejected ? steps.slice(0, currentIndex + 1) : steps;

  return (
    <Root aria-label="Transfer workflow">
      {visibleSteps.map((step, index) => {
        const state = isRejected
          ? "complete"
          : index < currentIndex
            ? "complete"
            : index === currentIndex
              ? "active"
              : "upcoming";
        return (
          <Fragment key={step}>
            {index > 0 ? <Connector $complete={state !== "upcoming"} /> : null}
            <StepItem>
              <Circle $state={state}>
                {state === "complete" ? (
                  <Check aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </Circle>
              <StepLabel $state={state}>
                {getStatusConfig(step).label}
              </StepLabel>
            </StepItem>
          </Fragment>
        );
      })}
      {isRejected ? (
        <Fragment>
          <Connector $complete />
          <StepItem>
            <Circle $state="rejected">
              <X aria-hidden="true" />
            </Circle>
            <StepLabel $state="rejected">Rejected</StepLabel>
          </StepItem>
        </Fragment>
      ) : null}
    </Root>
  );
}

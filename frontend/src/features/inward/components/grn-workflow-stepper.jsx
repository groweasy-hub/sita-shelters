"use client";

import { Fragment } from "react";
import { Check, X } from "lucide-react";
import styled from "styled-components";

const Root = styled.ol`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 1.25rem;
  list-style: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  @media (min-width: 900px) {
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
  @media (min-width: 900px) {
    flex: 1 1 0;
    flex-direction: column;
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
  @media (min-width: 900px) {
    width: auto;
    height: 2px;
    flex: 1 1 auto;
    margin: 0.875rem 0.25rem 0;
  }
`;
const toneBackground = ({ $state, theme }) =>
  $state === "complete"
    ? theme.colors.success
    : $state === "rejected"
      ? theme.colors.danger
      : theme.colors.card;
const toneBorder = ({ $state, theme }) =>
  $state === "complete"
    ? theme.colors.success
    : $state === "active"
      ? theme.colors.info
      : $state === "rejected"
        ? theme.colors.danger
        : theme.colors.border;
const toneColor = ({ $state, theme }) =>
  $state === "complete"
    ? theme.colors.successForeground
    : $state === "rejected"
      ? theme.colors.dangerForeground
      : $state === "active"
        ? theme.colors.info
        : theme.colors.mutedForeground;
const Circle = styled.span`
  display: grid;
  flex: 0 0 auto;
  width: 1.75rem;
  height: 1.75rem;
  place-items: center;
  border: 2px solid ${toneBorder};
  border-radius: 999px;
  background: ${toneBackground};
  color: ${toneColor};
  font-size: 0.75rem;
  font-weight: 700;
  svg {
    width: 0.9375rem;
    height: 0.9375rem;
  }
`;
const Label = styled.span`
  color: ${({ theme, $state }) =>
    $state === "upcoming" ? theme.colors.mutedForeground : theme.colors.foreground};
  font-size: 0.8125rem;
  font-weight: ${({ $state }) => ($state === "active" ? 700 : 600)};
`;
const Hint = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.6875rem;
`;

const STEPS = [
  { label: "Quality check" },
  { label: "GRN created" },
  { label: "Site Engineer approval" },
  { label: "Project Manager approval" },
  { label: "Stock posted" },
  { label: "Store confirmation" },
  { label: "Ready to use" },
];
// The step each stage is currently waiting on (STEPS.length = everything done).
const ACTIVE_STEP = {
  "awaiting-qc": 0,
  "pending-engineer-approval": 2,
  "pending-manager-approval": 3,
  "pending-store-confirmation": 5,
  received: STEPS.length,
};

/**
 * The GRN's path from quality check to usable stock. A rejected GRN keeps the
 * steps that happened and marks the step that turned it down; a delivery with
 * nothing accepted stops after the quality check.
 */
export function GrnWorkflowStepper({ approvals, stage }) {
  const rejectedAt =
    stage === "rejected"
      ? approvals.some((entry) => entry.action === "site-engineer-approved")
        ? 3
        : 2
      : null;
  const activeStep = stage === "closed" ? 1 : (ACTIVE_STEP[stage] ?? 0);

  return (
    <Root aria-label="GRN workflow">
      {STEPS.map((step, index) => {
        let state = "upcoming";
        if (rejectedAt !== null) {
          state = index < rejectedAt ? "complete" : index === rejectedAt ? "rejected" : "upcoming";
        } else if (index < activeStep) {
          state = "complete";
        } else if (index === activeStep && stage !== "closed") {
          state = "active";
        }
        return (
          <Fragment key={step.label}>
            {index > 0 ? <Connector $complete={state === "complete" || state === "rejected"} /> : null}
            <StepItem aria-current={state === "active" ? "step" : undefined}>
              <Circle $state={state}>
                {state === "complete" ? (
                  <Check aria-hidden="true" />
                ) : state === "rejected" ? (
                  <X aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </Circle>
              <span>
                <Label $state={state}>{step.label}</Label>
                {state === "rejected" ? <Hint><br />Rejected</Hint> : null}
              </span>
            </StepItem>
          </Fragment>
        );
      })}
    </Root>
  );
}

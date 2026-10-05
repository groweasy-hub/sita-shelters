"use client";

import styled from "styled-components";

import { WorkflowStepButtons } from "@/components/shared/workflow-step-buttons";
import { useCurrentUser, useProjectScope } from "@/features/profile";
import { canTakeWorkflowStep } from "@/lib/workflow";
import { useInwardWorkflowStep } from "../hooks/use-inward";

const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const PanelHeader = styled.header`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.875rem;
  font-weight: 650;
`;
const Body = styled.div`
  padding: 1rem 1.25rem;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.875rem;
  line-height: 1.5rem;
`;
const Actions = styled.div`
  padding: 0 1.25rem 1.25rem;
`;

// What each stage is waiting for, and what the person responsible does.
const STAGES = {
  "pending-engineer-approval": {
    title: "Waiting for Site Engineer approval",
    waitingFor: "the Site Engineer",
    text: "Verify the GRN against the delivery and the quality check, then approve it for the Project Manager.",
  },
  "pending-manager-approval": {
    title: "Waiting for Project Manager approval",
    waitingFor: "the Project Manager",
    text: "Final check. Approving authorises the stock posting: the accepted quantity is posted to the site, then the Store Manager confirms it is received.",
  },
  "pending-store-confirmation": {
    title: "Stock posted — waiting for the Store Manager",
    waitingFor: "the Store Manager",
    text: "The stock has been posted for this site but is not usable yet. Confirm you have received it to make it available.",
  },
};

/**
 * The next step for a GRN that is waiting on someone. Shows who it is waiting
 * for; offers the step only to a person with that role on this GRN's project.
 */
export function GrnWorkflowActions({ record }) {
  const config = STAGES[record.stage];
  const mutation = useInwardWorkflowStep();
  const currentUser = useCurrentUser();
  const { scopeProjectIds } = useProjectScope();
  if (!config) return null;
  const canAct = canTakeWorkflowStep(currentUser, record.stage, record.projectId, scopeProjectIds);
  return (
    <Panel>
      <PanelHeader>{config.title}</PanelHeader>
      <Body>
        {canAct
          ? config.text
          : `This GRN is waiting for ${config.waitingFor} of ${record.projectName}.`}
      </Body>
      {canAct ? (
        <Actions>
          <WorkflowStepButtons
            idPrefix={`grn-${record.id}`}
            mutation={{
              isPending: mutation.isPending,
              mutateAsync: (input) => mutation.mutateAsync({ inwardId: record.id, ...input }),
            }}
            stage={record.stage}
            subject="GRN"
          />
        </Actions>
      ) : null}
    </Panel>
  );
}

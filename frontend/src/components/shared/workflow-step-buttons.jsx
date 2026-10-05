"use client";

import { useState } from "react";
import { BadgeCheck, PackageCheck, Warehouse, XCircle } from "lucide-react";
import styled from "styled-components";

import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;
const Field = styled.div`
  display: grid;
  gap: 0.375rem;
  margin-top: 0.75rem;
  text-align: left;
`;

// The step each stage waits on: what the button says and what the dialog explains.
const STEPS = {
  "pending-engineer-approval": {
    step: "approve-engineer",
    label: "Approve",
    icon: BadgeCheck,
    canReject: true,
    describe: (subject) =>
      `Confirm the ${subject} matches the delivery and the quality check. It then goes to the Project Manager.`,
  },
  "pending-manager-approval": {
    step: "approve-manager",
    label: "Approve & post stock",
    icon: PackageCheck,
    canReject: true,
    describe: (subject) =>
      `This is the final check. Approving posts the ${subject}'s quantity to the site; the Store Manager then confirms it is received before it can be used.`,
  },
  "pending-store-confirmation": {
    step: "confirm-receipt",
    label: "Confirm stock received",
    icon: Warehouse,
    canReject: false,
    describe: (subject) =>
      `Confirm the posted ${subject} stock has been received at the store. It becomes available to issue and use straight away.`,
  },
};

function StepDialog({ config, idPrefix, mutation, reject, subject }) {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const Icon = reject ? XCircle : config.icon;
  const id = `${idPrefix}-${config.step}-${reject ? "reject" : "ok"}`;
  return (
    <ConfirmationDialog
      confirmDisabled={reject && remarks.trim().length === 0}
      confirmLabel={reject ? "Reject" : config.label}
      description={
        reject
          ? `Rejecting stops this ${subject} here — nothing is posted. Give the reason.`
          : config.describe(subject)
      }
      destructive={reject}
      errorMessage={error || undefined}
      onConfirm={() => {
        setError("");
        return mutation.mutateAsync({
          step: reject ? "reject" : config.step,
          remarks: remarks.trim(),
        });
      }}
      onConfirmError={(failure) =>
        setError(failure?.message ?? "The step could not be recorded")
      }
      onOpenChange={(open) => {
        if (!open) {
          setRemarks("");
          setError("");
        }
      }}
      pending={mutation.isPending}
      title={reject ? `Reject ${subject}` : config.label}
      trigger={
        <Button size="sm" variant={reject ? "outline" : "default"}>
          <Icon aria-hidden="true" strokeWidth={1.75} />
          {reject ? "Reject" : config.label}
        </Button>
      }
    >
      <Field>
        <Label htmlFor={id}>{reject ? "Reason" : "Remarks (optional)"}</Label>
        <Textarea
          id={id}
          onChange={(event) => setRemarks(event.target.value)}
          rows={3}
          value={remarks}
        />
      </Field>
    </ConfirmationDialog>
  );
}

/**
 * The buttons for the step a record at `stage` is waiting on (approve, plus
 * reject where an approver may turn it down). Render only for someone allowed
 * to take that step — see `canTakeWorkflowStep`. `mutation.mutateAsync` receives
 * `{ step, remarks }`.
 */
export function WorkflowStepButtons({ idPrefix, mutation, stage, subject = "GRN" }) {
  const config = STEPS[stage];
  if (!config) return null;
  return (
    <Row>
      <StepDialog config={config} idPrefix={idPrefix} mutation={mutation} subject={subject} />
      {config.canReject ? (
        <StepDialog config={config} idPrefix={idPrefix} mutation={mutation} reject subject={subject} />
      ) : null}
    </Row>
  );
}

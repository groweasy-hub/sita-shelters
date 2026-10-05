"use client";

import { useState } from "react";
import { CircleCheckBig } from "lucide-react";
import styled from "styled-components";

import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hasPermission } from "@/config/permissions";
import { inProjectScope, useCurrentUser, useProjectScope } from "@/features/profile";
import { formatQuantity } from "@/lib/formatters";
import { useConfirmIssueConsumption } from "../hooks/use-material-issues";

const Field = styled.div`
  display: grid;
  gap: 0.375rem;
  margin-top: 0.75rem;
  text-align: left;
`;
const Note = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  line-height: 1.3;
`;
const Stop = styled.span`
  display: inline-flex;
`;

export function outstandingOf(issue) {
  return issue.issuedQuantity - issue.consumedQuantity - issue.returnedQuantity;
}

function ConsumedDialog({ issue }) {
  const mutation = useConfirmIssueConsumption();
  const outstanding = outstandingOf(issue);
  const [mode, setMode] = useState("full");
  const [partial, setPartial] = useState("");
  const [error, setError] = useState("");
  const quantity = mode === "full" ? outstanding : Number(partial);
  const invalid = !(quantity > 0) || quantity > outstanding + 1e-6;

  return (
    <ConfirmationDialog
      confirmDisabled={invalid}
      confirmLabel="Mark consumed"
      description={`${issue.materialName} issued to ${issue.recipientName} at ${issue.projectName}. Marking it consumed updates the issue for the Site Engineer and Project Manager alike.`}
      errorMessage={error || undefined}
      onConfirm={() => {
        setError("");
        return mutation.mutateAsync({
          materialIssueId: issue.id,
          quantity: mode === "full" ? undefined : quantity,
        });
      }}
      onConfirmError={(failure) =>
        setError(failure?.message ?? "The consumption could not be recorded")
      }
      onOpenChange={(open) => {
        if (!open) {
          setMode("full");
          setPartial("");
          setError("");
        }
      }}
      pending={mutation.isPending}
      title="Mark as consumed"
      trigger={
        <Button size="sm">
          <CircleCheckBig aria-hidden="true" strokeWidth={1.75} />
          Consumed
        </Button>
      }
    >
      <Field>
        <Label htmlFor={`consume-mode-${issue.id}`}>How much was consumed?</Label>
        <Select onValueChange={setMode} value={mode}>
          <SelectTrigger id={`consume-mode-${issue.id}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">
              All of it — {formatQuantity(outstanding, issue.unit)}
            </SelectItem>
            <SelectItem value="partial">Part of it</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {mode === "partial" ? (
        <Field>
          <Label htmlFor={`consume-qty-${issue.id}`}>
            Quantity consumed ({issue.unit}) — up to {outstanding}
          </Label>
          <Input
            id={`consume-qty-${issue.id}`}
            max={outstanding}
            min="0"
            onChange={(event) => setPartial(event.target.value)}
            step="any"
            type="number"
            value={partial}
          />
          <Note>The rest stays waiting for confirmation.</Note>
        </Field>
      ) : null}
      <Note>
        Activity and location come from the issue: {issue.purpose} · {issue.workLocation}.
      </Note>
    </ConfirmationDialog>
  );
}

/**
 * The consumption request for an issued material. It goes to the Site
 * Engineer and the Project Manager of the site; either one's "Consumed" click
 * settles it for both. Anyone else sees who it is waiting for.
 */
export function ConfirmConsumptionAction({ issue }) {
  const currentUser = useCurrentUser();
  const { scopeProjectIds } = useProjectScope();
  if (!(outstandingOf(issue) > 1e-6)) return null;
  const allowed =
    currentUser &&
    hasPermission(currentUser.role, "consumption:confirm") &&
    inProjectScope(scopeProjectIds, issue.projectId);
  if (!allowed) {
    return <Note>Awaiting Site Engineer / Project Manager</Note>;
  }
  // Table rows are clickable and the dialog is portalled but still bubbles to them.
  return (
    <Stop onClick={(event) => event.stopPropagation()}>
      <ConsumedDialog issue={issue} />
    </Stop>
  );
}

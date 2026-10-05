"use client";

import { useState } from "react";
import { BadgeIndianRupee } from "lucide-react";
import styled from "styled-components";

import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDateTime, formatQuantity } from "@/lib/formatters";

const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const PanelHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.875rem;
  font-weight: 650;
`;
const Summary = styled.div`
  display: grid;
  gap: 0.25rem;
  padding: 1rem 1.25rem;
  font-size: 0.875rem;
  line-height: 1.5rem;
`;
const Muted = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
`;
const ActionBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0 1.25rem 1.25rem;
`;
const DialogField = styled.div`
  display: grid;
  gap: 0.375rem;
  margin-top: 0.75rem;
  text-align: left;
`;

function CompleteDialog({ idPrefix, mutation, resolution, unit }) {
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  return (
    <ConfirmationDialog
      confirmLabel="Mark refund completed"
      description={`Confirm the ${formatCurrency(resolution.amount)} refund${
        resolution.quantity > 0 ? ` for ${formatQuantity(resolution.quantity, unit)}` : ""
      } has been received.`}
      errorMessage={error || undefined}
      onConfirm={() => {
        setError("");
        return mutation.mutateAsync({
          reference: reference.trim(),
          remarks: remarks.trim(),
        });
      }}
      onConfirmError={(failure) =>
        setError(failure?.message ?? "The refund could not be recorded")
      }
      onOpenChange={(open) => {
        if (!open) {
          setReference("");
          setRemarks("");
          setError("");
        }
      }}
      pending={mutation.isPending}
      title="Refund completed"
      trigger={
        <Button>
          <BadgeIndianRupee aria-hidden="true" strokeWidth={1.75} />
          Refund completed
        </Button>
      }
    >
      <DialogField>
        <Label htmlFor={`${idPrefix}-refund-reference`}>
          Credit note / payment reference (optional)
        </Label>
        <Input
          id={`${idPrefix}-refund-reference`}
          onChange={(event) => setReference(event.target.value)}
          value={reference}
        />
      </DialogField>
      <DialogField>
        <Label htmlFor={`${idPrefix}-refund-remarks`}>Remarks (optional)</Label>
        <Textarea
          id={`${idPrefix}-refund-remarks`}
          onChange={(event) => setRemarks(event.target.value)}
          rows={3}
          value={remarks}
        />
      </DialogField>
    </ConfirmationDialog>
  );
}

/**
 * Whether the refund for a "refund" settlement has come back. While it is
 * pending and `canRecord` is set, offers "Refund completed".
 */
export function RefundStatusPanel({
  canRecord,
  idPrefix,
  mutation,
  resolution,
  unit,
}) {
  const refund = resolution.refund;
  const completed = Boolean(refund?.completed);
  return (
    <Panel>
      <PanelHeader>
        Refund
        <StatusBadge status={completed ? "refunded" : "refund-pending"} />
      </PanelHeader>
      <Summary>
        <span>
          <strong>{formatCurrency(resolution.amount)}</strong>
          {resolution.quantity > 0
            ? ` for ${formatQuantity(resolution.quantity, unit)}`
            : ""}
        </span>
        {completed ? (
          <Muted>
            Refund received on {formatDateTime(refund.completedAt)}
            {refund.completedByName ? ` · marked by ${refund.completedByName}` : ""}
            {refund.reference ? ` · ref ${refund.reference}` : ""}
            {refund.remarks ? ` — ${refund.remarks}` : ""}
          </Muted>
        ) : (
          <Muted>Refund not received yet.</Muted>
        )}
      </Summary>
      {canRecord && !completed ? (
        <ActionBar>
          <CompleteDialog
            idPrefix={idPrefix}
            mutation={mutation}
            resolution={resolution}
            unit={unit}
          />
        </ActionBar>
      ) : null}
    </Panel>
  );
}

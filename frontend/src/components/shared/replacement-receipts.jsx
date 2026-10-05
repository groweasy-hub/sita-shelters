"use client";

import { useState } from "react";
import { PackageCheck } from "lucide-react";
import styled from "styled-components";

import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { WorkflowStepButtons } from "@/components/shared/workflow-step-buttons";
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
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDateTime, formatQuantity } from "@/lib/formatters";
import { useReplacementWorkflowStep } from "@/hooks/use-replacement-workflow";
import { replacementReceivedInStock, replacementRemaining } from "@/lib/replacements";

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
const Summary = styled.div`
  padding: 1rem 1.25rem;
  font-size: 0.875rem;
  line-height: 1.5rem;
`;
const ActionBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0 1.25rem 1.25rem;
`;
const Receipts = styled.ul`
  display: grid;
  margin: 0;
  padding: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  list-style: none;
`;
const Receipt = styled.li`
  display: grid;
  gap: 0.125rem;
  padding: 0.875rem 1.25rem;
  font-size: 0.8125rem;
  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }
`;
const ReceiptId = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-weight: 600;
`;
const ReceiptHead = styled.span`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;
const ReceiptActions = styled.div`
  margin-top: 0.5rem;
`;
const APPROVAL_LABELS = {
  "site-engineer-approved": "Site Engineer approved",
  "project-manager-approved": "Project Manager approved, stock posted",
  "store-confirmed": "Store Manager confirmed receipt",
  rejected: "Rejected",
};
const WAITING_LABELS = {
  "pending-engineer-approval": "Waiting for the Site Engineer's approval.",
  "pending-manager-approval": "Waiting for the Project Manager's approval — this posts the stock.",
  "pending-store-confirmation": "Stock posted — waiting for the Store Manager to confirm receipt.",
};
const Muted = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
`;
const DialogField = styled.div`
  display: grid;
  gap: 0.375rem;
  margin-top: 0.75rem;
  text-align: left;
`;

function ReceiveDialog({ idPrefix, mutation, resolution, unit, unitPrice }) {
  const remaining = replacementRemaining(resolution);
  const [mode, setMode] = useState("full");
  const [partial, setPartial] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  const quantity = mode === "full" ? remaining : Number(partial);
  const invalid = !(quantity > 0) || quantity > remaining + 1e-6;
  // Worked out from the units, never typed in — the server recalculates it on save.
  const value = invalid ? 0 : Math.round(quantity * unitPrice * 100) / 100;

  return (
    <ConfirmationDialog
      confirmDisabled={invalid}
      confirmLabel="Record delivery"
      description="Record the replacement material that has arrived. It gets a replacement ID and goes through the Site Engineer, the Project Manager (who posts the stock) and the Store Manager's confirmation before it can be used."
      errorMessage={error || undefined}
      onConfirm={() => {
        setError("");
        return mutation.mutateAsync({ quantity, remarks: remarks.trim() });
      }}
      onConfirmError={(failure) =>
        setError(failure?.message ?? "The replacement could not be recorded")
      }
      onOpenChange={(open) => {
        if (!open) {
          setMode("full");
          setPartial("");
          setRemarks("");
          setError("");
        }
      }}
      pending={mutation.isPending}
      title="Items replaced"
      trigger={
        <Button>
          <PackageCheck aria-hidden="true" strokeWidth={1.75} />
          Items replaced
        </Button>
      }
    >
      <DialogField>
        <Label htmlFor={`${idPrefix}-replaced-mode`}>How much was replaced?</Label>
        <Select onValueChange={setMode} value={mode}>
          <SelectTrigger id={`${idPrefix}-replaced-mode`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">
              Full replacement — {formatQuantity(remaining, unit)}
            </SelectItem>
            <SelectItem value="partial">Partial replacement</SelectItem>
          </SelectContent>
        </Select>
      </DialogField>
      {mode === "partial" ? (
        <DialogField>
          <Label htmlFor={`${idPrefix}-replaced-units`}>
            Units received ({unit}) — up to {remaining}
          </Label>
          <Input
            id={`${idPrefix}-replaced-units`}
            max={remaining}
            min="0"
            onChange={(event) => setPartial(event.target.value)}
            step="any"
            type="number"
            value={partial}
          />
        </DialogField>
      ) : null}
      <DialogField>
        <Label>Replacement value</Label>
        <span aria-live="polite">
          <strong>{formatCurrency(value)}</strong>
          {unitPrice > 0
            ? ` = ${invalid ? "—" : formatQuantity(quantity, unit)} × ${formatCurrency(unitPrice)} per ${unit}`
            : " — no unit price on file for this material"}
        </span>
      </DialogField>
      <DialogField>
        <Label htmlFor={`${idPrefix}-replaced-remarks`}>Remarks (optional)</Label>
        <Textarea
          id={`${idPrefix}-replaced-remarks`}
          onChange={(event) => setRemarks(event.target.value)}
          rows={3}
          value={remarks}
        />
      </DialogField>
    </ConfirmationDialog>
  );
}

/**
 * Progress of a "replace" settlement and the deliveries received so far. When
 * some units are still owed and `canRecord` is set, offers "Items replaced" —
 * a full or partial delivery that goes straight into site inventory.
 */
export function ReplacementReceiptsPanel({
  canActOnStage,
  canRecord,
  idPrefix,
  mutation,
  resolution: rawResolution,
  unit,
  unitPrice,
}) {
  // A record cached before deliveries were tracked has neither field until it refetches.
  const resolution = {
    ...rawResolution,
    replacedQuantity: rawResolution.replacedQuantity ?? 0,
    replacements: (rawResolution.replacements ?? []).map((receipt) => ({
      ...receipt,
      stage: receipt.stage ?? "received",
      approvals: receipt.approvals ?? [],
    })),
  };
  const stepMutation = useReplacementWorkflowStep();
  const remaining = replacementRemaining(resolution);
  const inStock = replacementReceivedInStock(resolution);
  return (
    <Panel>
      <PanelHeader>Replacement material</PanelHeader>
      <Summary>
        {formatQuantity(resolution.replacedQuantity, unit)} of{" "}
        {formatQuantity(resolution.quantity, unit)} delivered
        {remaining > 1e-6
          ? ` — ${formatQuantity(remaining, unit)} still to come.`
          : " — fully delivered."}
        {resolution.replacedQuantity > 0
          ? ` ${formatQuantity(inStock, unit)} received into stock so far.`
          : ""}
      </Summary>
      {canRecord && remaining > 1e-6 ? (
        <ActionBar>
          <ReceiveDialog
            idPrefix={idPrefix}
            mutation={mutation}
            resolution={resolution}
            unit={unit}
            unitPrice={unitPrice}
          />
        </ActionBar>
      ) : null}
      {resolution.replacements.length > 0 ? (
        <Receipts>
          {resolution.replacements.map((receipt) => (
            <Receipt key={receipt.id}>
              <ReceiptHead>
                <span>
                  <ReceiptId>{receipt.id}</ReceiptId> ·{" "}
                  {formatQuantity(receipt.quantity, unit)} · value{" "}
                  {formatCurrency(receipt.value)}
                </span>
                <StatusBadge status={receipt.stage} />
              </ReceiptHead>
              <Muted>
                {formatDateTime(receipt.receivedAt)} · recorded by{" "}
                {receipt.receivedByName || receipt.receivedById}
                {receipt.remarks ? ` — ${receipt.remarks}` : ""}
              </Muted>
              {receipt.approvals
                .filter((entry) => entry.action !== "submitted")
                .map((entry) => (
                  <Muted key={`${entry.action}-${entry.at}`}>
                    {APPROVAL_LABELS[entry.action] ?? entry.action} — {entry.approver} ·{" "}
                    {formatDateTime(entry.at)}
                    {entry.remarks ? ` — ${entry.remarks}` : ""}
                  </Muted>
                ))}
              {receipt.stage === "received" ? (
                <Muted>Added to site stock.</Muted>
              ) : receipt.stage === "rejected" ? (
                <Muted>Not added to stock — the quantity can be recorded again.</Muted>
              ) : (
                <Muted>{WAITING_LABELS[receipt.stage]}</Muted>
              )}
              {canActOnStage?.(receipt.stage, receipt.projectId) ? (
                <ReceiptActions>
                  <WorkflowStepButtons
                    idPrefix={`rpl-${receipt.id}`}
                    mutation={{
                      isPending: stepMutation.isPending,
                      mutateAsync: (input) =>
                        stepMutation.mutateAsync({ replacementId: receipt.id, ...input }),
                    }}
                    stage={receipt.stage}
                    subject="replacement delivery"
                  />
                </ReceiptActions>
              ) : null}
            </Receipt>
          ))}
        </Receipts>
      ) : null}
    </Panel>
  );
}

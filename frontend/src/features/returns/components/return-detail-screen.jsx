"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CircleCheck,
  CircleX,
  PackageCheck,
  RefreshCcw,
} from "lucide-react";
import styled from "styled-components";

import {
  ConfirmationDialog,
  KpiCard,
  KpiGrid,
  PageHeader,
  RefundStatusPanel,
  ReplacementReceiptsPanel,
  StatusBadge,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
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
import { EmptyState } from "@/components/feedback/empty-state";
import { hasPermission } from "@/config/permissions";
import { useAllConsumptionEntries } from "@/features/consumption";
import { useAllMaterialIssues } from "@/features/material-issues";
import { useCurrentUser, useProjectScope } from "@/features/profile";
import { canTakeWorkflowStep } from "@/lib/workflow";
import { formatCurrency, formatDateTime, formatQuantity } from "@/lib/formatters";
import { getUserName } from "@/lib/mock-data/users";
import { RETURN_RESOLUTION_TYPE_OPTIONS } from "../constants/returns.constants";
import {
  useCompleteReturnRefund,
  useInspectReturn,
  useReceiveReturnReplacement,
  useResolveReturn,
  useReturn,
} from "../hooks/use-returns";

const Root = styled.div`
  display: grid;
  max-width: 64rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
  }
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`;
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
const PanelBody = styled.div`
  padding: 1.25rem;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.875rem;
  line-height: 1.5rem;
`;
const ConsumptionLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;
const ActionBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1.25rem;
`;
const DialogField = styled.div`
  display: grid;
  gap: 0.375rem;
  margin-top: 0.75rem;
  text-align: left;
`;
const BreakdownGrid = styled.div`
  display: grid;
  gap: 1px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.border};
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
`;
const BreakdownCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.card};
`;
const BreakdownLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ $tone, theme }) =>
    $tone === "danger" ? theme.colors.danger : theme.colors.success};
  font-size: 0.8125rem;
  font-weight: 650;
  svg {
    width: 1rem;
    height: 1rem;
  }
`;
const BreakdownValue = styled.div`
  font-size: 1.75rem;
  font-weight: 650;
  letter-spacing: -0.025em;
`;

function InspectDialog({ inspectMutation, receivedQuantity, returnId, unit, inspectedById }) {
  const [damagedQuantity, setDamagedQuantity] = useState(0);
  const [remarks, setRemarks] = useState("");
  const invalid =
    Number.isNaN(damagedQuantity) ||
    damagedQuantity < 0 ||
    damagedQuantity > receivedQuantity;
  const goodQuantity = invalid ? 0 : receivedQuantity - damagedQuantity;

  return (
    <ConfirmationDialog
      confirmDisabled={invalid || remarks.trim().length === 0}
      confirmLabel="Save inspection"
      description="Split the returned quantity into good (restocked) and damaged. Remarks are required."
      onConfirm={() =>
        inspectMutation.mutateAsync({
          returnId,
          inspectedById,
          goodQuantity,
          damagedQuantity,
          remarks: remarks.trim(),
        })
      }
      onOpenChange={(open) => {
        if (!open) {
          setDamagedQuantity(0);
          setRemarks("");
        }
      }}
      pending={inspectMutation.isPending}
      title="Record inspection result"
      trigger={
        <Button>
          <CircleCheck aria-hidden="true" strokeWidth={1.75} />
          Inspect return
        </Button>
      }
    >
      <DialogField>
        <Label htmlFor={`return-damaged-${returnId}`}>
          Damaged quantity ({unit})
        </Label>
        <Input
          id={`return-damaged-${returnId}`}
          max={receivedQuantity}
          min={0}
          onChange={(event) => setDamagedQuantity(Number(event.target.value))}
          type="number"
          value={damagedQuantity}
        />
      </DialogField>
      <DialogField>
        <Label>Good quantity</Label>
        <span>{formatQuantity(goodQuantity, unit)}</span>
      </DialogField>
      <DialogField>
        <Label htmlFor={`return-remarks-${returnId}`}>Remarks</Label>
        <Textarea
          id={`return-remarks-${returnId}`}
          onChange={(event) => setRemarks(event.target.value)}
          rows={3}
          value={remarks}
        />
      </DialogField>
    </ConfirmationDialog>
  );
}

function ResolveDialog({
  damagedQuantity,
  resolveMutation,
  resolvedById,
  returnId,
  unit,
  unitPrice,
}) {
  const [type, setType] = useState("replace");
  const [quantity, setQuantity] = useState(String(damagedQuantity));
  const [remarks, setRemarks] = useState("");
  const quantityValue = Number(quantity);
  const quantityInvalid =
    !(quantityValue > 0) || quantityValue > damagedQuantity + 1e-6;
  // Worked out from the quantity, never typed in — the server recalculates it on save.
  const value = quantityInvalid
    ? 0
    : Math.round(quantityValue * unitPrice * 100) / 100;

  return (
    <ConfirmationDialog
      confirmDisabled={quantityInvalid}
      confirmLabel="Save resolution"
      description="Record how the damaged quantity is being settled — a replacement that will be sent, or a refunded amount."
      onConfirm={() =>
        resolveMutation.mutateAsync({
          returnId,
          resolvedById,
          type,
          quantity: quantityValue,
          remarks: remarks.trim(),
        })
      }
      onOpenChange={(open) => {
        if (!open) {
          setType("replace");
          setQuantity(String(damagedQuantity));
          setRemarks("");
        }
      }}
      pending={resolveMutation.isPending}
      title="Resolve damaged return"
      trigger={
        <Button>
          <RefreshCcw aria-hidden="true" strokeWidth={1.75} />
          Log Replace / Refund
        </Button>
      }
    >
      <DialogField>
        <Label htmlFor={`return-resolution-type-${returnId}`}>Resolution</Label>
        <Select onValueChange={setType} value={type}>
          <SelectTrigger id={`return-resolution-type-${returnId}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RETURN_RESOLUTION_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DialogField>
      <DialogField>
        <Label htmlFor={`return-resolution-quantity-${returnId}`}>
          {type === "refund" ? "Refund" : "Replacement"} quantity ({unit}) — up to {damagedQuantity}
        </Label>
        <Input
          id={`return-resolution-quantity-${returnId}`}
          max={damagedQuantity}
          min="0"
          onChange={(event) => setQuantity(event.target.value)}
          step="any"
          type="number"
          value={quantity}
        />
        {type === "replace" ? (
          <span>
            Site stock is updated only after the replaced items arrive, are
            recorded with &ldquo;Items replaced&rdquo; and are approved.
          </span>
        ) : null}
      </DialogField>
      <DialogField>
        <Label>{type === "refund" ? "Refund amount" : "Replacement value"}</Label>
        <span aria-live="polite">
          <strong>{formatCurrency(value)}</strong>
          {unitPrice > 0
            ? ` = ${quantityInvalid ? "—" : formatQuantity(quantityValue, unit)} × ${formatCurrency(unitPrice)} per ${unit}`
            : " — no unit price on file for this material"}
        </span>
      </DialogField>
      <DialogField>
        <Label htmlFor={`return-resolution-remarks-${returnId}`}>Remarks</Label>
        <Textarea
          id={`return-resolution-remarks-${returnId}`}
          onChange={(event) => setRemarks(event.target.value)}
          rows={3}
          value={remarks}
        />
      </DialogField>
    </ConfirmationDialog>
  );
}

/** The issue this return came from, and what was consumed against it. */
function LinkedIssuePanel({ record }) {
  const { data: issues = [] } = useAllMaterialIssues();
  const { data: consumption = [] } = useAllConsumptionEntries();
  const issue = issues.find((entry) => entry.id === record.materialIssueId);
  const entries = consumption.filter(
    (entry) => entry.materialIssueId === record.materialIssueId,
  );
  return (
    <Panel>
      <PanelHeader>Linked material issue</PanelHeader>
      <PanelBody>
        {record.materialIssueId}
        {issue
          ? ` · issued ${formatQuantity(issue.issuedQuantity, issue.unit)}, consumed ${formatQuantity(issue.consumedQuantity, issue.unit)}, returned ${formatQuantity(issue.returnedQuantity, issue.unit)}`
          : ""}
        <div>
          {entries.length > 0 ? (
            <ConsumptionLink
              href={`/consumption?search=${encodeURIComponent(record.materialIssueId)}`}
            >
              {entries.length} consumption{" "}
              {entries.length === 1 ? "entry" : "entries"} logged against this
              issue
            </ConsumptionLink>
          ) : (
            "No consumption logged against this issue yet."
          )}
        </div>
      </PanelBody>
    </Panel>
  );
}

export function ReturnDetailScreen({ returnId }) {
  const router = useRouter();
  const { data: record } = useReturn(returnId);
  const currentUser = useCurrentUser();
  const inspectMutation = useInspectReturn();
  const resolveMutation = useResolveReturn();
  const receiveMutation = useReceiveReturnReplacement();
  const refundMutation = useCompleteReturnRefund();
  const { scopeProjectIds } = useProjectScope();
  const canManage =
    currentUser && hasPermission(currentUser.role, "returns:manage");

  if (!record) {
    return (
      <EmptyState
        action={
          <Button onClick={() => router.push("/returns")} variant="outline">
            Back to returns
          </Button>
        }
        description="This return record may have been removed or the reference is incorrect."
        title="Return not found"
      />
    );
  }

  return (
    <Root>
      <div>
        <BackLink href="/returns">
          <ArrowLeft aria-hidden="true" />
          Back to returns
        </BackLink>
      </div>
      <PageHeader
        description={`${record.materialName} returned against ${record.materialIssueId}, logged by ${record.returnedByName}.`}
        eyebrow={record.projectName}
        meta={
          <>
            <Badge variant="outline">{record.id}</Badge>
            <StatusBadge status={record.inspection.status} />
          </>
        }
        title={record.id}
      />
      {canManage && record.inspection.status === "pending-inspection" ? (
        <Panel>
          <PanelHeader>Awaiting inspection</PanelHeader>
          <ActionBar>
            <InspectDialog
              inspectedById={currentUser.id}
              inspectMutation={inspectMutation}
              receivedQuantity={record.returningQuantity}
              returnId={returnId}
              unit={record.unit}
              unitPrice={record.unitPrice}
            />
          </ActionBar>
        </Panel>
      ) : null}
      {canManage &&
      record.inspection.status === "damaged" &&
      !record.resolution ? (
        <Panel>
          <PanelHeader>Damaged quantity needs resolution</PanelHeader>
          <ActionBar>
            <ResolveDialog
              damagedQuantity={record.inspection.damagedQuantity}
              resolvedById={currentUser.id}
              resolveMutation={resolveMutation}
              returnId={returnId}
              unit={record.unit}
            />
          </ActionBar>
        </Panel>
      ) : null}
      <KpiGrid>
        <KpiCard
          label="Returning quantity"
          value={formatQuantity(record.returningQuantity, record.unit)}
        />
        <KpiCard label="Logged by" value={record.returnedByName} />
        <KpiCard label="Logged on" value={formatDateTime(record.returnedAt)} />
        <KpiCard
          label="Inspected on"
          value={
            record.inspection.inspectedAt
              ? formatDateTime(record.inspection.inspectedAt)
              : "Not yet inspected"
          }
        />
      </KpiGrid>
      {record.inspection.status !== "pending-inspection" ? (
        <BreakdownGrid>
          <BreakdownCard>
            <BreakdownLabel $tone="success">
              <PackageCheck aria-hidden="true" strokeWidth={1.75} />
              Good — restocked
            </BreakdownLabel>
            <BreakdownValue>
              {formatQuantity(record.inspection.goodQuantity, record.unit)}
            </BreakdownValue>
          </BreakdownCard>
          <BreakdownCard>
            <BreakdownLabel $tone="danger">
              <CircleX aria-hidden="true" strokeWidth={1.75} />
              Damaged
            </BreakdownLabel>
            <BreakdownValue>
              {formatQuantity(record.inspection.damagedQuantity, record.unit)}
            </BreakdownValue>
          </BreakdownCard>
        </BreakdownGrid>
      ) : null}
      <LinkedIssuePanel record={record} />
      <Panel>
        <PanelHeader>Inspection remarks</PanelHeader>
        <PanelBody>{record.inspection.remarks}</PanelBody>
      </Panel>
      {record.resolution ? (
        <Panel>
          <PanelHeader>
            <Banknote aria-hidden="true" strokeWidth={1.75} style={{ marginRight: "0.5rem" }} />
            Resolution — {RETURN_RESOLUTION_TYPE_OPTIONS.find((o) => o.value === record.resolution.type)?.label}
          </PanelHeader>
          <PanelBody>
            {record.resolution.type === "refund"
              ? `${
                  record.resolution.quantity > 0
                    ? `${formatQuantity(record.resolution.quantity, record.unit)} refunded`
                    : "Refunded"
                } · ${formatCurrency(record.resolution.amount)}`
              : `${
                  record.resolution.quantity > 0
                    ? `${formatQuantity(record.resolution.quantity, record.unit)} to be replaced`
                    : "To be replaced"
                } · value ${formatCurrency(record.resolution.amount)}`}{" "}
            · Logged by {record.resolution.resolvedByName ?? getUserName(record.resolution.resolvedById)} on{" "}
            {formatDateTime(record.resolution.resolvedAt)}
            {record.resolution.remarks ? ` — ${record.resolution.remarks}` : ""}
          </PanelBody>
        </Panel>
      ) : null}
      {record.resolution?.type === "refund" ? (
        <RefundStatusPanel
          canRecord={canManage}
          idPrefix={`return-${returnId}`}
          mutation={{
            isPending: refundMutation.isPending,
            mutateAsync: (input) =>
              refundMutation.mutateAsync({ returnId, ...input }),
          }}
          resolution={record.resolution}
          unit={record.unit}
        />
      ) : null}
      {record.resolution?.type === "replace" ? (
        <ReplacementReceiptsPanel
          canActOnStage={(stage, projectId) =>
            canTakeWorkflowStep(currentUser, stage, projectId || record.projectId, scopeProjectIds)
          }
          canRecord={canManage}
          idPrefix={`return-${returnId}`}
          mutation={{
            isPending: receiveMutation.isPending,
            mutateAsync: (input) =>
              receiveMutation.mutateAsync({ returnId, ...input }),
          }}
          resolution={record.resolution}
          unit={record.unit}
          unitPrice={record.unitPrice}
        />
      ) : null}
    </Root>
  );
}

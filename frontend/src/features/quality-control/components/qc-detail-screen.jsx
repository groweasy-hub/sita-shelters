"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CircleCheck,
  CircleX,
  Info,
  PackageCheck,
  RefreshCcw,
  Undo2,
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
import { hasPermission, ROLE_LABELS } from "@/config/permissions";
import { inProjectScope, useCurrentUser, useProjectScope } from "@/features/profile";
import { canTakeWorkflowStep } from "@/lib/workflow";
import { formatCurrency, formatDateTime, formatQuantity } from "@/lib/formatters";
import { getUserNameWithRole } from "@/lib/mock-data/users";
import { QC_RESOLUTION_TYPE_OPTIONS } from "../constants/quality-control.constants";
import { QcInspectionForm } from "./qc-inspection-form";
import {
  useCompleteQualityControlRefund,
  useInspectQualityControlRecord,
  useQualityControlInspection,
  useReceiveQualityControlReplacement,
  useResolveQualityControlRecord,
} from "../hooks/use-quality-control";

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
const FlowNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 1.25rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  line-height: 1.4rem;
  svg {
    width: 1rem;
    height: 1rem;
    flex: 0 0 auto;
    margin-top: 0.125rem;
    color: ${({ theme }) => theme.colors.info};
  }
`;
const ResultBanner = styled.div`
  display: grid;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.success}40;
  background: ${({ theme }) => theme.colors.success}0d;
  font-size: 0.875rem;
  line-height: 1.5;
  a {
    font-weight: 600;
  }
`;
const WaitingNote = styled.div`
  padding: 1rem 1.25rem;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.875rem;
`;
const CheckList = styled.ul`
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 1.25rem;
  list-style: none;
  font-size: 0.8125rem;
`;
const CheckItem = styled.li`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
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

function ResolveDialog({
  qcId,
  rejectedQuantity,
  resolveMutation,
  resolvedById,
  unit,
  unitPrice,
}) {
  const [type, setType] = useState("replace");
  const [quantity, setQuantity] = useState(String(rejectedQuantity));
  const [remarks, setRemarks] = useState("");
  const quantityValue = Number(quantity);
  const quantityInvalid =
    !(quantityValue > 0) || quantityValue > rejectedQuantity + 1e-6;
  // Worked out from the quantity, never typed in — the server recalculates it on save.
  const value = quantityInvalid
    ? 0
    : Math.round(quantityValue * unitPrice * 100) / 100;

  return (
    <ConfirmationDialog
      confirmDisabled={quantityInvalid}
      confirmLabel="Save resolution"
      description="Record how the vendor is settling the rejected quantity — a replacement they will send, or a refunded amount."
      onConfirm={() =>
        resolveMutation.mutateAsync({
          qcId,
          resolvedById,
          type,
          quantity: quantityValue,
          remarks: remarks.trim(),
        })
      }
      onOpenChange={(open) => {
        if (!open) {
          setType("replace");
          setQuantity(String(rejectedQuantity));
          setRemarks("");
        }
      }}
      pending={resolveMutation.isPending}
      title="Resolve rejected delivery"
      trigger={
        <Button>
          <RefreshCcw aria-hidden="true" strokeWidth={1.75} />
          Log Replace / Refund
        </Button>
      }
    >
      <DialogField>
        <Label htmlFor={`qc-resolution-type-${qcId}`}>Resolution</Label>
        <Select onValueChange={setType} value={type}>
          <SelectTrigger id={`qc-resolution-type-${qcId}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QC_RESOLUTION_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DialogField>
      <DialogField>
        <Label htmlFor={`qc-resolution-quantity-${qcId}`}>
          {type === "refund" ? "Refund" : "Replacement"} quantity ({unit}) — up to {rejectedQuantity}
        </Label>
        <Input
          id={`qc-resolution-quantity-${qcId}`}
          max={rejectedQuantity}
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
        <Label htmlFor={`qc-resolution-remarks-${qcId}`}>Remarks</Label>
        <Textarea
          id={`qc-resolution-remarks-${qcId}`}
          onChange={(event) => setRemarks(event.target.value)}
          rows={3}
          value={remarks}
        />
      </DialogField>
    </ConfirmationDialog>
  );
}

function inspectorLabel(record) {
  if (!record.inspectorName) {
    return record.inspectorId ?? "—";
  }
  const role = ROLE_LABELS[record.inspectorRole] ?? record.inspectorRole;
  return role ? `${record.inspectorName} — ${role}` : record.inspectorName;
}

export function QcDetailScreen({ qcId }) {
  const router = useRouter();
  const { data: record } = useQualityControlInspection(qcId);
  const currentUser = useCurrentUser();
  const inspectMutation = useInspectQualityControlRecord();
  const resolveMutation = useResolveQualityControlRecord();
  const receiveMutation = useReceiveQualityControlReplacement();
  const refundMutation = useCompleteQualityControlRefund();
  const { scopeProjectIds } = useProjectScope();
  const canInspect = Boolean(
    currentUser &&
      record &&
      hasPermission(currentUser.role, "quality-control:manage") &&
      hasPermission(currentUser.role, "quality-control:approve") &&
      inProjectScope(scopeProjectIds, record.projectId),
  );
  const isAwaitingInspection =
    record?.status === "pending-inspection" || record?.status === "under-inspection";
  if (!record) {
    return (
      <EmptyState
        action={
          <Button
            onClick={() => router.push("/quality-control")}
            variant="outline"
          >
            Back to quality control
          </Button>
        }
        description="This QC record may have been removed or the reference is incorrect."
        title="Inspection not found"
      />
    );
  }
  return (
    <Root>
      <div>
        <BackLink href="/quality-control">
          <ArrowLeft aria-hidden="true" />
          Back to quality control
        </BackLink>
      </div>
      <PageHeader
        description={
          record.inspectedAt
            ? `${record.materialName} received against ${record.inwardId}, inspected by ${inspectorLabel(record)}.`
            : `${record.materialName} received against ${record.inwardId}, awaiting inspection.`
        }
        eyebrow={record.projectName}
        meta={
          <>
            <Badge variant="outline">{record.id}</Badge>
            <StatusBadge status={record.status} />
          </>
        }
        title={record.id}
      />
      {inspectMutation.isSuccess && inspectMutation.data?.id === record.id ? (
        <ResultBanner role="status">
          <strong>Inspection recorded.</strong>
          {inspectMutation.data.acceptedQuantity > 0 ? (
            <span>
              {formatQuantity(inspectMutation.data.acceptedQuantity, record.unit)} of{" "}
              {record.materialName} passed the quality check. Once every line of the delivery is
              inspected, the GRN goes to the Site Engineer, then the Project Manager, and the
              stock is posted after that.{" "}
              <Link href={`/inward/${record.inwardId}`}>View the GRN</Link>
            </span>
          ) : null}
          {inspectMutation.data.rejectedQuantity > 0 ? (
            <span>
              {formatQuantity(inspectMutation.data.rejectedQuantity, record.unit)} rejected — log the
              vendor&apos;s replacement or refund below.
            </span>
          ) : null}
        </ResultBanner>
      ) : null}
      {isAwaitingInspection && canInspect ? (
        <QcInspectionForm mutation={inspectMutation} record={record} />
      ) : null}
      {isAwaitingInspection && !canInspect ? (
        <WaitingNote>
          This delivery is waiting for inspection by a site engineer or project manager assigned to{" "}
          {record.projectName}.
        </WaitingNote>
      ) : null}
      {canInspect && record.rejectedQuantity > 0 && !record.resolution ? (
        <Panel>
          <PanelHeader>Rejected quantity — needs vendor resolution</PanelHeader>
          <ActionBar>
            <ResolveDialog
              qcId={qcId}
              rejectedQuantity={record.rejectedQuantity}
              resolveMutation={resolveMutation}
              resolvedById={currentUser.id}
              unit={record.unit}
              unitPrice={record.unitPrice}
            />
          </ActionBar>
        </Panel>
      ) : null}
      <KpiGrid>
        <KpiCard label="Linked GRN" value={record.inwardId} />
        <KpiCard
          label="Received quantity"
          value={formatQuantity(record.receivedQuantity, record.unit)}
        />
        <KpiCard
          label="Inspector"
          value={record.inspectedAt ? inspectorLabel(record) : "Awaiting inspection"}
        />
        <KpiCard
          label="Inspected on"
          value={
            record.inspectedAt
              ? formatDateTime(record.inspectedAt)
              : "Not yet inspected"
          }
        />
      </KpiGrid>
      <BreakdownGrid>
        <BreakdownCard>
          <BreakdownLabel $tone="success">
            <CircleCheck aria-hidden="true" strokeWidth={1.75} />
            Accepted
          </BreakdownLabel>
          <BreakdownValue>
            {formatQuantity(record.acceptedQuantity, record.unit)}
          </BreakdownValue>
        </BreakdownCard>
        <BreakdownCard>
          <BreakdownLabel $tone="danger">
            <CircleX aria-hidden="true" strokeWidth={1.75} />
            Rejected
          </BreakdownLabel>
          <BreakdownValue>
            {formatQuantity(record.rejectedQuantity, record.unit)}
          </BreakdownValue>
        </BreakdownCard>
      </BreakdownGrid>
      {record.inspectedAt ? (
        <>
          {record.checklist.length ? (
            <Panel>
              <PanelHeader>Quality checklist</PanelHeader>
              <CheckList>
                {record.checklist.map((item) => (
                  <CheckItem key={item.key}>
                    <span>{item.label}</span>
                    <Badge
                      variant={
                        item.result === "pass"
                          ? "success"
                          : item.result === "fail"
                            ? "destructive"
                            : "muted"
                      }
                    >
                      {item.result === "na" ? "N/A" : item.result === "pass" ? "Pass" : "Fail"}
                    </Badge>
                  </CheckItem>
                ))}
              </CheckList>
            </Panel>
          ) : null}
          <Panel>
            <PanelHeader>Inspector remarks</PanelHeader>
            <PanelBody>{record.remarks}</PanelBody>
          </Panel>
        </>
      ) : null}
      {record.resolution ? (
        <Panel>
          <PanelHeader>
            <Banknote
              aria-hidden="true"
              strokeWidth={1.75}
              style={{ marginRight: "0.5rem" }}
            />
            Vendor resolution —{" "}
            {
              QC_RESOLUTION_TYPE_OPTIONS.find(
                (option) => option.value === record.resolution.type,
              )?.label
            }
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
            · Logged by{" "}
            {record.resolution.resolvedByName ?? getUserNameWithRole(record.resolution.resolvedById)}{" "}
            on {formatDateTime(record.resolution.resolvedAt)}
            {record.resolution.remarks
              ? ` — ${record.resolution.remarks}`
              : ""}
          </PanelBody>
        </Panel>
      ) : null}
      {record.resolution?.type === "refund" ? (
        <RefundStatusPanel
          canRecord={canInspect}
          idPrefix={`qc-${qcId}`}
          mutation={{
            isPending: refundMutation.isPending,
            mutateAsync: (input) => refundMutation.mutateAsync({ qcId, ...input }),
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
          canRecord={canInspect}
          idPrefix={`qc-${qcId}`}
          mutation={{
            isPending: receiveMutation.isPending,
            mutateAsync: (input) =>
              receiveMutation.mutateAsync({ qcId, ...input }),
          }}
          resolution={record.resolution}
          unit={record.unit}
          unitPrice={record.unitPrice}
        />
      ) : null}
      <Panel>
        <PanelHeader>What happens next</PanelHeader>
        <FlowNote>
          <PackageCheck aria-hidden="true" />
          <span>
            Accepted quantity goes into the GRN, which the Site Engineer and
            then the Project Manager approve. The Project Manager&apos;s approval
            posts the stock, and the Store Manager confirms it is received
            before it can be used. Follow it on the{" "}
            <Link href={`/inward/${record.inwardId}`}>GRN</Link>.
          </span>
        </FlowNote>
        <FlowNote>
          <Undo2 aria-hidden="true" />
          <span>
            Rejected quantity does not enter stock — the vendor must replace it
            with fresh material or refund the amount (marked &ldquo;Refund completed&rdquo; once the money is back). A replacement is added to
            site stock, under its own replacement ID, when the items arrive and
            are recorded as &ldquo;Items replaced&rdquo; — in full or in
            parts. Every vendor return is tracked on the{" "}
            <Link href="/returns">Returns &amp; Replacements page</Link>.
          </span>
        </FlowNote>
        <FlowNote>
          <Info aria-hidden="true" />
          A delivery can be inspected once. The purchase order&apos;s delivery
          status updates when the Project Manager approves the GRN and the
          stock is posted.
        </FlowNote>
      </Panel>
    </Root>
  );
}

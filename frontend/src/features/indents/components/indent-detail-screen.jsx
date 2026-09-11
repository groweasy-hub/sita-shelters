"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ClipboardCheck, PackageSearch } from "lucide-react";
import styled from "styled-components";

import { KpiCard, KpiGrid, PageHeader, StatusBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { getStatusConfig } from "@/config/status";
import {
  calculatePurchaseOrderValue,
  usePurchaseOrdersForIndent,
} from "@/features/procurement";
import { formatCurrency, formatDate, formatQuantity } from "@/lib/formatters";
import { getUserName } from "@/lib/mock-data/users";
import { getVendorById } from "@/lib/mock-data/vendors";
import { useIndent } from "../hooks/use-indents";
import { StockRecommendation } from "./stock-recommendation";

const Root = styled.div`
  display: grid;
  max-width: 72rem;
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
const StepperRoot = styled.ol`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  margin: 0;
  padding: 1.25rem;
  list-style: none;
`;
const StepItem = styled.li`
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 0.5rem;
  min-width: 8rem;
`;
const StepDot = styled.span`
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid
    ${({ $state, theme }) =>
      $state === "done"
        ? theme.colors.success
        : $state === "current"
          ? theme.colors.primary
          : theme.colors.border};
  border-radius: 999px;
  background: ${({ $state, theme }) =>
    $state === "done"
      ? theme.colors.success
      : $state === "current"
        ? theme.colors.primary
        : "transparent"};
  color: ${({ $state, theme }) =>
    $state === "upcoming"
      ? theme.colors.mutedForeground
      : theme.colors.background};
  font-size: 0.7rem;
  font-weight: 700;
`;
const StepLabel = styled.span`
  color: ${({ $state, theme }) =>
    $state === "upcoming"
      ? theme.colors.mutedForeground
      : theme.colors.foreground};
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
`;
const StepConnector = styled.span`
  flex: 1 1 auto;
  height: 2px;
  margin: 0 0.5rem;
  background: ${({ $done, theme }) =>
    $done ? theme.colors.success : theme.colors.border};
`;
const StepperFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.25rem 1.25rem;
`;
const LineRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) repeat(2, 8rem);
  gap: 1rem;
  align-items: center;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child {
    border-bottom: 0;
  }
`;
const LineRowHead = styled(LineRow)`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.7rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;
const Num = styled.span`
  text-align: right;
  font-variant-numeric: tabular-nums;
`;
const StockLine = styled.div`
  display: grid;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child {
    border-bottom: 0;
  }
`;
const StockLineTitle = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 650;
`;
const ProcurementNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1.25rem;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.875rem;
`;
const PORow = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: inherit;
  text-decoration: none;
  &:last-child {
    border-bottom: 0;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceMuted}aa;
  }
`;
const PORowMeta = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;

const MAIN_STEPS = [
  "draft",
  "submitted",
  "under-review",
  "approved",
  "completed",
];

function stepState(step, status) {
  const effectiveStatus =
    status === "partially-fulfilled"
      ? "approved"
      : status === "rejected"
        ? "under-review"
        : status;
  const currentIndex = MAIN_STEPS.indexOf(effectiveStatus);
  const stepIndex = MAIN_STEPS.indexOf(step);
  if (currentIndex === -1) return "upcoming";
  if (stepIndex < currentIndex) return "done";
  if (stepIndex === currentIndex) return "current";
  return "upcoming";
}

export function IndentDetailScreen({ indentId }) {
  const router = useRouter();
  const { data: indent } = useIndent(indentId);
  const { data: linkedOrders = [] } = usePurchaseOrdersForIndent(indentId);
  if (!indent) {
    return (
      <EmptyState
        action={
          <Button onClick={() => router.push("/indents")} variant="outline">
            Back to indents
          </Button>
        }
        description="This indent may have been removed or the reference is incorrect."
        title="Indent not found"
      />
    );
  }
  const totalRequested = indent.lines.reduce(
    (sum, entry) => sum + entry.requestedQuantity,
    0,
  );
  const totalApproved = indent.lines.reduce(
    (sum, entry) => sum + (entry.approvedQuantity ?? 0),
    0,
  );
  return (
    <Root>
      <div>
        <BackLink href="/indents">
          <ArrowLeft aria-hidden="true" />
          Back to indents
        </BackLink>
      </div>
      <PageHeader
        description={indent.purpose}
        eyebrow={`${indent.projectName} · ${indent.workLocation}`}
        meta={
          <>
            <Badge variant="outline">{indent.id}</Badge>
            <StatusBadge status={indent.status} />
            <Badge variant="muted">{indent.priority} priority</Badge>
          </>
        }
        title={indent.id}
      />
      <KpiGrid>
        <KpiCard
          label="Requested by"
          value={getUserName(indent.requestedById)}
        />
        <KpiCard
          label="Required date"
          value={formatDate(indent.requiredDate)}
        />
        <KpiCard label="Material lines" value={indent.lines.length} />
        <KpiCard
          label="Approved vs requested"
          value={`${formatQuantity(totalApproved)} / ${formatQuantity(totalRequested)}`}
        />
      </KpiGrid>
      <Panel>
        <PanelHeader>Approval workflow</PanelHeader>
        <StepperRoot>
          {MAIN_STEPS.map((step, index) => {
            const state = stepState(step, indent.status);
            return (
              <StepItem key={step}>
                <StepDot $state={state}>{index + 1}</StepDot>
                <StepLabel $state={state}>
                  {getStatusConfig(step).label}
                </StepLabel>
                {index < MAIN_STEPS.length - 1 ? (
                  <StepConnector $done={state === "done"} />
                ) : null}
              </StepItem>
            );
          })}
        </StepperRoot>
        {indent.status === "rejected" ||
        indent.status === "partially-fulfilled" ? (
          <StepperFooter>
            <StatusBadge status={indent.status} />
            {indent.status === "rejected" ? (
              <span>Sent back to draft for revision after under-review.</span>
            ) : (
              <span>
                Some lines have been fulfilled; the remainder is still in
                progress.
              </span>
            )}
          </StepperFooter>
        ) : null}
      </Panel>
      <Panel>
        <PanelHeader>Materials requested</PanelHeader>
        <LineRowHead>
          <span>Material</span>
          <Num>Requested</Num>
          <Num>Approved</Num>
        </LineRowHead>
        {indent.lines.map((entry) => (
          <LineRow key={entry.materialCode}>
            <span>{entry.materialName}</span>
            <Num>{formatQuantity(entry.requestedQuantity, entry.unit)}</Num>
            <Num>
              {entry.approvedQuantity === null
                ? "—"
                : formatQuantity(entry.approvedQuantity, entry.unit)}
            </Num>
          </LineRow>
        ))}
      </Panel>
      <Panel>
        <PanelHeader>Stock check</PanelHeader>
        {indent.lines.map((entry) => (
          <StockLine key={entry.materialCode}>
            <StockLineTitle>{entry.materialName}</StockLineTitle>
            <StockRecommendation
              materialCode={entry.materialCode}
              projectId={indent.projectId}
              requestedQuantity={entry.requestedQuantity}
              unit={entry.unit}
            />
          </StockLine>
        ))}
      </Panel>
      <Panel>
        <PanelHeader>Linked procurement</PanelHeader>
        {linkedOrders.length ? (
          linkedOrders.map((order) => (
            <PORow
              href={`/procurement/purchase-orders/${order.id}`}
              key={order.id}
            >
              <div>
                <Badge variant="outline">{order.id}</Badge>{" "}
                {getVendorById(order.vendorId)?.name ?? order.vendorId}
                <div>
                  <PORowMeta>
                    {formatCurrency(calculatePurchaseOrderValue(order), {
                      maximumFractionDigits: 0,
                    })}
                  </PORowMeta>
                </div>
              </div>
              <StatusBadge status={order.status} />
            </PORow>
          ))
        ) : indent.hasProcurementRequest ? (
          <ProcurementNote>
            <ClipboardCheck aria-hidden="true" strokeWidth={1.75} />
            <div>
              <Badge variant="info">Procurement Request Raised</Badge>
              <div>
                A purchase request referencing this indent has been raised in
                the procurement module. See{" "}
                <Link href="/procurement/requests">Purchase Requests</Link> for
                progress.
              </div>
            </div>
          </ProcurementNote>
        ) : (
          <EmptyState
            compact
            description="No purchase order has been raised against this indent yet."
            icon={<PackageSearch aria-hidden="true" strokeWidth={1.75} />}
            title="No purchase order raised yet"
          />
        )}
      </Panel>
    </Root>
  );
}

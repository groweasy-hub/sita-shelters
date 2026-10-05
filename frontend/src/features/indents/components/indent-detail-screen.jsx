"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  FileSearch,
  Mail,
  PackageSearch,
  Phone,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Warehouse,
  XCircle,
} from "lucide-react";
import styled from "styled-components";

import { ConfirmationDialog, KpiCard, KpiGrid, PageHeader, StatusBadge } from "@/components/shared";
import { Timeline, TimelineItem } from "@/components/shared/timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { hasPermission } from "@/config/permissions";
import { getStatusConfig } from "@/config/status";
import {
  calculatePurchaseOrderValue,
  usePurchaseOrdersForIndent,
} from "@/features/procurement";
import { useCurrentUser } from "@/features/profile";
import { formatCurrency, formatDate, formatDateTime, formatQuantity } from "@/lib/formatters";
import { ROLE_LABELS } from "@/config/permissions";
import { getUserNameWithRole } from "@/lib/mock-data/users";
import { useApproveIndent, useIndent, useIndentTimeline } from "../hooks/use-indents";
import { StockRecommendation } from "./stock-recommendation";
import { useVendorLookup } from "@/features/vendors";

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
const TimelinePanelHeader = styled(PanelHeader)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;
const TimelineToggleButton = styled.button`
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.mutedForeground};
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceMuted};
    color: ${({ theme }) => theme.colors.foreground};
  }
  svg {
    width: 1rem;
    height: 1rem;
  }
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
  grid-template-columns: minmax(0, 1fr) 5.5rem 5.5rem;
  gap: 0.5rem;
  @media (min-width: 560px) {
    grid-template-columns: minmax(0, 1.6fr) repeat(2, 8rem);
    gap: 1rem;
  }
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
  flex-wrap: wrap;
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
const WaitingNote = styled.div`
  padding: 1rem 1.25rem;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.8125rem;
  line-height: 1.5;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const ApproverRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child {
    border-bottom: 0;
  }
`;
const ApproverName = styled.p`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 650;
`;
const ApproverRole = styled.p`
  margin: 0.125rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const ApproverContact = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  a {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 0.8125rem;
    font-weight: 600;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
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

/** Picks an icon for a timeline event by keyword, since labels are free text from the backend. */
function timelineIcon(label) {
  if (label.includes("rejected") || label.includes("sent back")) return XCircle;
  if (label.includes("Quality check")) return ShieldCheck;
  if (label.includes("transit")) return Truck;
  if (label.includes("store") || label.includes("confirmed")) return Warehouse;
  if (label.includes("Purchase order")) return ShoppingCart;
  if (label.includes("Quotation")) return FileSearch;
  if (label.includes("Procurement request")) return ClipboardList;
  if (label.includes("approved") || label.includes("Approved")) return BadgeCheck;
  if (label.includes("raised")) return ClipboardCheck;
  return Clock3;
}

export function IndentDetailScreen({ indentId }) {
  const { getName } = useVendorLookup();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const { data: indent } = useIndent(indentId);
  const { data: linkedOrders = [] } = usePurchaseOrdersForIndent(indentId);
  const { data: timeline = [] } = useIndentTimeline(indentId);
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const approveMutation = useApproveIndent();
  const canApprove =
    currentUser && hasPermission(currentUser.role, "indents:approve");
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
          value={
            indent.requestedByName
              ? `${indent.requestedByName} — ${ROLE_LABELS[indent.requestedByRole] ?? indent.requestedByRole ?? "Employee"}`
              : getUserNameWithRole(indent.requestedById)
          }
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
      {canApprove &&
      (indent.status === "submitted" || indent.status === "under-review") ? (
        <Panel>
          <PanelHeader>Awaiting your review</PanelHeader>
          <StepperFooter style={{ paddingTop: "1.25rem" }}>
            <ConfirmationDialog
              confirmLabel="Approve & Send to Procurement"
              description="This indent's lines will be sent to procurement as a purchase request, ready for vendor quotations."
              onConfirm={() => approveMutation.mutateAsync(indentId)}
              pending={approveMutation.isPending}
              title="Approve this indent?"
              trigger={
                <Button>
                  <ClipboardCheck aria-hidden="true" strokeWidth={1.75} />
                  Approve & Send to Procurement
                </Button>
              }
            />
          </StepperFooter>
        </Panel>
      ) : null}
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
                {getName(order.vendorId)}
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
      {indent.waitingOnStage &&
      !["completed", "rejected", "draft"].includes(indent.waitingOnStage) ? (
        <Panel>
          <PanelHeader>Waiting for the next step</PanelHeader>
          <WaitingNote>
            <strong>{indent.waitingOnLabel}</strong> — it&apos;s waiting on
            one of the people below. Contact them directly to move it along.
          </WaitingNote>
          {indent.waitingOn.length ? (
            indent.waitingOn.map((person) => (
              <ApproverRow key={person.id}>
                <div>
                  <ApproverName>{person.name}</ApproverName>
                  <ApproverRole>
                    {ROLE_LABELS[person.role] ?? person.role}
                  </ApproverRole>
                </div>
                <ApproverContact>
                  <a href={`mailto:${person.email}`}>
                    <Mail aria-hidden="true" strokeWidth={1.75} />
                    {person.email}
                  </a>
                  {person.mobile ? (
                    <a href={`tel:${person.mobile}`}>
                      <Phone aria-hidden="true" strokeWidth={1.75} />
                      {person.mobile}
                    </a>
                  ) : null}
                </ApproverContact>
              </ApproverRow>
            ))
          ) : (
            <EmptyState
              compact
              description="Nobody is currently assigned the role that can take this step on this project. Contact your administrator."
              title="No one assigned to this step yet"
            />
          )}
        </Panel>
      ) : null}
      <Panel>
        <TimelinePanelHeader>
          Activity timeline
          <TimelineToggleButton
            aria-expanded={timelineExpanded}
            aria-label={
              timelineExpanded
                ? "Collapse activity timeline"
                : "Expand activity timeline"
            }
            onClick={() => setTimelineExpanded((expanded) => !expanded)}
            type="button"
          >
            {timelineExpanded ? (
              <ChevronUp aria-hidden="true" strokeWidth={1.75} />
            ) : (
              <ChevronDown aria-hidden="true" strokeWidth={1.75} />
            )}
          </TimelineToggleButton>
        </TimelinePanelHeader>
        {!timelineExpanded ? null : timeline.length ? (
          <Timeline>
            {timeline.map((event, index) => {
              const actor = [event.actorName, event.actorRole ? ROLE_LABELS[event.actorRole] ?? event.actorRole : null]
                .filter(Boolean)
                .join(" — ");
              const vendorName = event.vendorId ? getName(event.vendorId) : null;
              const meta = [
                formatDateTime(event.at),
                actor || null,
                vendorName,
                event.detail,
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <TimelineItem
                  icon={timelineIcon(event.label)}
                  key={`${event.at}-${index}`}
                  meta={meta}
                  title={event.label}
                />
              );
            })}
          </Timeline>
        ) : (
          <EmptyState
            compact
            description="Nothing has happened on this indent yet."
            title="No activity yet"
          />
        )}
      </Panel>
    </Root>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  IndianRupee,
  PackageCheck,
  PackageOpen,
  Send,
  Truck,
} from "lucide-react";
import styled from "styled-components";

import {
  ApprovalTimeline,
  ConfirmationDialog,
  KpiCard,
  KpiGrid,
  PageHeader,
  ScrollRows,
  StatusBadge,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/feedback/empty-state";
import { hasPermission, ROLE_LABELS } from "@/config/permissions";
import { useInwardRecordsForPurchaseOrder } from "@/features/inward";
import { useCurrentUser } from "@/features/profile";
import { formatCurrency, formatDate, formatQuantity } from "@/lib/formatters";
import { calculateNetRate } from "../lib/quotation-metrics";
import {
  useApprovePurchaseOrder,
  usePurchaseOrder,
  useRejectPurchaseOrder,
  useReleasePurchaseOrder,
  useSendBackPurchaseOrder,
} from "../hooks/use-purchase-orders";
import { useAllQuotations } from "../hooks/use-quotations";
import {
  calculateDeliveredValue,
  calculateDeliveryProgress,
  calculatePurchaseOrderValue,
} from "../lib/purchase-order-metrics";
import { useVendorLookup } from "@/features/vendors";

const Root = styled.div`
  display: grid;
  max-width: 76rem;
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
const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1.4fr) repeat(3, 7rem);
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8125rem;
  &:last-child {
    border-bottom: 0;
  }
`;
const ItemRowHead = styled(ItemRow)`
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
const DeliveryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8125rem;
  &:last-child {
    border-bottom: 0;
  }
`;
const DeliveryLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
`;
const DeliveryIcon = styled.span`
  display: inline-flex;
  color: ${({ theme, $delivered }) =>
    $delivered ? theme.colors.success : theme.colors.mutedForeground};
  svg {
    width: 1rem;
    height: 1rem;
  }
`;
const LinkedIndentNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1.25rem;
  font-size: 0.875rem;
`;
const QuoteRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) 7rem 7rem;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8125rem;
  &:last-child {
    border-bottom: 0;
  }
`;
const QuoteRowHead = styled(QuoteRow)`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.7rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;
const ActionBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
`;
const InlineError = styled.p`
  margin: 0;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.danger}40;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.danger}18;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.8125rem;
`;
const RemarksField = styled.div`
  display: grid;
  gap: 0.375rem;
  margin-top: 0.75rem;
  text-align: left;
`;

function RemarksDialog({
  confirmLabel,
  destructive,
  onConfirm,
  pending,
  title,
  trigger,
}) {
  const [remarks, setRemarks] = useState("");
  return (
    <ConfirmationDialog
      confirmDisabled={remarks.trim().length === 0}
      confirmLabel={confirmLabel}
      description="Remarks are required and will be recorded on this order's approval history."
      destructive={destructive}
      onConfirm={() => onConfirm(remarks.trim())}
      onOpenChange={(open) => {
        if (!open) setRemarks("");
      }}
      pending={pending}
      title={title}
      trigger={trigger}
    >
      <RemarksField>
        <Label htmlFor="po-action-remarks">Remarks</Label>
        <Textarea
          id="po-action-remarks"
          onChange={(event) => setRemarks(event.target.value)}
          rows={3}
          value={remarks}
        />
      </RemarksField>
    </ConfirmationDialog>
  );
}

export function PurchaseOrderDetailScreen({ poId }) {
  const { getVendor, getName } = useVendorLookup();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const { data: order } = usePurchaseOrder(poId);
  const { data: quotations = [] } = useAllQuotations();
  const { data: inwardRecords = [] } = useInwardRecordsForPurchaseOrder(poId);
  const [alreadyRecordedError, setAlreadyRecordedError] = useState(false);
  const approveMutation = useApprovePurchaseOrder();
  const rejectMutation = useRejectPurchaseOrder();
  const sendBackMutation = useSendBackPurchaseOrder();
  const releaseMutation = useReleasePurchaseOrder();
  const canApprove = Boolean(
    currentUser && hasPermission(currentUser.role, "procurement:approve"),
  );
  if (!order) {
    return (
      <EmptyState
        action={
          <Button
            onClick={() => router.push("/procurement/purchase-orders")}
            variant="outline"
          >
            Back to purchase orders
          </Button>
        }
        description="This purchase order may have been removed or the reference is incorrect."
        title="Purchase order not found"
      />
    );
  }
  const vendor = getVendor(order.vendorId);
  const totalValue = calculatePurchaseOrderValue(order);
  const deliveredValue = calculateDeliveredValue(order);
  const pendingValue = totalValue - deliveredValue;
  const { delivered, total } = calculateDeliveryProgress(order);
  const linkedQuotations = order.quotationLineIds
    .map((id) => quotations.find((quote) => quote.id === id))
    .filter(Boolean);
  const actor = {
    approver: currentUser.name,
    role: ROLE_LABELS[currentUser.role] ?? currentUser.role,
  };

  return (
    <Root>
      <div>
        <BackLink href="/procurement/purchase-orders">
          <ArrowLeft aria-hidden="true" />
          Back to purchase orders
        </BackLink>
      </div>
      <PageHeader
        description={order.termsNote}
        eyebrow={`${vendor?.name ?? order.vendorId} · ${order.projectName}`}
        meta={
          <>
            <Badge variant="outline">{order.id}</Badge>
            <StatusBadge status={order.status} />
          </>
        }
        title={order.id}
      />
      {canApprove &&
      (order.status === "pending-approval" || order.status === "approved") ? (
        <Panel>
          <PanelHeader>
            {order.status === "pending-approval"
              ? "Awaiting approval"
              : "Approved — ready to release"}
          </PanelHeader>
          <ActionBar>
            {order.status === "pending-approval" ? (
              <>
                <ConfirmationDialog
                  confirmLabel="Approve"
                  description="This order will move to Approved and can then be released to the supplier."
                  onConfirm={() =>
                    approveMutation.mutateAsync({ poId, ...actor, remarks: "" })
                  }
                  pending={approveMutation.isPending}
                  title="Approve this purchase order?"
                  trigger={<Button>Approve</Button>}
                />
                <RemarksDialog
                  confirmLabel="Reject"
                  destructive
                  onConfirm={(remarks) =>
                    rejectMutation.mutateAsync({ poId, ...actor, remarks })
                  }
                  pending={rejectMutation.isPending}
                  title="Reject this purchase order?"
                  trigger={<Button variant="destructive">Reject</Button>}
                />
                <RemarksDialog
                  confirmLabel="Send back"
                  onConfirm={(remarks) =>
                    sendBackMutation.mutateAsync({ poId, ...actor, remarks })
                  }
                  pending={sendBackMutation.isPending}
                  title="Send this purchase order back for revision?"
                  trigger={<Button variant="outline">Send Back</Button>}
                />
              </>
            ) : (
              <ConfirmationDialog
                confirmLabel="Release"
                description="Releasing marks this order ready for the supplier to fulfil. No email integration exists yet — this only updates the system status."
                onConfirm={() =>
                  releaseMutation.mutateAsync({ poId, ...actor })
                }
                pending={releaseMutation.isPending}
                title="Release this purchase order?"
                trigger={
                  <Button>
                    <Send aria-hidden="true" strokeWidth={1.75} />
                    Release
                  </Button>
                }
              />
            )}
          </ActionBar>
        </Panel>
      ) : null}
      {order.status === "released" ||
      order.status === "partially-delivered" ||
      inwardRecords.length > 0 ? (
        <Panel>
          <PanelHeader>
            {inwardRecords.length ? "Goods received" : "Awaiting delivery"}
            {inwardRecords.length ? (
              <Badge variant="outline">Already recorded inward</Badge>
            ) : null}
          </PanelHeader>
          {inwardRecords.length ? (
            inwardRecords.map((record) => (
              <DeliveryRow key={record.id}>
                <DeliveryLeft>
                  <DeliveryIcon $delivered={record.stage === "received"}>
                    <Truck aria-hidden="true" strokeWidth={1.75} />
                  </DeliveryIcon>
                  <span>
                    <Link href={`/inward/${record.id}`}>{record.id}</Link>{" "}
                    · {record.vehicleNumber} · Received{" "}
                    {formatDate(record.receivedAt)}
                  </span>
                </DeliveryLeft>
                <StatusBadge status={record.stage} />
              </DeliveryRow>
            ))
          ) : null}
          {order.status === "released" ||
          order.status === "partially-delivered" ? (
            <ActionBar>
              {inwardRecords.length ? (
                <Button
                  onClick={() => setAlreadyRecordedError(true)}
                  type="button"
                  variant="outline"
                >
                  <Truck aria-hidden="true" strokeWidth={1.75} />
                  Already Recorded Inward Entry
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link href={`/inward/new?purchaseOrderId=${order.id}`}>
                    <Truck aria-hidden="true" strokeWidth={1.75} />
                    Record Inward Entry
                  </Link>
                </Button>
              )}
              {alreadyRecordedError ? (
                <InlineError role="alert">
                  An inward entry has already been recorded for this purchase
                  order ({inwardRecords[0]?.id}).
                </InlineError>
              ) : null}
            </ActionBar>
          ) : null}
        </Panel>
      ) : null}
      <KpiGrid>
        <KpiCard
          icon={IndianRupee}
          label="Order value"
          value={formatCurrency(totalValue, { maximumFractionDigits: 0 })}
        />
        <KpiCard
          icon={PackageCheck}
          label="Delivered so far"
          tone="success"
          value={formatCurrency(deliveredValue, { maximumFractionDigits: 0 })}
        />
        <KpiCard
          icon={PackageOpen}
          label="Pending value"
          tone={pendingValue > 0 ? "warning" : undefined}
          value={formatCurrency(pendingValue, { maximumFractionDigits: 0 })}
        />
        <KpiCard
          icon={Truck}
          label="Delivery progress"
          value={
            total === 0 ? "Not scheduled" : `${delivered}/${total} delivered`
          }
        />
      </KpiGrid>
      <Panel>
        <PanelHeader>Order items</PanelHeader>
        <ScrollRows minWidth="34rem">
        <ItemRowHead>
          <span>#</span>
          <span>Description</span>
          <Num>Qty</Num>
          <Num>Rate</Num>
          <Num>Amount</Num>
        </ItemRowHead>
        {order.items.map((entry, index) => (
          <ItemRow key={entry.materialCode}>
            <span>{index + 1}</span>
            <span>{entry.materialName}</span>
            <Num>{formatQuantity(entry.orderedQuantity, entry.unit)}</Num>
            <Num>{formatCurrency(entry.unitPrice)}</Num>
            <Num>
              {formatCurrency(
                entry.orderedQuantity *
                  entry.unitPrice *
                  (1 + entry.taxPercent / 100),
                { maximumFractionDigits: 0 },
              )}
            </Num>
          </ItemRow>
        ))}
        </ScrollRows>
      </Panel>
      <Panel>
        <PanelHeader>Delivery schedule</PanelHeader>
        {order.deliverySchedule.length ? (
          order.deliverySchedule.map((entry) => (
            <DeliveryRow key={entry.id}>
              <DeliveryLeft>
                <DeliveryIcon $delivered={entry.status === "delivered"}>
                  <Truck aria-hidden="true" strokeWidth={1.75} />
                </DeliveryIcon>
                <span>Planned {formatDate(entry.plannedDate)}</span>
              </DeliveryLeft>
              <span>{formatQuantity(entry.quantity)}</span>
              <Badge
                variant={entry.status === "delivered" ? "success" : "muted"}
              >
                {entry.status === "delivered" ? "Delivered" : "Pending"}
              </Badge>
            </DeliveryRow>
          ))
        ) : (
          <EmptyState
            compact
            description="This order was cancelled before any delivery was scheduled."
            title="No deliveries scheduled"
          />
        )}
      </Panel>
      <Panel>
        <PanelHeader>Linked quotations</PanelHeader>
        {linkedQuotations.length ? (
          <>
            <ScrollRows minWidth="36rem">
            <QuoteRowHead>
              <span>Quotation</span>
              <span>Supplier</span>
              <Num>Quoted rate</Num>
              <Num>PO rate</Num>
            </QuoteRowHead>
            {linkedQuotations.map((quote) => {
              const orderItem = order.items.find(
                (entry) => entry.materialCode === quote.materialCode,
              );
              const quotedRate = calculateNetRate(quote);
              return (
                <QuoteRow key={quote.id}>
                  <span>
                    <Badge variant="outline">{quote.id}</Badge>{" "}
                    {quote.quotationNumber}
                  </span>
                  <span>
                    {getName(quote.vendorId)}
                  </span>
                  <Num>{formatCurrency(quotedRate)}</Num>
                  <Num>
                    {orderItem ? formatCurrency(orderItem.unitPrice) : "—"}
                  </Num>
                </QuoteRow>
              );
            })}
            </ScrollRows>
          </>
        ) : (
          <EmptyState
            compact
            description="This purchase order was raised directly by procurement, without a traced quotation line."
            title="No linked quotations"
          />
        )}
      </Panel>
      <Panel>
        <PanelHeader>Approval history</PanelHeader>
        <ApprovalTimeline approvals={order.approvals} />
      </Panel>
      <Panel>
        <PanelHeader>Linked indent</PanelHeader>
        {order.sourceIndentId ? (
          <LinkedIndentNote>
            <Badge variant="info">{order.sourceIndentId}</Badge>
            <span>
              Raised against{" "}
              <Link href={`/indents/${order.sourceIndentId}`}>
                {order.sourceIndentId}
              </Link>
              .
            </span>
          </LinkedIndentNote>
        ) : (
          <EmptyState
            compact
            description="This purchase order was raised directly by procurement, without a source indent."
            title="No linked indent"
          />
        )}
      </Panel>
    </Root>
  );
}

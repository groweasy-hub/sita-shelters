"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, TriangleAlert } from "lucide-react";
import styled from "styled-components";

import { ConfirmationDialog, PageHeader, StatusBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/feedback/empty-state";
import { hasPermission } from "@/config/permissions";
import { useCurrentUser } from "@/features/profile";
import { formatDateTime, formatQuantity } from "@/lib/formatters";
import {
  useApproveStockTransfer,
  useDispatchStockTransfer,
  useMarkTransferInTransit,
  useMarkTransferReadyForDispatch,
  useReceiveStockTransfer,
  useRejectStockTransfer,
  useStockTransfer,
} from "../hooks/use-stock-transfers";
import { TransferStockFlow } from "./transfer-stock-flow";
import { TransferWorkflowStepper } from "./transfer-workflow-stepper";

const Root = styled.div`
  display: grid;
  max-width: 84rem;
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
const RouteMeta = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  svg {
    width: 0.8125rem;
    height: 0.8125rem;
  }
`;
const SectionTitle = styled.h2`
  margin: 0 0 0.75rem;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.9375rem;
  font-weight: 650;
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
const DefinitionGrid = styled.dl`
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  margin: 0;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  dt {
    color: ${({ theme }) => theme.colors.mutedForeground};
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  dd {
    margin: 0.25rem 0 0;
    font-size: 0.9375rem;
    font-weight: 600;
  }
`;
const RejectionCallout = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.danger}40;
  background: ${({ theme }) => theme.colors.danger}12;
`;
const RejectionIcon = styled.span`
  display: grid;
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.danger}20;
  color: ${({ theme }) => theme.colors.danger};
  svg {
    width: 1.125rem;
    height: 1.125rem;
  }
`;
const RejectionBody = styled.div`
  display: grid;
  gap: 0.125rem;
`;
const RejectionTitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.8125rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;
const RejectionReason = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.9375rem;
  line-height: 1.4rem;
`;
const CrossLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;
const ActionBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1.25rem;
`;
const RemarksField = styled.div`
  display: grid;
  gap: 0.375rem;
  margin-top: 0.75rem;
  text-align: left;
`;

function RejectDialog({ pending, rejectMutation, transferId, currentUserId }) {
  const [reason, setReason] = useState("");
  return (
    <ConfirmationDialog
      confirmDisabled={reason.trim().length === 0}
      confirmLabel="Reject"
      description="A rejection reason is required and will be shown on this transfer."
      destructive
      onConfirm={() =>
        rejectMutation.mutateAsync({
          transferId,
          approvedById: currentUserId,
          rejectionReason: reason.trim(),
        })
      }
      onOpenChange={(open) => {
        if (!open) setReason("");
      }}
      pending={pending}
      title="Reject this transfer request?"
      trigger={<Button variant="destructive">Reject</Button>}
    >
      <RemarksField>
        <Label htmlFor="transfer-rejection-reason">Rejection reason</Label>
        <Textarea
          id="transfer-rejection-reason"
          onChange={(event) => setReason(event.target.value)}
          rows={3}
          value={reason}
        />
      </RemarksField>
    </ConfirmationDialog>
  );
}

function DispatchDialog({ dispatchMutation, pending, transferId }) {
  const [vehicleNumber, setVehicleNumber] = useState("");
  return (
    <ConfirmationDialog
      confirmDisabled={vehicleNumber.trim().length === 0}
      confirmLabel="Dispatch"
      description="This deducts the quantity from the source site's available stock right away."
      onConfirm={() =>
        dispatchMutation.mutateAsync({
          transferId,
          vehicleNumber: vehicleNumber.trim(),
        })
      }
      onOpenChange={(open) => {
        if (!open) setVehicleNumber("");
      }}
      pending={pending}
      title="Dispatch this transfer?"
      trigger={<Button>Dispatch</Button>}
    >
      <RemarksField>
        <Label htmlFor="transfer-vehicle-number">Vehicle number</Label>
        <Input
          id="transfer-vehicle-number"
          onChange={(event) => setVehicleNumber(event.target.value)}
          placeholder="e.g. TS09AB1234"
          value={vehicleNumber}
        />
      </RemarksField>
    </ConfirmationDialog>
  );
}

export function TransferDetailScreen({ transferId }) {
  const router = useRouter();
  const { data: transfer } = useStockTransfer(transferId);
  const currentUser = useCurrentUser();
  const approveMutation = useApproveStockTransfer();
  const rejectMutation = useRejectStockTransfer();
  const readyForDispatchMutation = useMarkTransferReadyForDispatch();
  const dispatchMutation = useDispatchStockTransfer();
  const inTransitMutation = useMarkTransferInTransit();
  const receiveMutation = useReceiveStockTransfer();
  const canApprove =
    currentUser && hasPermission(currentUser.role, "stock-transfers:approve");
  const canManage =
    currentUser && hasPermission(currentUser.role, "stock-transfers:manage");
  if (!transfer) {
    return (
      <EmptyState
        action={
          <Button
            onClick={() => router.push("/stock-transfers")}
            variant="outline"
          >
            Back to stock transfers
          </Button>
        }
        description="This transfer request may have been removed or the link is incorrect."
        title="Transfer not found"
      />
    );
  }
  return (
    <Root>
      <div>
        <BackLink href="/stock-transfers">
          <ArrowLeft aria-hidden="true" />
          Back to stock transfers
        </BackLink>
      </div>
      <PageHeader
        description={transfer.remarks ?? undefined}
        eyebrow="Transfer workflow"
        meta={
          <>
            <Badge variant="outline">{transfer.id}</Badge>
            <StatusBadge status={transfer.status} />
            <RouteMeta>
              {transfer.sourceProjectName}
              <ArrowRight aria-hidden="true" />
              {transfer.destinationProjectName}
            </RouteMeta>
          </>
        }
        title={`${transfer.materialName} transfer`}
      />
      {canApprove && transfer.status === "requested" ? (
        <Panel>
          <PanelHeader>Awaiting approval</PanelHeader>
          <ActionBar>
            <ConfirmationDialog
              confirmLabel="Approve"
              description="This transfer will move to Approved and can then be prepared for dispatch."
              onConfirm={() =>
                approveMutation.mutateAsync({
                  transferId,
                  approvedById: currentUser.id,
                })
              }
              pending={approveMutation.isPending}
              title="Approve this transfer request?"
              trigger={<Button>Approve</Button>}
            />
            <RejectDialog
              currentUserId={currentUser.id}
              pending={rejectMutation.isPending}
              rejectMutation={rejectMutation}
              transferId={transferId}
            />
          </ActionBar>
        </Panel>
      ) : null}
      {canManage && transfer.status === "approved" ? (
        <Panel>
          <PanelHeader>Ready to stage for dispatch</PanelHeader>
          <ActionBar>
            <ConfirmationDialog
              confirmLabel="Mark Ready for Dispatch"
              description="Confirms the material is staged and ready to leave the source site."
              onConfirm={() =>
                readyForDispatchMutation.mutateAsync({ transferId })
              }
              pending={readyForDispatchMutation.isPending}
              title="Mark ready for dispatch?"
              trigger={<Button>Mark Ready for Dispatch</Button>}
            />
          </ActionBar>
        </Panel>
      ) : null}
      {canManage && transfer.status === "ready-for-dispatch" ? (
        <Panel>
          <PanelHeader>Ready for dispatch</PanelHeader>
          <ActionBar>
            <DispatchDialog
              dispatchMutation={dispatchMutation}
              pending={dispatchMutation.isPending}
              transferId={transferId}
            />
          </ActionBar>
        </Panel>
      ) : null}
      {canManage && transfer.status === "dispatched" ? (
        <Panel>
          <PanelHeader>Dispatched</PanelHeader>
          <ActionBar>
            <ConfirmationDialog
              confirmLabel="Mark In Transit"
              description="Confirms the vehicle has left the source site."
              onConfirm={() => inTransitMutation.mutateAsync({ transferId })}
              pending={inTransitMutation.isPending}
              title="Mark this transfer in transit?"
              trigger={<Button variant="outline">Mark In Transit</Button>}
            />
            <ConfirmationDialog
              confirmLabel="Receive"
              description="This credits the quantity to the destination site's available stock."
              onConfirm={() => receiveMutation.mutateAsync({ transferId })}
              pending={receiveMutation.isPending}
              title="Receive this transfer?"
              trigger={<Button>Receive</Button>}
            />
          </ActionBar>
        </Panel>
      ) : null}
      {canManage && transfer.status === "in-transit" ? (
        <Panel>
          <PanelHeader>In transit</PanelHeader>
          <ActionBar>
            <ConfirmationDialog
              confirmLabel="Receive"
              description="This credits the quantity to the destination site's available stock."
              onConfirm={() => receiveMutation.mutateAsync({ transferId })}
              pending={receiveMutation.isPending}
              title="Receive this transfer?"
              trigger={<Button>Receive</Button>}
            />
          </ActionBar>
        </Panel>
      ) : null}
      <section>
        <SectionTitle>Workflow status</SectionTitle>
        <TransferWorkflowStepper
          approvedById={transfer.approvedById}
          status={transfer.status}
        />
      </section>
      <section>
        <SectionTitle>Stock position</SectionTitle>
        <TransferStockFlow transfer={transfer} />
      </section>
      {transfer.status === "rejected" ? (
        <RejectionCallout role="alert">
          <RejectionIcon>
            <TriangleAlert aria-hidden="true" />
          </RejectionIcon>
          <RejectionBody>
            <RejectionTitle>Rejection reason</RejectionTitle>
            <RejectionReason>{transfer.rejectionReason}</RejectionReason>
          </RejectionBody>
        </RejectionCallout>
      ) : null}
      <Panel>
        <PanelHeader>Transfer details</PanelHeader>
        <DefinitionGrid>
          <div>
            <dt>Material</dt>
            <dd>{transfer.materialName}</dd>
          </div>
          <div>
            <dt>Material code</dt>
            <dd>{transfer.materialCode}</dd>
          </div>
          <div>
            <dt>Quantity</dt>
            <dd>{formatQuantity(transfer.quantity, transfer.unit)}</dd>
          </div>
          <div>
            <dt>Requested by</dt>
            <dd>{transfer.requestedByName}</dd>
          </div>
          <div>
            <dt>Requested on</dt>
            <dd>{formatDateTime(transfer.requestedAt)}</dd>
          </div>
          <div>
            <dt>Approved by</dt>
            <dd>{transfer.approvedByName ?? "Not yet approved"}</dd>
          </div>
          <div>
            <dt>Dispatched on</dt>
            <dd>{formatDateTime(transfer.dispatchedAt)}</dd>
          </div>
          <div>
            <dt>Received on</dt>
            <dd>{formatDateTime(transfer.receivedAt)}</dd>
          </div>
          <div>
            <dt>Vehicle number</dt>
            <dd>{transfer.vehicleNumber ?? "Not assigned"}</dd>
          </div>
          <div>
            <dt>Remarks</dt>
            <dd>{transfer.remarks ?? "—"}</dd>
          </div>
        </DefinitionGrid>
      </Panel>
      <CrossLinks>
        <Button asChild size="sm" variant="outline">
          <Link href={`/projects/${transfer.sourceProjectId}`}>
            View source project
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/projects/${transfer.destinationProjectId}`}>
            View destination project
          </Link>
        </Button>
      </CrossLinks>
    </Root>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, TriangleAlert } from "lucide-react";
import styled from "styled-components";

import { PageHeader, StatusBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { formatDateTime, formatQuantity } from "@/lib/formatters";
import { useStockTransfer } from "../hooks/use-stock-transfers";
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

export function TransferDetailScreen({ transferId }) {
  const router = useRouter();
  const { data: transfer } = useStockTransfer(transferId);
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

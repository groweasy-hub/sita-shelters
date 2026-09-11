"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CircleCheck,
  CircleX,
  Info,
  PackageCheck,
  Undo2,
} from "lucide-react";
import styled from "styled-components";

import { KpiCard, KpiGrid, PageHeader, StatusBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { formatDateTime, formatQuantity } from "@/lib/formatters";
import { getUserName } from "@/lib/mock-data/users";
import { useQualityControlInspection } from "../hooks/use-quality-control";

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

export function QcDetailScreen({ qcId }) {
  const router = useRouter();
  const { data: record } = useQualityControlInspection(qcId);
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
        description={`${record.materialName} received against ${record.inwardId}, inspected by ${getUserName(record.inspectorId)}.`}
        eyebrow={record.projectName}
        meta={
          <>
            <Badge variant="outline">{record.id}</Badge>
            <StatusBadge status={record.status} />
          </>
        }
        title={record.id}
      />
      <KpiGrid>
        <KpiCard label="Linked GRN" value={record.inwardId} />
        <KpiCard
          label="Received quantity"
          value={formatQuantity(record.receivedQuantity, record.unit)}
        />
        <KpiCard label="Inspector" value={getUserName(record.inspectorId)} />
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
      <Panel>
        <PanelHeader>Inspector remarks</PanelHeader>
        <PanelBody>{record.remarks}</PanelBody>
      </Panel>
      <Panel>
        <PanelHeader>What happens next</PanelHeader>
        <FlowNote>
          <PackageCheck aria-hidden="true" />
          Accepted quantity moves into site inventory for the project once
          recorded.
        </FlowNote>
        <FlowNote>
          <Undo2 aria-hidden="true" />
          Rejected quantity is routed to a vendor return instead of entering
          stock.
        </FlowNote>
        <FlowNote>
          <Info aria-hidden="true" />
          This is a status description only — the mock data set does not write
          back to the inventory or returns features.
        </FlowNote>
      </Panel>
    </Root>
  );
}

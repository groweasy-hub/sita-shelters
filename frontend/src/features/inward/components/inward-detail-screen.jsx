"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ClipboardCheck, FileText } from "lucide-react";
import styled from "styled-components";

import {
  ApprovalTimeline,
  KpiCard,
  KpiGrid,
  PageHeader,
  ScrollRows,
  StatusBadge,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { useQualityControlInspectionsForInward } from "@/features/quality-control";
import { formatDateTime, formatQuantity } from "@/lib/formatters";
import { getUserNameWithRole } from "@/lib/mock-data/users";
import { ROLE_LABELS } from "@/config/permissions";
import { useInwardRecord } from "../hooks/use-inward";
import { GrnWorkflowActions } from "./grn-workflow-actions";
import { GrnWorkflowStepper } from "./grn-workflow-stepper";
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
const LineRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) repeat(6, 6.5rem);
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8125rem;
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
const WarnNum = styled(Num)`
  color: ${({ theme, $active }) => ($active ? theme.colors.danger : "inherit")};
  font-weight: ${({ $active }) => ($active ? 650 : 400)};
`;
const QcActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
`;
const QcRow = styled(Link)`
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
const QcRowMeta = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;

export function InwardDetailScreen({ inwardId }) {
  const { getVendor } = useVendorLookup();
  const router = useRouter();
  const { data: record } = useInwardRecord(inwardId);
  const { data: linkedInspections = [] } =
    useQualityControlInspectionsForInward(inwardId);
  if (!record) {
    return (
      <EmptyState
        action={
          <Button onClick={() => router.push("/inward")} variant="outline">
            Back to goods inward
          </Button>
        }
        description="This goods-inward record may have been removed or the reference is incorrect."
        title="Record not found"
      />
    );
  }
  const vendor = getVendor(record.vendorId);
  return (
    <Root>
      <div>
        <BackLink href="/inward">
          <ArrowLeft aria-hidden="true" />
          Back to goods inward
        </BackLink>
      </div>
      <PageHeader
        description="Arrival on site does not mean available stock. Material passes quality control, the GRN is approved by the Site Engineer and the Project Manager (who authorises stock posting), and the Store Manager confirms receipt before it can be used."
        eyebrow={`${vendor?.name ?? record.vendorId} · ${record.projectName}`}
        meta={
          <>
            <Badge variant="outline">{record.id}</Badge>
            <StatusBadge status={record.stage} />
          </>
        }
        title={record.id}
      />
      <GrnWorkflowStepper approvals={record.approvals} stage={record.stage} />
      <GrnWorkflowActions record={record} />
      {record.stage === "closed" ? (
        <Panel>
          <PanelHeader>No GRN raised</PanelHeader>
          <QcActions>
            Quality control accepted nothing from this delivery, so there is nothing to
            approve or post. The rejected quantity goes back to the vendor.
          </QcActions>
        </Panel>
      ) : null}
      <KpiGrid>
        <KpiCard label="Purchase order" value={record.purchaseOrderId} />
        <KpiCard label="Received" value={formatDateTime(record.receivedAt)} />
        <KpiCard label="Material lines" value={record.lines.length} />
        <KpiCard label="Invoice #" value={record.invoiceNumber} />
        <KpiCard
          label="Recorded by"
          value={
            record.recordedById
              ? getUserNameWithRole(record.recordedById)
              : "Not recorded"
          }
        />
      </KpiGrid>
      <Panel>
        <PanelHeader>Vendor & transport details</PanelHeader>
        <DefinitionGrid>
          <div>
            <dt>Vehicle number</dt>
            <dd>{record.vehicleNumber}</dd>
          </div>
          <div>
            <dt>Driver name</dt>
            <dd>{record.driverName}</dd>
          </div>
          <div>
            <dt>Transporter</dt>
            <dd>{record.transporterName}</dd>
          </div>
          <div>
            <dt>Delivery challan #</dt>
            <dd>{record.deliveryChallanNumber}</dd>
          </div>
        </DefinitionGrid>
      </Panel>
      <Panel>
        <PanelHeader>Materials received</PanelHeader>
        <ScrollRows minWidth="48rem">
        <LineRowHead>
          <span>Material</span>
          <Num>Ordered</Num>
          <Num>Received</Num>
          <Num>Damaged</Num>
          <Num>Missing</Num>
          <Num>QC accepted</Num>
          <Num>QC rejected</Num>
        </LineRowHead>
        {record.lines.map((entry) => (
          <LineRow key={entry.materialCode}>
            <span>{entry.materialName}</span>
            <Num>{formatQuantity(entry.orderedQuantity, entry.unit)}</Num>
            <Num>{formatQuantity(entry.receivedQuantity, entry.unit)}</Num>
            <WarnNum $active={entry.damagedQuantity > 0}>
              {formatQuantity(entry.damagedQuantity, entry.unit)}
            </WarnNum>
            <WarnNum $active={entry.missingQuantity > 0}>
              {formatQuantity(entry.missingQuantity, entry.unit)}
            </WarnNum>
            <Num>{formatQuantity(entry.acceptedQuantity, entry.unit)}</Num>
            <WarnNum $active={entry.rejectedQuantity > 0}>
              {formatQuantity(entry.rejectedQuantity, entry.unit)}
            </WarnNum>
          </LineRow>
        ))}
        </ScrollRows>
      </Panel>
      <Panel>
        <PanelHeader>Quality control</PanelHeader>
        {linkedInspections.length ? (
          linkedInspections.map((inspection) => (
            <QcRow
              href={`/quality-control/${inspection.id}`}
              key={inspection.id}
            >
              <div>
                <Badge variant="outline">{inspection.id}</Badge>{" "}
                {inspection.materialName}
                <div>
                  <QcRowMeta>
                    {inspection.inspectorName
                      ? `Inspector: ${inspection.inspectorName}`
                      : "Awaiting inspection — open to perform the quality check"}
                  </QcRowMeta>
                </div>
              </div>
              <StatusBadge status={inspection.status} />
            </QcRow>
          ))
        ) : (
          <QcActions>
            <ClipboardCheck aria-hidden="true" strokeWidth={1.75} />
            <span>
              {record.status === "pending-qc"
                ? "This delivery is waiting to be sent for inspection."
                : record.status === "under-inspection"
                  ? "This delivery is currently under quality inspection."
                  : "Quality control has already recorded a verdict for this delivery."}
            </span>
            <Button asChild size="sm" variant="outline">
              <Link href="/quality-control">
                <FileText aria-hidden="true" />
                View quality control
              </Link>
            </Button>
          </QcActions>
        )}
      </Panel>
      <Panel>
        <PanelHeader>GRN approvals</PanelHeader>
        <ApprovalTimeline
          approvals={record.approvals.map((entry) => ({
            ...entry,
            role: ROLE_LABELS[entry.role] ?? entry.role,
          }))}
        />
      </Panel>
    </Root>
  );
}

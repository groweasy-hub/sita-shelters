"use client";

import { ArrowRight, Ban, PackageCheck, Truck, Warehouse } from "lucide-react";
import styled from "styled-components";

import { formatQuantity } from "@/lib/formatters";

const Root = styled.div`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: 1fr;
  @media (min-width: 768px) {
    grid-template-columns: 1fr auto 1fr auto 1fr;
    align-items: stretch;
  }
`;
const Arrow = styled.div`
  display: none;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.mutedForeground};
  @media (min-width: 768px) {
    display: flex;
  }
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;
const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid
    ${({ theme, $dimmed }) => ($dimmed ? theme.colors.border : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme, $tone }) =>
    $tone ? `${theme.colors[$tone]}0d` : theme.colors.card};
  opacity: ${({ $dimmed }) => ($dimmed ? 0.55 : 1)};
`;
const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme, $tone }) =>
    $tone ? theme.colors[$tone] : theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  svg {
    width: 0.9375rem;
    height: 0.9375rem;
  }
`;
const CardTitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.9375rem;
  font-weight: 650;
`;
const CardValue = styled.p`
  margin: 0;
  color: ${({ theme, $tone }) =>
    $tone ? theme.colors[$tone] : theme.colors.foreground};
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;
const CardNote = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  line-height: 1.35rem;
`;

/**
 * Derives the presentational state of stock across the three positions for a
 * given transfer status. Nothing here mutates live inventory (there is no
 * backend) — it narrates the rule described in the feature spec: quantity is
 * reserved (not deducted) up to dispatch, "in transit" (deducted from
 * source, not yet added to destination) between dispatch and receipt, and
 * only added to the destination once `received`.
 */
function deriveFlowStage(status) {
  switch (status) {
    case "draft":
    case "requested":
      return {
        source: { note: "Pending request — stock not yet reserved", tone: undefined, show: false },
        transit: { note: "Not dispatched", tone: undefined, show: false },
        destination: { note: "Awaiting request outcome", tone: undefined, show: false },
      };
    case "approved":
    case "ready-for-dispatch":
      return {
        source: { note: "Reserved for transfer (not yet deducted)", tone: "warning", show: true },
        transit: { note: "Pending dispatch", tone: undefined, show: false },
        destination: { note: "Awaiting dispatch", tone: undefined, show: false },
      };
    case "dispatched":
    case "in-transit":
      return {
        source: { note: "Deducted from source available stock", tone: "danger", show: true, deducted: true },
        transit: { note: "In transit to destination", tone: "info", show: true },
        destination: { note: "Awaiting arrival", tone: undefined, show: false },
      };
    case "received":
      return {
        source: { note: "Deducted from source available stock", tone: "danger", show: true, deducted: true },
        transit: { note: "Delivered", tone: "success", show: true },
        destination: { note: "Added to destination available stock", tone: "success", show: true },
      };
    case "rejected":
    default:
      return {
        source: { note: "Not moved — request was rejected", tone: undefined, show: false },
        transit: { note: "Transfer did not proceed", tone: undefined, show: false },
        destination: { note: "Not received", tone: undefined, show: false },
      };
  }
}

export function TransferStockFlow({ transfer }) {
  const stage = deriveFlowStage(transfer.status);
  const quantityLabel = formatQuantity(transfer.quantity, transfer.unit);
  const isRejected = transfer.status === "rejected";
  return (
    <Root aria-label="Source, in-transit and destination stock position">
      <Card $dimmed={!stage.source.show}>
        <CardHeader $tone={stage.source.tone}>
          <Warehouse aria-hidden="true" />
          Source
        </CardHeader>
        <CardTitle>{transfer.sourceProjectName}</CardTitle>
        <CardValue $tone={stage.source.tone}>
          {stage.source.show ? `− ${quantityLabel}` : quantityLabel}
        </CardValue>
        <CardNote>{stage.source.note}</CardNote>
      </Card>
      <Arrow>
        {isRejected ? (
          <Ban aria-hidden="true" />
        ) : (
          <ArrowRight aria-hidden="true" />
        )}
      </Arrow>
      <Card $dimmed={!stage.transit.show} $tone={stage.transit.tone}>
        <CardHeader $tone={stage.transit.tone}>
          <Truck aria-hidden="true" />
          In transit
        </CardHeader>
        <CardTitle>{transfer.vehicleNumber ?? "Not dispatched"}</CardTitle>
        <CardValue $tone={stage.transit.tone}>
          {stage.transit.show ? quantityLabel : "—"}
        </CardValue>
        <CardNote>{stage.transit.note}</CardNote>
      </Card>
      <Arrow>
        {isRejected ? (
          <Ban aria-hidden="true" />
        ) : (
          <ArrowRight aria-hidden="true" />
        )}
      </Arrow>
      <Card $dimmed={!stage.destination.show}>
        <CardHeader $tone={stage.destination.tone}>
          <PackageCheck aria-hidden="true" />
          Destination
        </CardHeader>
        <CardTitle>{transfer.destinationProjectName}</CardTitle>
        <CardValue $tone={stage.destination.tone}>
          {stage.destination.show ? `+ ${quantityLabel}` : quantityLabel}
        </CardValue>
        <CardNote>{stage.destination.note}</CardNote>
      </Card>
    </Root>
  );
}

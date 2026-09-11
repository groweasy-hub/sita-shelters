"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  IndianRupee,
  PackageCheck,
  PackageOpen,
  Truck,
} from "lucide-react";
import styled from "styled-components";

import { KpiCard, KpiGrid, PageHeader, StatusBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { formatCurrency, formatDate, formatQuantity } from "@/lib/formatters";
import { getVendorById } from "@/lib/mock-data/vendors";
import { usePurchaseOrder } from "../hooks/use-purchase-orders";
import {
  calculateDeliveredValue,
  calculateDeliveryProgress,
  calculatePurchaseOrderValue,
} from "../lib/purchase-order-metrics";

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
  grid-template-columns: minmax(0, 1.4fr) repeat(4, 7rem);
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

export function PurchaseOrderDetailScreen({ poId }) {
  const router = useRouter();
  const { data: order } = usePurchaseOrder(poId);
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
  const vendor = getVendorById(order.vendorId);
  const totalValue = calculatePurchaseOrderValue(order);
  const deliveredValue = calculateDeliveredValue(order);
  const pendingValue = totalValue - deliveredValue;
  const { delivered, total } = calculateDeliveryProgress(order);
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
        <ItemRowHead>
          <span>Material</span>
          <Num>Quantity</Num>
          <Num>Unit price</Num>
          <Num>Tax</Num>
          <Num>Line total</Num>
        </ItemRowHead>
        {order.items.map((entry) => (
          <ItemRow key={entry.materialCode}>
            <span>{entry.materialName}</span>
            <Num>{formatQuantity(entry.orderedQuantity, entry.unit)}</Num>
            <Num>{formatCurrency(entry.unitPrice)}</Num>
            <Num>{entry.taxPercent}%</Num>
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

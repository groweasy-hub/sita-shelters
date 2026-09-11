"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileSearch,
  IndianRupee,
  ShoppingBag,
} from "lucide-react";
import styled from "styled-components";

import { KpiCard, KpiGrid, PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { formatCompactNumber, formatCurrency } from "@/lib/formatters";
import { useAllPurchaseRequests } from "../hooks/use-purchase-requests";
import { useAllQuotations } from "../hooks/use-quotations";
import { useAllPurchaseOrders } from "../hooks/use-purchase-orders";
import { calculatePurchaseOrderValue } from "../lib/purchase-order-metrics";

const Root = styled.div`
  display: grid;
  max-width: 84rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const PanelGrid = styled.div`
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
`;
const Panel = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const IconFrame = styled.span`
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.primary}14;
  color: ${({ theme }) => theme.colors.primary};
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;
const PanelTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 650;
`;
const PanelDescription = styled.p`
  margin: 0;
  flex: 1 1 auto;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  line-height: 1.4rem;
`;

const PANELS = [
  {
    href: "/procurement/requests",
    icon: ClipboardList,
    title: "Purchase Requests",
    description:
      "Material requirements pushed from approved indents, awaiting RFQ.",
  },
  {
    href: "/procurement/quotations",
    icon: FileSearch,
    title: "Quotations & Comparison",
    description:
      "Vendor RFQ responses compared side by side before a PO is raised.",
  },
  {
    href: "/procurement/purchase-orders",
    icon: ShoppingBag,
    title: "Purchase Orders",
    description:
      "Orders raised with vendors, tracked through to full or partial supply.",
  },
];

export function ProcurementOverviewScreen() {
  const { data: requests = [] } = useAllPurchaseRequests();
  const { data: quotations = [] } = useAllQuotations();
  const { data: orders = [] } = useAllPurchaseOrders();
  const kpis = useMemo(() => {
    const pendingRequests = requests.filter(
      (record) => record.status === "draft" || record.status === "submitted",
    ).length;
    const quotationsInProgress = quotations.filter(
      (record) => record.status === "pending" || record.status === "received",
    ).length;
    const ordersPendingApproval = orders.filter(
      (record) =>
        record.status === "draft" || record.status === "pending-approval",
    ).length;
    const activeValue = orders
      .filter((record) =>
        ["approved", "sent", "partially-supplied"].includes(record.status),
      )
      .reduce((sum, record) => sum + calculatePurchaseOrderValue(record), 0);
    return {
      pendingRequests,
      quotationsInProgress,
      ordersPendingApproval,
      activeValue,
    };
  }, [orders, quotations, requests]);

  return (
    <Root>
      <PageHeader
        description="Requests, vendor quotations and purchase orders in one commercial operations view."
        eyebrow="Commercial operations"
        title="Procurement"
      />
      <KpiGrid>
        <KpiCard
          icon={ClipboardList}
          label="Pending requests"
          tone="warning"
          value={formatCompactNumber(kpis.pendingRequests)}
        />
        <KpiCard
          icon={FileSearch}
          label="Quotations in progress"
          tone="info"
          value={formatCompactNumber(kpis.quotationsInProgress)}
        />
        <KpiCard
          icon={ShoppingBag}
          label="POs pending approval"
          tone="warning"
          value={formatCompactNumber(kpis.ordersPendingApproval)}
        />
        <KpiCard
          icon={IndianRupee}
          label="Active PO value"
          value={formatCurrency(kpis.activeValue, { maximumFractionDigits: 0 })}
        />
      </KpiGrid>
      <PanelGrid>
        {PANELS.map((panel) => (
          <Panel key={panel.href}>
            <IconFrame>
              <panel.icon aria-hidden="true" strokeWidth={1.75} />
            </IconFrame>
            <PanelTitle>{panel.title}</PanelTitle>
            <PanelDescription>{panel.description}</PanelDescription>
            <Button asChild variant="outline">
              <Link href={panel.href}>
                Open
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </Panel>
        ))}
      </PanelGrid>
    </Root>
  );
}

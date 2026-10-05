"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import styled from "styled-components";

import { DataTable, KpiCard, KpiGrid, PageHeader } from "@/components/shared";
import { EmptyState } from "@/components/feedback/empty-state";
import { formatCompactNumber, formatCurrency } from "@/lib/formatters";
import { useAllPurchaseOrders } from "../hooks/use-purchase-orders";
import { calculatePurchaseOrderValue } from "../lib/purchase-order-metrics";
import { purchaseOrderColumns } from "./purchase-order-columns";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;

export function PurchaseOrderApprovalsScreen() {
  const router = useRouter();
  const { data: allOrders = [] } = useAllPurchaseOrders();
  const pending = useMemo(
    () => allOrders.filter((order) => order.status === "pending-approval"),
    [allOrders],
  );
  const pendingValue = useMemo(
    () =>
      pending.reduce(
        (sum, order) => sum + calculatePurchaseOrderValue(order),
        0,
      ),
    [pending],
  );

  return (
    <Root>
      <PageHeader
        description="Purchase orders awaiting authorization before release. Open an order to approve, reject, or send it back with remarks."
        eyebrow="Procurement"
        title="PO Approvals"
      />
      <KpiGrid>
        <KpiCard
          label="Pending approval"
          tone="warning"
          value={formatCompactNumber(pending.length)}
        />
        <KpiCard
          label="Value pending"
          value={formatCurrency(pendingValue, { maximumFractionDigits: 0 })}
        />
      </KpiGrid>
      {pending.length === 0 ? (
        <EmptyState
          description="Nothing is currently waiting on a procurement approval decision."
          icon={<ClipboardCheck aria-hidden="true" strokeWidth={1.75} />}
          title="All caught up"
        />
      ) : (
        <DataTable
          ariaLabel="Purchase orders pending approval"
          columns={purchaseOrderColumns}
          data={pending}
          onRowClick={(row) =>
            router.push(`/procurement/purchase-orders/${row.id}`)
          }
          search={{ placeholder: "Search PO, vendor or material" }}
        />
      )}
    </Root>
  );
}

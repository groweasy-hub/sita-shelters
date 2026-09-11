"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, FileCheck2, FileClock } from "lucide-react";
import styled from "styled-components";

import { DataTable, KpiCard, KpiGrid, PageHeader } from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCompactNumber } from "@/lib/formatters";
import { PURCHASE_REQUEST_STATUS_OPTIONS } from "../constants/procurement.constants";
import { useAllPurchaseRequests } from "../hooks/use-purchase-requests";
import { purchaseRequestColumns } from "./purchase-request-columns";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;

export function PurchaseRequestsScreen() {
  const router = useRouter();
  const [status, setStatus] = useState(null);
  const { data: requests = [] } = useAllPurchaseRequests();
  const filteredRequests = useMemo(
    () => requests.filter((record) => !status || record.status === status),
    [requests, status],
  );
  const kpis = useMemo(
    () => ({
      total: requests.length,
      draft: requests.filter((record) => record.status === "draft").length,
      submitted: requests.filter((record) => record.status === "submitted")
        .length,
      approved: requests.filter((record) => record.status === "approved")
        .length,
    }),
    [requests],
  );
  return (
    <Root>
      <PageHeader
        description="Material requirements pushed from approved indents into the procurement pipeline, before RFQs go out to vendors."
        eyebrow="Procurement"
        title="Purchase Requests"
      />
      <KpiGrid>
        <KpiCard
          icon={ClipboardList}
          label="Total requests"
          value={formatCompactNumber(kpis.total)}
        />
        <KpiCard
          icon={FileClock}
          label="Draft"
          tone="warning"
          value={kpis.draft}
        />
        <KpiCard
          icon={FileClock}
          label="Submitted"
          tone="info"
          value={kpis.submitted}
        />
        <KpiCard
          icon={FileCheck2}
          label="Approved"
          tone="success"
          value={kpis.approved}
        />
      </KpiGrid>
      <DataTable
        ariaLabel="Purchase requests"
        columns={purchaseRequestColumns}
        data={filteredRequests}
        filters={
          <Select
            onValueChange={(value) => setStatus(value === "all" ? null : value)}
            value={status ?? "all"}
          >
            <SelectTrigger aria-label="Filter by status" size="sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {PURCHASE_REQUEST_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        onResetFilters={() => setStatus(null)}
        onRowClick={(row) =>
          router.push(`/procurement/quotations?purchaseRequestId=${row.id}`)
        }
        search={{ placeholder: "Search request, project or material" }}
      />
    </Root>
  );
}

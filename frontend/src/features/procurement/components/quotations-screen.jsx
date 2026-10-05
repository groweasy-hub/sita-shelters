"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileClock, FileSearch, Plus, ShieldCheck } from "lucide-react";
import styled from "styled-components";

import { DataTable, KpiCard, KpiGrid, PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hasPermission } from "@/config/permissions";
import { useCurrentUser } from "@/features/profile";
import { formatCompactNumber } from "@/lib/formatters";
import { QUOTATION_STATUS_OPTIONS } from "../constants/procurement.constants";
import { useAllQuotations } from "../hooks/use-quotations";
import { quotationColumns } from "./quotation-columns";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;

export function QuotationsScreen() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const canRecordQuotation = Boolean(
    currentUser && hasPermission(currentUser.role, "procurement:manage"),
  );
  const [status, setStatus] = useState(null);
  const { data: quotations = [] } = useAllQuotations();
  const filtered = useMemo(
    () => quotations.filter((record) => !status || record.status === status),
    [quotations, status],
  );
  const kpis = useMemo(
    () => ({
      total: quotations.length,
      awaitingReview: quotations.filter(
        (record) =>
          record.status === "received" || record.status === "under-review",
      ).length,
      selected: quotations.filter((record) => record.status === "selected")
        .length,
    }),
    [quotations],
  );
  return (
    <Root>
      <PageHeader
        actions={
          canRecordQuotation ? (
            <Button asChild>
              <Link href="/procurement/quotations/new">
                <Plus aria-hidden="true" strokeWidth={1.75} />
                Record quotation
              </Link>
            </Button>
          ) : null
        }
        description="Every supplier quotation recorded against a purchase request, up to three per item, before item-wise comparison and selection."
        eyebrow="Procurement"
        title="Quotations"
      />
      <KpiGrid>
        <KpiCard
          icon={FileSearch}
          label="Total quotations"
          value={formatCompactNumber(kpis.total)}
        />
        <KpiCard
          icon={FileClock}
          label="Awaiting review"
          tone="warning"
          value={kpis.awaitingReview}
        />
        <KpiCard
          icon={ShieldCheck}
          label="Selected"
          tone="success"
          value={kpis.selected}
        />
      </KpiGrid>
      <DataTable
        ariaLabel="Quotations"
        columns={quotationColumns}
        data={filtered}
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
              {QUOTATION_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        onResetFilters={() => setStatus(null)}
        onRowClick={(row) =>
          router.push(
            `/procurement/quotations/compare?purchaseRequestId=${row.purchaseRequestId}`,
          )
        }
        search={{ placeholder: "Search quotation, supplier or item" }}
      />
    </Root>
  );
}

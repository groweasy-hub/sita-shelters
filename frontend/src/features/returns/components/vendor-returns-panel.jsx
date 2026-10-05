"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, PackageX, RefreshCcw, Undo2 } from "lucide-react";
import styled from "styled-components";

import {
  DataTable,
  KpiCard,
  KpiGrid,
  ProjectFilterSelect,
} from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectScope } from "@/features/profile";
import { formatCurrency } from "@/lib/formatters";
import { useProjectContextStore } from "@/stores/project-context-store";
import { VENDOR_RETURN_STATUS_OPTIONS } from "../constants/returns.constants";
import { useVendorReturns } from "../hooks/use-returns";
import { vendorReturnsColumns } from "./vendor-returns-columns";

const Root = styled.div`
  display: grid;
  gap: 1.5rem;
`;

/**
 * Rejected goods-inward quantity going back to the vendor. The verdict and the
 * replace/refund settlement are recorded on the Quality Control record, so a
 * row opens it; replacement stock arrives in site inventory when that is saved.
 */
export function VendorReturnsPanel() {
  const router = useRouter();
  const { scopeProjectIds, isLocked, defaultProjectId } = useProjectScope();
  const globalProjectId = useProjectContextStore(
    (state) => state.selectedProjectId,
  );
  const [projectId, setProjectId] = useState(
    defaultProjectId ?? globalProjectId ?? null,
  );
  const [status, setStatus] = useState(null);
  const { data: records = [], isLoading } = useVendorReturns();

  const visible = useMemo(
    () =>
      records.filter(
        (record) =>
          (projectId === null
            ? !scopeProjectIds || scopeProjectIds.includes(record.projectId)
            : record.projectId === projectId) &&
          (status === null || record.status === status),
      ),
    [records, projectId, scopeProjectIds, status],
  );
  const kpis = useMemo(
    () => ({
      open: visible.filter((record) =>
        [
          "awaiting-resolution",
          "awaiting-replacement",
          "partially-replaced",
          "refund-pending",
        ].includes(record.status),
      ).length,
      // What has actually arrived: replacement deliveries, valued at the unit price.
      receivedValue: visible.reduce(
        (total, record) =>
          total +
          (record.resolution?.replacements ?? []).reduce(
            (sum, receipt) => sum + receipt.value,
            0,
          ),
        0,
      ),
      refundedValue: visible
        .filter((record) => record.status === "refunded")
        .reduce((total, record) => total + (record.resolution?.amount ?? 0), 0),
    }),
    [visible],
  );

  return (
    <Root>
      <KpiGrid>
        <KpiCard
          icon={Undo2}
          label="Vendor rejections"
          value={visible.length}
        />
        <KpiCard
          icon={PackageX}
          label="Awaiting replacement / refund"
          tone="warning"
          value={kpis.open}
        />
        <KpiCard
          icon={RefreshCcw}
          label="Replacement value received"
          tone="success"
          value={formatCurrency(kpis.receivedValue, { maximumFractionDigits: 0 })}
        />
        <KpiCard
          icon={Banknote}
          label="Refunds completed"
          tone="success"
          value={formatCurrency(kpis.refundedValue, { maximumFractionDigits: 0 })}
        />
      </KpiGrid>
      <DataTable
        ariaLabel="Vendor returns and replacements"
        columns={vendorReturnsColumns}
        data={visible}
        filters={
          <>
            <ProjectFilterSelect
              isLocked={isLocked}
              onChange={setProjectId}
              scopeProjectIds={scopeProjectIds}
              value={projectId}
            />
            <Select
              onValueChange={(value) => setStatus(value === "all" ? null : value)}
              value={status ?? "all"}
            >
              <SelectTrigger aria-label="Filter by status" size="sm">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {VENDOR_RETURN_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
        isLoading={isLoading}
        onResetFilters={() => {
          setProjectId(defaultProjectId ?? null);
          setStatus(null);
        }}
        onRowClick={(row) => router.push(`/quality-control/${row.id}`)}
        search={{ placeholder: "Search QC #, material, vendor, project" }}
      />
    </Root>
  );
}

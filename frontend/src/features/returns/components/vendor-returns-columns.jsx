"use client";

import styled from "styled-components";

import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime, formatQuantity } from "@/lib/formatters";
import { ResolutionSummary } from "./returns-columns";

const columnHelper = createDataTableColumnHelper();
const Code = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;
  font-weight: 600;
`;
const Strong = styled.span`
  font-weight: 600;
`;
const Muted = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const Quantity = styled.span`
  font-variant-numeric: tabular-nums;
  font-weight: 650;
`;
const RejectedAt = styled.time`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
`;

/** Rejected goods-inward quantity going back to the vendor, and its settlement. */
export const vendorReturnsColumns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "QC #",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "QC #" },
  }),
  columnHelper.accessor("projectName", {
    header: "Project",
    meta: { label: "Project" },
  }),
  columnHelper.accessor("materialName", {
    header: "Material",
    cell: ({ getValue, row }) => (
      <div>
        <Strong>{getValue()}</Strong>
        <div>
          <Muted>{row.original.materialCode}</Muted>
        </div>
      </div>
    ),
    meta: { label: "Material" },
  }),
  columnHelper.accessor((row) => row.vendorName ?? "—", {
    id: "vendorName",
    header: "Vendor",
    cell: ({ getValue, row }) => (
      <div>
        <Strong>{getValue()}</Strong>
        <div>
          <Muted>{row.original.grnNumber}</Muted>
        </div>
      </div>
    ),
    meta: { label: "Vendor" },
  }),
  columnHelper.accessor("rejectedQuantity", {
    header: "Rejected qty",
    cell: ({ getValue, row }) => (
      <Quantity>{formatQuantity(getValue(), row.original.unit)}</Quantity>
    ),
    meta: { label: "Rejected quantity", align: "end" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { label: "Status" },
  }),
  columnHelper.display({
    id: "replacement",
    header: "Replacement / refund",
    cell: ({ row }) => (
      <ResolutionSummary
        needsResolution={false}
        resolution={row.original.resolution}
        unit={row.original.unit}
      />
    ),
    meta: { label: "Replacement / refund" },
  }),
  columnHelper.accessor("rejectedAt", {
    header: "Rejected on",
    cell: ({ getValue }) => (
      <RejectedAt dateTime={getValue()}>{formatDateTime(getValue())}</RejectedAt>
    ),
    meta: { label: "Rejected on" },
  }),
]);

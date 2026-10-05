"use client";

import { ArrowRight } from "lucide-react";
import styled from "styled-components";

import { StatusBadge } from "@/components/shared/status-badge";
import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { formatDateTime, formatQuantity } from "@/lib/formatters";

const columnHelper = createDataTableColumnHelper();
const Code = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;
  font-weight: 600;
`;
const RouteCell = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 600;
  svg {
    width: 0.75rem;
    height: 0.75rem;
    color: ${({ theme }) => theme.colors.mutedForeground};
    flex: 0 0 auto;
  }
`;
const Strong = styled.span`
  font-weight: 600;
`;
const Quantity = styled.span`
  font-variant-numeric: tabular-nums;
`;
const RequestedAt = styled.time`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
`;

/** Business-specific columns stay within the stock-transfers feature boundary. */
export const stockTransfersColumns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "Transfer #",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "Transfer #" },
  }),
  columnHelper.accessor(
    (row) => `${row.sourceProjectName} → ${row.destinationProjectName}`,
    {
      id: "route",
      header: "Source → Destination",
      cell: ({ row }) => (
        <RouteCell>
          {row.original.sourceProjectName}
          <ArrowRight aria-hidden="true" />
          {row.original.destinationProjectName}
        </RouteCell>
      ),
      meta: { label: "Source → Destination" },
    },
  ),
  columnHelper.accessor("materialName", {
    header: "Material",
    cell: ({ getValue }) => <Strong>{getValue()}</Strong>,
    meta: { label: "Material" },
  }),
  columnHelper.accessor("quantity", {
    header: "Quantity",
    cell: ({ getValue, row }) => (
      <Quantity>{formatQuantity(getValue(), row.original.unit)}</Quantity>
    ),
    meta: { label: "Quantity", align: "end" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { label: "Status" },
  }),
  columnHelper.accessor("requestedAt", {
    header: "Requested",
    cell: ({ getValue }) => (
      <RequestedAt dateTime={getValue()}>
        {formatDateTime(getValue())}
      </RequestedAt>
    ),
    meta: { label: "Requested date" },
  }),
]);

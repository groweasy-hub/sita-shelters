"use client";

import Link from "next/link";
import styled from "styled-components";

import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getMaintenanceTypeLabel } from "../constants/resources.constants";

const columnHelper = createDataTableColumnHelper();
const Code = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;
  font-weight: 600;
`;
const Strong = styled.span`
  font-weight: 600;
`;
const Description = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
`;
const Cost = styled.span`
  font-variant-numeric: tabular-nums;
`;

/** Enriched rows carry resourceName/resourceCategory alongside the raw record. */
export const resourceMaintenanceColumns = columnHelper.columns([
  columnHelper.accessor((row) => `${row.resourceName} ${row.resourceId}`, {
    id: "resourceName",
    header: "Resource",
    cell: ({ row }) => (
      <Link href={`/resources/${row.original.resourceId}`}>
        <Strong>{row.original.resourceName}</Strong>
        <div>
          <Code>{row.original.resourceId}</Code>
        </div>
      </Link>
    ),
    meta: { label: "Resource" },
  }),
  columnHelper.accessor("type", {
    header: "Type",
    cell: ({ getValue }) => getMaintenanceTypeLabel(getValue()),
    meta: { label: "Type" },
  }),
  columnHelper.accessor("date", {
    header: "Date",
    cell: ({ getValue }) => formatDate(getValue()),
    meta: { label: "Date" },
  }),
  columnHelper.accessor("description", {
    header: "Description",
    cell: ({ getValue }) => <Description>{getValue()}</Description>,
    meta: { label: "Description" },
  }),
  columnHelper.accessor("cost", {
    header: "Cost",
    cell: ({ getValue }) => <Cost>{formatCurrency(getValue())}</Cost>,
    meta: { label: "Cost", align: "end" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { label: "Status" },
  }),
]);

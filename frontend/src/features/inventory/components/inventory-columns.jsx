"use client";

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
const Strong = styled.span`
  font-weight: 600;
`;
const Quantity = styled.span`
  font-variant-numeric: tabular-nums;
`;
const MutedQuantity = styled(Quantity)`
  color: ${({ theme }) => theme.colors.mutedForeground};
`;
const UpdatedAt = styled.time`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
`;
/** Business-specific columns stay within the inventory feature boundary. */
export const inventoryColumns = columnHelper.columns([
  columnHelper.accessor("materialCode", {
    header: "Material code",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "Material code" },
  }),
  columnHelper.accessor("materialName", {
    header: "Material",
    cell: ({ getValue }) => <Strong>{getValue()}</Strong>,
    meta: { label: "Material" },
  }),
  columnHelper.accessor("category", {
    header: "Category",
    meta: { label: "Category" },
  }),
  columnHelper.accessor("projectName", {
    header: "Project",
    meta: { label: "Project" },
  }),
  columnHelper.accessor("availableQuantity", {
    header: "Available",
    cell: ({ getValue, row }) => (
      <Quantity>{formatQuantity(getValue(), row.original.unit)}</Quantity>
    ),
    meta: { label: "Available quantity", align: "end" },
  }),
  columnHelper.accessor("reservedQuantity", {
    header: "Reserved",
    cell: ({ getValue, row }) => (
      <MutedQuantity>
        {formatQuantity(getValue(), row.original.unit)}
      </MutedQuantity>
    ),
    meta: { label: "Reserved quantity", align: "end" },
  }),
  columnHelper.accessor("reorderLevel", {
    header: "Reorder level",
    cell: ({ getValue, row }) => (
      <MutedQuantity>
        {formatQuantity(getValue(), row.original.unit)}
      </MutedQuantity>
    ),
    meta: { label: "Reorder level", align: "end" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { label: "Status" },
  }),
  columnHelper.accessor("updatedAt", {
    header: "Last updated",
    cell: ({ getValue }) => (
      <UpdatedAt dateTime={getValue()}>{formatDateTime(getValue())}</UpdatedAt>
    ),
    meta: { label: "Last updated" },
  }),
]);

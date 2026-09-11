"use client";

import styled from "styled-components";

import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
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
const RemainingQuantity = styled(Quantity)`
  color: ${({ $depleted, theme }) =>
    $depleted ? theme.colors.mutedForeground : theme.colors.foreground};
  font-weight: 650;
`;
const RecipientCell = styled.div`
  display: grid;
  min-width: 11rem;
  gap: 0.125rem;
`;
const Purpose = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const IssuedAt = styled.time`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
`;

/** Business-specific columns stay within the material-issues feature boundary. */
export const materialIssuesColumns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "Issue #",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "Issue #" },
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
          <Purpose>{row.original.materialCode}</Purpose>
        </div>
      </div>
    ),
    meta: { label: "Material" },
  }),
  columnHelper.accessor("issuedQuantity", {
    header: "Issued qty",
    cell: ({ getValue, row }) => (
      <Quantity>{formatQuantity(getValue(), row.original.unit)}</Quantity>
    ),
    meta: { label: "Issued quantity", align: "end" },
  }),
  columnHelper.accessor("consumedQuantity", {
    header: "Consumed so far",
    cell: ({ getValue, row }) => (
      <MutedQuantity>
        {formatQuantity(getValue(), row.original.unit)}
      </MutedQuantity>
    ),
    meta: { label: "Consumed so far", align: "end" },
  }),
  columnHelper.accessor(
    (row) => row.issuedQuantity - row.consumedQuantity - row.returnedQuantity,
    {
      id: "remainingQuantity",
      header: "Remaining",
      cell: ({ getValue, row }) => {
        const remaining = getValue();
        return (
          <RemainingQuantity $depleted={remaining <= 0}>
            {formatQuantity(remaining, row.original.unit)}
          </RemainingQuantity>
        );
      },
      meta: { label: "Remaining", align: "end" },
    },
  ),
  columnHelper.accessor("recipientName", {
    header: "Recipient / purpose",
    cell: ({ getValue, row }) => (
      <RecipientCell>
        <Strong>{getValue()}</Strong>
        <Purpose>{row.original.purpose}</Purpose>
      </RecipientCell>
    ),
    meta: { label: "Recipient / purpose" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { label: "Status" },
  }),
  columnHelper.accessor("issuedAt", {
    header: "Issued date",
    cell: ({ getValue }) => (
      <IssuedAt dateTime={getValue()}>{formatDateTime(getValue())}</IssuedAt>
    ),
    meta: { label: "Issued date" },
  }),
]);

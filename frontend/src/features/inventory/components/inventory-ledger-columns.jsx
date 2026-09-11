"use client";

import styled from "styled-components";

import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
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
const Signed = styled.span`
  color: ${({ theme, $negative }) =>
    $negative ? theme.colors.danger : theme.colors.success};
  font-variant-numeric: tabular-nums;
  font-weight: 600;
`;
const movementTone = {
  "goods-inward": "success",
  issue: "secondary",
  consumption: "muted",
  return: "info",
  "transfer-in": "success",
  "transfer-out": "warning",
  damage: "destructive",
};

export const inventoryLedgerColumns = columnHelper.columns([
  columnHelper.accessor("date", {
    header: "Date",
    cell: ({ getValue }) => formatDateTime(getValue()),
    meta: { label: "Date" },
  }),
  columnHelper.accessor("referenceId", {
    header: "Reference",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "Reference" },
  }),
  columnHelper.accessor("materialName", {
    header: "Material",
    cell: ({ getValue, row }) => (
      <div>
        <Strong>{getValue()}</Strong>
        <div>
          <Code>{row.original.materialCode}</Code>
        </div>
      </div>
    ),
    meta: { label: "Material" },
  }),
  columnHelper.accessor("projectName", {
    header: "Project",
    meta: { label: "Project" },
  }),
  columnHelper.accessor("movementLabel", {
    header: "Movement",
    cell: ({ getValue, row }) => (
      <Badge variant={movementTone[row.original.movementType] ?? "muted"}>
        {getValue()}
      </Badge>
    ),
    meta: { label: "Movement" },
  }),
  columnHelper.accessor("quantity", {
    header: "Quantity",
    cell: ({ getValue, row }) => (
      <Signed $negative={getValue() < 0}>
        {getValue() > 0 ? "+" : ""}
        {formatQuantity(getValue(), row.original.unit)}
      </Signed>
    ),
    meta: { label: "Quantity", align: "end" },
  }),
  columnHelper.accessor("balanceAfter", {
    header: "Balance after",
    cell: ({ getValue, row }) => formatQuantity(getValue(), row.original.unit),
    meta: { label: "Balance after", align: "end" },
  }),
]);

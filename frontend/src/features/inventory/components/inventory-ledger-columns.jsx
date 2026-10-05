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
  replacement: "success",
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
  columnHelper.accessor("movementLabel", {
    header: "Type",
    cell: ({ getValue, row }) => (
      <Badge variant={movementTone[row.original.movementType] ?? "muted"}>
        {getValue()}
      </Badge>
    ),
    meta: { label: "Type" },
  }),
  columnHelper.accessor("materialName", {
    header: "Item",
    cell: ({ getValue, row }) => (
      <div>
        <Strong>{getValue()}</Strong>
        <div>
          <Code>{row.original.materialCode}</Code>
        </div>
      </div>
    ),
    meta: { label: "Item" },
  }),
  columnHelper.accessor("quantity", {
    header: "Qty",
    cell: ({ getValue, row }) => (
      <Signed $negative={getValue() < 0}>
        {getValue() > 0 ? "+" : ""}
        {formatQuantity(getValue(), row.original.unit)}
      </Signed>
    ),
    meta: { label: "Qty", align: "end" },
  }),
  columnHelper.accessor((row) => row.vendorName ?? "—", {
    id: "vendorName",
    header: "Vendor",
    meta: { label: "Vendor" },
  }),
  columnHelper.accessor("referenceId", {
    header: "Ref. No.",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "Ref. No." },
  }),
  columnHelper.accessor("remarks", {
    header: "Remarks",
    meta: { label: "Remarks" },
  }),
]);

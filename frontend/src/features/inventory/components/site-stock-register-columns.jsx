"use client";

import styled from "styled-components";

import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { formatQuantity } from "@/lib/formatters";

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
const Signed = styled(Quantity)`
  color: ${({ theme, $negative }) =>
    $negative ? theme.colors.danger : theme.colors.success};
  font-weight: 600;
`;
const CurrentStock = styled(Quantity)`
  font-weight: 650;
`;

export const siteStockRegisterColumns = columnHelper.columns([
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
  columnHelper.accessor("unit", {
    header: "Unit",
    meta: { label: "Unit" },
  }),
  columnHelper.accessor("opening", {
    header: "Opening",
    cell: ({ getValue, row }) => (
      <Quantity>{formatQuantity(getValue(), row.original.unit)}</Quantity>
    ),
    meta: { label: "Opening", align: "end" },
  }),
  columnHelper.accessor("inward", {
    header: "Inward",
    cell: ({ getValue, row }) => (
      <Signed>+{formatQuantity(getValue(), row.original.unit)}</Signed>
    ),
    meta: { label: "Inward", align: "end" },
  }),
  columnHelper.accessor("issued", {
    header: "Issued",
    cell: ({ getValue, row }) => (
      <Signed $negative>
        -{formatQuantity(getValue(), row.original.unit)}
      </Signed>
    ),
    meta: { label: "Issued", align: "end" },
  }),
  columnHelper.accessor("transfer", {
    header: "Transfer",
    cell: ({ getValue, row }) => (
      <Signed $negative={getValue() < 0}>
        {getValue() > 0 ? "+" : ""}
        {formatQuantity(getValue(), row.original.unit)}
      </Signed>
    ),
    meta: { label: "Transfer", align: "end" },
  }),
  columnHelper.accessor("currentStock", {
    header: "Current Stock",
    cell: ({ getValue, row }) => (
      <CurrentStock>
        {formatQuantity(getValue(), row.original.unit)}
      </CurrentStock>
    ),
    meta: { label: "Current Stock", align: "end" },
  }),
]);

"use client";

import styled from "styled-components";

import { StatusBadge } from "@/components/shared/status-badge";
import { createDataTableColumnHelper } from "@/components/shared/data-table";
import {
  getCategoryName,
  getSubcategoryName,
} from "@/lib/mock-data/material-categories";
import { formatCurrency, formatQuantity } from "@/lib/formatters";

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

export const materialsColumns = columnHelper.columns([
  columnHelper.accessor("code", {
    header: "Material code",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "Material code" },
  }),
  columnHelper.accessor("name", {
    header: "Material",
    cell: ({ getValue }) => <Strong>{getValue()}</Strong>,
    meta: { label: "Material" },
  }),
  columnHelper.accessor("category", {
    header: "Category",
    cell: ({ getValue, row }) => (
      <div>
        {getCategoryName(getValue())}
        <div>
          <Muted>{getSubcategoryName(getValue(), row.original.subcategory)}</Muted>
        </div>
      </div>
    ),
    meta: { label: "Category" },
  }),
  columnHelper.accessor("unit", {
    header: "Unit",
    meta: { label: "Unit" },
  }),
  columnHelper.accessor("itemType", {
    header: "Type",
    cell: ({ getValue }) => getValue() || "Stock",
    meta: { label: "Type" },
  }),
  columnHelper.accessor("packing", {
    header: "Packing",
    cell: ({ getValue }) => getValue() || "-",
    meta: { label: "Packing" },
  }),
  columnHelper.accessor("gstRate", {
    header: "GST",
    cell: ({ getValue }) => {
      const value = getValue();
      return value == null ? "-" : `${value}%`;
    },
    meta: { label: "GST", align: "end" },
  }),
  columnHelper.accessor("reorderLevel", {
    header: "Reorder level",
    cell: ({ getValue, row }) => formatQuantity(getValue(), row.original.unit),
    meta: { label: "Reorder level", align: "end" },
  }),
  columnHelper.accessor("lastPurchasePrice", {
    header: "Last purchase price",
    cell: ({ getValue }) => formatCurrency(getValue()),
    meta: { label: "Last purchase price", align: "end" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { label: "Status" },
  }),
]);

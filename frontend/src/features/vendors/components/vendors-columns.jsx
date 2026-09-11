"use client";

import styled from "styled-components";
import { Star } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { formatPercent } from "@/lib/formatters";
import { getCategoryName } from "@/lib/mock-data/material-categories";

const columnHelper = createDataTableColumnHelper();
const Code = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;
  font-weight: 600;
`;
const Strong = styled.span`
  font-weight: 600;
`;
const Rating = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  svg {
    width: 0.875rem;
    height: 0.875rem;
    color: ${({ theme }) => theme.colors.warning};
    fill: ${({ theme }) => theme.colors.warning};
  }
`;
const Categories = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;

export const vendorsColumns = columnHelper.columns([
  columnHelper.accessor("code", {
    header: "Vendor code",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "Vendor code" },
  }),
  columnHelper.accessor("name", {
    header: "Vendor",
    cell: ({ getValue }) => <Strong>{getValue()}</Strong>,
    meta: { label: "Vendor" },
  }),
  columnHelper.accessor("type", { header: "Type", meta: { label: "Type" } }),
  columnHelper.accessor("materialCategories", {
    header: "Supplies",
    cell: ({ getValue }) => (
      <Categories>
        {getValue().map((category) => getCategoryName(category)).join(", ")}
      </Categories>
    ),
    meta: { label: "Supplies" },
  }),
  columnHelper.accessor("rating", {
    header: "Rating",
    cell: ({ getValue }) => (
      <Rating>
        <Star aria-hidden="true" />
        {getValue().toFixed(1)}
      </Rating>
    ),
    meta: { label: "Rating", align: "end" },
  }),
  columnHelper.accessor("deliveryPerformance", {
    header: "Delivery performance",
    cell: ({ getValue }) => formatPercent(getValue()),
    meta: { label: "Delivery performance", align: "end" },
  }),
  columnHelper.accessor("rejectionRate", {
    header: "Rejection rate",
    cell: ({ getValue }) => formatPercent(getValue()),
    meta: { label: "Rejection rate", align: "end" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { label: "Status" },
  }),
]);

"use client";

import styled from "styled-components";

import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/formatters";
import { getVendorById } from "@/lib/mock-data/vendors";
import { calculateDeliveryProgress, calculatePurchaseOrderValue } from "../lib/purchase-order-metrics";

const columnHelper = createDataTableColumnHelper();
const Code = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;
  font-weight: 600;
`;
const Num = styled.span`
  font-variant-numeric: tabular-nums;
`;

export const purchaseOrderColumns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "PO #",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "PO #" },
  }),
  columnHelper.accessor("vendorId", {
    header: "Vendor",
    cell: ({ getValue }) => getVendorById(getValue())?.name ?? getValue(),
    meta: { label: "Vendor" },
  }),
  columnHelper.accessor("projectName", {
    header: "Project",
    meta: { label: "Project" },
  }),
  columnHelper.display({
    id: "orderValue",
    header: "Order value",
    cell: ({ row }) => (
      <Num>{formatCurrency(calculatePurchaseOrderValue(row.original), { maximumFractionDigits: 0 })}</Num>
    ),
    meta: { label: "Order value", align: "end" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { label: "Status" },
  }),
  columnHelper.display({
    id: "deliveryProgress",
    header: "Delivery progress",
    cell: ({ row }) => {
      const { delivered, total } = calculateDeliveryProgress(row.original);
      return total === 0 ? "Not scheduled" : `${delivered}/${total} delivered`;
    },
    meta: { label: "Delivery progress" },
  }),
]);

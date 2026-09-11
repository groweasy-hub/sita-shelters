"use client";

import styled from "styled-components";

import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/formatters";
import { getVendorById } from "@/lib/mock-data/vendors";

const columnHelper = createDataTableColumnHelper();
const Code = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;
  font-weight: 600;
`;

export const inwardColumns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "GRN #",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "GRN #" },
  }),
  columnHelper.accessor("purchaseOrderId", {
    header: "PO reference",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "PO reference" },
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
  columnHelper.accessor("receivedAt", {
    header: "Received",
    cell: ({ getValue }) => formatDate(getValue()),
    meta: { label: "Received" },
  }),
  columnHelper.accessor("lines", {
    header: "Lines",
    cell: ({ getValue }) => getValue().length,
    enableSorting: false,
    meta: { label: "Lines", align: "end" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { label: "Status" },
  }),
]);

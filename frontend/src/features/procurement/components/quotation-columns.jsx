"use client";

import styled from "styled-components";

import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/formatters";
import { getMaterialByCode } from "@/lib/mock-data/materials";
import { VendorName } from "@/features/vendors";

const columnHelper = createDataTableColumnHelper();
const Code = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;
  font-weight: 600;
`;
const Num = styled.span`
  font-variant-numeric: tabular-nums;
`;

export const quotationColumns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "Quotation #",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "Quotation #" },
  }),
  columnHelper.accessor("purchaseRequestId", {
    header: "Purchase request",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "Purchase request" },
  }),
  columnHelper.accessor("vendorId", {
    header: "Supplier",
    cell: ({ getValue }) => <VendorName vendorId={getValue()} />,
    meta: { label: "Supplier" },
  }),
  columnHelper.accessor("materialCode", {
    header: "Item",
    cell: ({ getValue }) => getMaterialByCode(getValue())?.name ?? getValue(),
    meta: { label: "Item" },
  }),
  columnHelper.display({
    id: "rate",
    header: "Rate",
    cell: ({ row }) => (
      <Num>
        {formatCurrency(row.original.unitPrice)}
        {row.original.taxIncluded ? " (incl. tax)" : ""}
      </Num>
    ),
    meta: { label: "Rate", align: "end" },
  }),
  columnHelper.accessor("moq", {
    header: "MOQ",
    cell: ({ getValue }) => <Num>{getValue() > 0 ? getValue() : "—"}</Num>,
    meta: { label: "MOQ", align: "end" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { label: "Status" },
  }),
]);

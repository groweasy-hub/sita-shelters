"use client";

import styled from "styled-components";

import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatQuantity } from "@/lib/formatters";
import { getUserName } from "@/lib/mock-data/users";

const columnHelper = createDataTableColumnHelper();
const Code = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;
  font-weight: 600;
`;
const Strong = styled.span`
  font-weight: 600;
`;
const Num = styled.span`
  font-variant-numeric: tabular-nums;
`;
const AcceptedNum = styled(Num)`
  color: ${({ theme }) => theme.colors.success};
`;
const RejectedNum = styled(Num)`
  color: ${({ theme, $active }) => ($active ? theme.colors.danger : "inherit")};
`;

export const qcColumns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "QC #",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "QC #" },
  }),
  columnHelper.accessor("inwardId", {
    header: "Linked GRN",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "Linked GRN" },
  }),
  columnHelper.accessor("projectName", {
    header: "Project",
    meta: { label: "Project" },
  }),
  columnHelper.accessor("materialName", {
    header: "Material",
    cell: ({ getValue }) => <Strong>{getValue()}</Strong>,
    meta: { label: "Material" },
  }),
  columnHelper.accessor("receivedQuantity", {
    header: "Received",
    cell: ({ getValue, row }) => (
      <Num>{formatQuantity(getValue(), row.original.unit)}</Num>
    ),
    meta: { label: "Received", align: "end" },
  }),
  columnHelper.accessor("acceptedQuantity", {
    header: "Accepted",
    cell: ({ getValue, row }) => (
      <AcceptedNum>{formatQuantity(getValue(), row.original.unit)}</AcceptedNum>
    ),
    meta: { label: "Accepted", align: "end" },
  }),
  columnHelper.accessor("rejectedQuantity", {
    header: "Rejected",
    cell: ({ getValue, row }) => (
      <RejectedNum $active={getValue() > 0}>
        {formatQuantity(getValue(), row.original.unit)}
      </RejectedNum>
    ),
    meta: { label: "Rejected", align: "end" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { label: "Status" },
  }),
  columnHelper.accessor("inspectorId", {
    header: "Inspector",
    cell: ({ getValue }) => getUserName(getValue()),
    meta: { label: "Inspector" },
  }),
]);

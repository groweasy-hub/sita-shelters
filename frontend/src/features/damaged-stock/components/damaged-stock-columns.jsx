"use client";

import Link from "next/link";
import styled from "styled-components";

import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatQuantity } from "@/lib/formatters";
import {
  DAMAGE_RECORD_TYPE_OPTIONS,
  DAMAGE_REASON_LABELS,
} from "../constants/damaged-stock.constants";

const columnHelper = createDataTableColumnHelper();
const Strong = styled.span`
  font-weight: 600;
`;
const Muted = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const SourceLink = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;
`;
const typeLabels = Object.fromEntries(
  DAMAGE_RECORD_TYPE_OPTIONS.map((option) => [option.value, option.label]),
);

function sourceHref(record) {
  if (record.sourceType === "qc-rejection") {
    return `/quality-control/${record.sourceId}`;
  }
  if (record.sourceType === "return-inspection") {
    return "/returns";
  }
  return null;
}

export const damagedStockColumns = columnHelper.columns([
  columnHelper.accessor("materialName", {
    header: "Material",
    cell: ({ getValue, row }) => (
      <div>
        <Strong>{getValue()}</Strong>
        <div>
          <Muted>{row.original.materialCode}</Muted>
        </div>
      </div>
    ),
    meta: { label: "Material" },
  }),
  columnHelper.accessor("projectName", {
    header: "Project",
    meta: { label: "Project" },
  }),
  columnHelper.accessor("type", {
    header: "Type",
    cell: ({ getValue }) => (
      <Badge variant={getValue() === "wastage" ? "warning" : "destructive"}>
        {typeLabels[getValue()]}
      </Badge>
    ),
    meta: { label: "Type" },
  }),
  columnHelper.accessor("reason", {
    header: "Reason",
    cell: ({ getValue }) => DAMAGE_REASON_LABELS[getValue()],
    meta: { label: "Reason" },
  }),
  columnHelper.accessor("quantity", {
    header: "Quantity",
    cell: ({ getValue, row }) => formatQuantity(getValue(), row.original.unit),
    meta: { label: "Quantity", align: "end" },
  }),
  columnHelper.accessor("financialValue", {
    header: "Financial value",
    cell: ({ getValue }) => formatCurrency(getValue()),
    meta: { label: "Financial value", align: "end" },
  }),
  columnHelper.accessor("department", {
    header: "Department",
    meta: { label: "Department" },
  }),
  columnHelper.accessor("date", {
    header: "Date",
    cell: ({ getValue }) => formatDate(getValue()),
    meta: { label: "Date" },
  }),
  columnHelper.display({
    id: "source",
    header: "Source",
    cell: ({ row }) => {
      const href = sourceHref(row.original);
      if (!href) {
        return <Muted>Logged directly</Muted>;
      }
      return <SourceLink href={href}>{row.original.sourceId}</SourceLink>;
    },
    meta: { label: "Source" },
  }),
]);

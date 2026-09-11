"use client";

import styled from "styled-components";

import { createDataTableColumnHelper } from "@/components/shared/data-table";
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
const Muted = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const Quantity = styled.span`
  font-variant-numeric: tabular-nums;
  font-weight: 650;
`;
const RecordedAt = styled.time`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
`;

/** Business-specific columns stay within the consumption feature boundary. */
export const consumptionColumns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "Consumption #",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "Consumption #" },
  }),
  columnHelper.accessor("projectName", {
    header: "Project",
    meta: { label: "Project" },
  }),
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
  columnHelper.accessor("quantityConsumed", {
    header: "Quantity",
    cell: ({ getValue, row }) => (
      <Quantity>{formatQuantity(getValue(), row.original.unit)}</Quantity>
    ),
    meta: { label: "Quantity", align: "end" },
  }),
  columnHelper.accessor("activity", {
    header: "Activity",
    cell: ({ getValue, row }) => (
      <div>
        <Strong>{getValue()}</Strong>
        <div>
          <Muted>{row.original.location}</Muted>
        </div>
      </div>
    ),
    meta: { label: "Activity" },
  }),
  columnHelper.accessor("consumedAt", {
    header: "Date",
    cell: ({ getValue }) => (
      <RecordedAt dateTime={getValue()}>
        {formatDateTime(getValue())}
      </RecordedAt>
    ),
    meta: { label: "Date" },
  }),
  columnHelper.accessor("recordedByName", {
    header: "Recorded by",
    meta: { label: "Recorded by" },
  }),
]);

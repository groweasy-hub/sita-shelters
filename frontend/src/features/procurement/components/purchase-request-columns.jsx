"use client";

import styled from "styled-components";

import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/formatters";

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

export const purchaseRequestColumns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "Request #",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "Request #" },
  }),
  columnHelper.accessor("sourceIndentId", {
    header: "Source indent",
    cell: ({ getValue }) => (getValue() ? <Code>{getValue()}</Code> : "—"),
    meta: { label: "Source indent" },
  }),
  columnHelper.accessor("projectName", {
    header: "Project",
    meta: { label: "Project" },
  }),
  columnHelper.accessor("materials", {
    header: "Materials",
    cell: ({ getValue }) => {
      const materials = getValue();
      const [first, ...rest] = materials;
      return (
        <div>
          <Strong>{first.materialName}</Strong>
          {rest.length ? <Muted> +{rest.length} more</Muted> : null}
        </div>
      );
    },
    enableSorting: false,
    meta: { label: "Materials" },
  }),
  columnHelper.accessor("requiredDeliveryDate", {
    header: "Required delivery",
    cell: ({ getValue }) => formatDate(getValue()),
    meta: { label: "Required delivery" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { label: "Status" },
  }),
]);

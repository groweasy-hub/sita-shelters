"use client";

import styled from "styled-components";

import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatters";
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
const Muted = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const priorityVariant = {
  low: "muted",
  medium: "info",
  high: "warning",
  urgent: "destructive",
};

export const indentColumns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "Indent #",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "Indent #" },
  }),
  columnHelper.accessor("projectName", {
    header: "Project",
    meta: { label: "Project" },
  }),
  columnHelper.accessor("requestedById", {
    header: "Requested by",
    cell: ({ getValue }) => getUserName(getValue()),
    meta: { label: "Requested by" },
  }),
  columnHelper.accessor("priority", {
    header: "Priority",
    cell: ({ getValue }) => (
      <Badge variant={priorityVariant[getValue()] ?? "muted"}>
        {getValue()}
      </Badge>
    ),
    meta: { label: "Priority" },
  }),
  columnHelper.accessor("lines", {
    header: "Materials",
    cell: ({ getValue }) => {
      const lines = getValue();
      const [first, ...rest] = lines;
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
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { label: "Status" },
  }),
  columnHelper.accessor("requiredDate", {
    header: "Required date",
    cell: ({ getValue }) => formatDate(getValue()),
    meta: { label: "Required date" },
  }),
]);

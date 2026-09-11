"use client";

import styled from "styled-components";

import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/formatters";
import { getProjectName } from "@/lib/mock-data/projects";
import { getResourceCategoryLabel } from "../constants/resources.constants";

const columnHelper = createDataTableColumnHelper();
const Code = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;
  font-weight: 600;
`;
const Strong = styled.span`
  font-weight: 600;
`;
const AtYard = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
`;
const DueDate = styled.time`
  font-variant-numeric: tabular-nums;
  color: ${({ theme, $overdue }) =>
    $overdue ? theme.colors.danger : theme.colors.foreground};
`;

/** Business-specific columns stay within the resources feature boundary. */
export const resourcesColumns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "Asset ID",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "Asset ID" },
  }),
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ getValue }) => <Strong>{getValue()}</Strong>,
    meta: { label: "Name" },
  }),
  columnHelper.accessor("category", {
    header: "Category",
    cell: ({ getValue }) => getResourceCategoryLabel(getValue()),
    meta: { label: "Category" },
  }),
  columnHelper.accessor("currentProjectId", {
    header: "Current project",
    cell: ({ getValue }) =>
      getValue() ? getProjectName(getValue()) : <AtYard>At yard</AtYard>,
    meta: { label: "Current project" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { label: "Status" },
  }),
  columnHelper.accessor("assignedSince", {
    header: "Assigned since",
    cell: ({ getValue }) =>
      getValue() ? (
        <time dateTime={getValue()}>{formatDate(getValue())}</time>
      ) : (
        <AtYard>—</AtYard>
      ),
    meta: { label: "Assigned since" },
  }),
  columnHelper.accessor("nextMaintenanceDueDate", {
    header: "Next maintenance due",
    cell: ({ getValue }) => (
      <DueDate
        $overdue={getValue() < new Date().toISOString().slice(0, 10)}
        dateTime={getValue()}
      >
        {formatDate(getValue())}
      </DueDate>
    ),
    meta: { label: "Next maintenance due" },
  }),
]);

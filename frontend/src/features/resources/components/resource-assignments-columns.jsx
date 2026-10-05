"use client";

import Link from "next/link";
import styled from "styled-components";

import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
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

/** Enriched rows carry resourceName/resourceCategory/projectName/assignedByName alongside the raw record. */
export const resourceAssignmentsColumns = columnHelper.columns([
  columnHelper.accessor((row) => `${row.resourceName} ${row.resourceId}`, {
    id: "resourceName",
    header: "Resource",
    cell: ({ row }) => (
      <Link href={`/resources/${row.original.resourceId}`}>
        <Strong>{row.original.resourceName}</Strong>
        <div>
          <Code>{row.original.resourceId}</Code>
        </div>
      </Link>
    ),
    meta: { label: "Resource" },
  }),
  columnHelper.accessor("projectName", {
    header: "Project",
    cell: ({ row }) => (
      <Link href={`/projects/${row.original.projectId}`}>
        {row.original.projectName}
      </Link>
    ),
    meta: { label: "Project" },
  }),
  columnHelper.accessor("assignedFrom", {
    header: "From",
    cell: ({ getValue }) => formatDate(getValue()),
    meta: { label: "From" },
  }),
  columnHelper.accessor("assignedTo", {
    header: "To",
    cell: ({ getValue }) =>
      getValue() ? (
        formatDate(getValue())
      ) : (
        <Badge variant="success">Active</Badge>
      ),
    meta: { label: "To" },
  }),
  columnHelper.accessor("assignedByName", {
    header: "Assigned by",
    meta: { label: "Assigned by" },
  }),
]);

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styled from "styled-components";

import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ROLE_LABELS } from "@/config/permissions";
import { formatDateTime } from "@/lib/formatters";
import { getEmployeeDetails } from "@/lib/mock-data/employee-directory";
import { AssignedProjects } from "./assigned-projects";

const columnHelper = createDataTableColumnHelper();
const NameCell = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
`;
const NameText = styled.span`
  display: grid;
  gap: 0.0625rem;
`;
const Strong = styled.span`
  font-weight: 600;
`;
const Muted = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const ViewLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.8125rem;
  font-weight: 650;
  text-decoration: none;
  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
  }
  svg {
    width: 0.8125rem;
    height: 0.8125rem;
  }
`;

export const accessUsersColumns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "User",
    cell: ({ row }) => (
      <NameCell>
        <UserAvatar name={row.original.name} />
        <NameText>
          <Strong>{row.original.name}</Strong>
          <Muted>{row.original.email}</Muted>
        </NameText>
      </NameCell>
    ),
    meta: { label: "User" },
  }),
  columnHelper.display({
    id: "employeeId",
    header: "Employee ID",
    cell: ({ row }) => getEmployeeDetails(row.original.id)?.employeeId ?? "—",
    meta: { label: "Employee ID" },
  }),
  columnHelper.display({
    id: "department",
    header: "Department",
    cell: ({ row }) => getEmployeeDetails(row.original.id)?.department ?? "—",
    meta: { label: "Department" },
  }),
  columnHelper.accessor("role", {
    header: "Primary Role",
    cell: ({ getValue }) => ROLE_LABELS[getValue()],
    meta: { label: "Primary Role" },
  }),
  columnHelper.accessor("projectIds", {
    header: "Assigned Projects",
    cell: ({ row }) => <AssignedProjects user={row.original} />,
    enableSorting: false,
    meta: { label: "Assigned Projects" },
  }),
  columnHelper.accessor("status", {
    header: "Account Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { label: "Account Status" },
  }),
  columnHelper.accessor("lastLoginAt", {
    header: "Last Login",
    cell: ({ getValue }) =>
      getValue() ? formatDateTime(getValue()) : <Muted>Never</Muted>,
    meta: { label: "Last Login" },
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <ViewLink data-row-click-ignore href={`/access/users/${row.original.id}`}>
        View
        <ArrowRight aria-hidden="true" />
      </ViewLink>
    ),
    enableHiding: false,
    enableSorting: false,
    meta: { label: "Actions", align: "end" },
  }),
]);

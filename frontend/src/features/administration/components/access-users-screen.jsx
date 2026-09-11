"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, UserCheck, UserPlus, Users } from "lucide-react";
import styled from "styled-components";

import { DataTable, KpiCard, KpiGrid, PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_ROLES, ROLE_LABELS } from "@/config/permissions";
import { ADMIN_ROLE_VALUES, ADMIN_USER_STATUS_OPTIONS } from "../constants/administration.constants";
import {
  useAdministrationUsers,
  useAllAdministrationUsers,
} from "../hooks/use-administration-users";
import { AccessNav } from "./access-nav";
import { accessUsersColumns } from "./access-users-columns";
import { UserDetailSheet } from "./user-detail-sheet";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;

export function AccessUsersScreen() {
  const [role, setRole] = useState(null);
  const [status, setStatus] = useState(null);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([{ id: "name", desc: false }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [selectedUser, setSelectedUser] = useState(null);
  const params = {
    role,
    status,
    search,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id ?? "name",
    sortDirection: sorting[0]?.desc ? "desc" : "asc",
  };
  const { data } = useAdministrationUsers(params);
  const { data: allUsers = [] } = useAllAdministrationUsers();
  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const kpis = useMemo(
    () => ({
      total: allUsers.length,
      active: allUsers.filter((user) => user.status === "active").length,
      invited: allUsers.filter((user) => user.status === "invited").length,
      admins: allUsers.filter((user) => ADMIN_ROLE_VALUES.includes(user.role)).length,
    }),
    [allUsers],
  );
  return (
    <Root>
      <PageHeader
        actions={<Button>Invite User</Button>}
        description="Every workspace account, its role, project scope and account status."
        eyebrow="Access & Permissions"
        title="Users"
      />
      <AccessNav />
      <KpiGrid>
        <KpiCard icon={Users} label="Total users" value={kpis.total} />
        <KpiCard icon={UserCheck} label="Active" value={kpis.active} />
        <KpiCard icon={UserPlus} label="Invited" value={kpis.invited} />
        <KpiCard icon={ShieldCheck} label="Admins" value={kpis.admins} />
      </KpiGrid>
      <DataTable
        ariaLabel="Users"
        columns={accessUsersColumns}
        data={items}
        filters={
          <>
            <Select
              onValueChange={(value) => setRole(value === "all" ? null : value)}
              value={role ?? "all"}
            >
              <SelectTrigger aria-label="Filter by role" size="sm">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {APP_ROLES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {ROLE_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) => setStatus(value === "all" ? null : value)}
              value={status ?? "all"}
            >
              <SelectTrigger aria-label="Filter by account status" size="sm">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {ADMIN_USER_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
        manualFiltering
        manualPagination
        manualSorting
        onPaginationChange={setPagination}
        onResetFilters={() => {
          setRole(null);
          setStatus(null);
          setSearch("");
        }}
        onRowClick={(row) => setSelectedUser(row)}
        onSearchChange={setSearch}
        onSortingChange={setSorting}
        pageCount={Math.max(1, Math.ceil(total / pagination.pageSize))}
        rowCount={total}
        search={{ placeholder: "Search name or email" }}
        state={{ pagination, sorting }}
      />
      <UserDetailSheet
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
        }}
        open={Boolean(selectedUser)}
        user={selectedUser}
      />
    </Root>
  );
}

"use client";

import Link from "next/link";
import { ArrowLeft, Check, Copy, Globe2, KeyRound, Pencil } from "lucide-react";
import styled from "styled-components";

import { EmptyState } from "@/components/feedback/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline, TimelineItem } from "@/components/shared/timeline";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  PERMISSION_MODULES,
  ROLE_ACCESS_SCOPE,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  getPermissionActionLabel,
  isAppRole,
} from "@/config/permissions";
import { formatDateTime } from "@/lib/formatters";
import { getProjectName } from "@/lib/mock-data/projects";
import { getRoleChangeHistory } from "@/lib/mock-data/role-change-history";
import { getUserName, USERS } from "@/lib/mock-data/users";

const Root = styled.div`
  display: grid;
  max-width: 60rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  width: fit-content;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
  }
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`;
const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const Title = styled.h1`
  margin: 0;
  font-size: 1.375rem;
  font-weight: 650;
`;
const Description = styled.p`
  margin: 0.25rem 0 0;
  max-width: 40rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.84375rem;
`;
const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;
const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.card};
`;
const PanelHead = styled.header`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const PanelTitle = styled.h3`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 650;
`;
const PanelBody = styled.div`
  padding: 1.5rem;
`;
const StatGrid = styled.div`
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(4, 1fr);
`;
const StatLabel = styled.p`
  margin: 0 0 0.375rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.6875rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;
const StatValue = styled.p`
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 650;
`;
const ModuleGroup = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.875rem 1.5rem;
  &:first-child {
    border-top: 0;
    padding-top: 0;
  }
`;
const ModuleTitle = styled.p`
  margin: 0 0 0.625rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;
const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;
const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3125rem 0.6875rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  font-size: 0.78125rem;
  font-weight: 600;
  svg {
    width: 0.75rem;
    height: 0.75rem;
    color: ${({ theme }) => theme.colors.success};
  }
`;
const UserRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  &:first-child {
    border-top: 0;
  }
`;
const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.84375rem;
`;
const ScopeBody = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1.25rem 1.5rem;
`;

export function RoleDetailScreen({ role }) {
  if (!isAppRole(role)) {
    return (
      <EmptyState description="This role no longer exists." title="Role not found" />
    );
  }
  const permissions = ROLE_PERMISSIONS[role];
  const usersWithRole = USERS.filter((user) => user.role === role);
  const isGlobal = ROLE_ACCESS_SCOPE[role] === "global";
  const scopedProjectIds = [
    ...new Set(usersWithRole.flatMap((user) => user.projectIds)),
  ];
  const history = getRoleChangeHistory(role);
  const groups = PERMISSION_MODULES.map((group) => ({
    ...group,
    granted: group.permissions.filter((permission) => permissions.includes(permission)),
  })).filter((group) => group.granted.length > 0);

  return (
    <Root>
      <BackLink href="/access/roles">
        <ArrowLeft aria-hidden="true" />
        Back to Roles
      </BackLink>

      <Header>
        <div>
          <Title>{ROLE_LABELS[role]}</Title>
          <Description>{ROLE_DESCRIPTIONS[role]}</Description>
        </div>
        <Actions>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button disabled variant="outline">
                  <Copy aria-hidden="true" />
                  Duplicate Role
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Requires backend</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button disabled variant="outline">
                  <Pencil aria-hidden="true" />
                  Edit Role
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Requires backend</TooltipContent>
          </Tooltip>
        </Actions>
      </Header>

      <Panel>
        <PanelHead>
          <PanelTitle>Role Information</PanelTitle>
        </PanelHead>
        <PanelBody>
          <StatGrid>
            <div>
              <StatLabel>Users assigned</StatLabel>
              <StatValue>{usersWithRole.length}</StatValue>
            </div>
            <div>
              <StatLabel>Permissions</StatLabel>
              <StatValue>{permissions.length}</StatValue>
            </div>
            <div>
              <StatLabel>Access scope</StatLabel>
              <StatValue style={{ fontSize: "0.875rem" }}>
                {isGlobal ? "Global" : "Project-specific"}
              </StatValue>
            </div>
            <div>
              <StatLabel>Role type</StatLabel>
              <Badge variant="muted">
                {role === "super-admin" ? "System role" : "Custom role"}
              </Badge>
            </div>
          </StatGrid>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead>
          <PanelTitle>Permission Categories</PanelTitle>
        </PanelHead>
        {groups.map((group) => (
          <ModuleGroup key={group.id}>
            <ModuleTitle>
              {group.label} · {group.granted.length} permission
              {group.granted.length === 1 ? "" : "s"}
            </ModuleTitle>
            <ChipRow>
              {group.granted.map((permission) => (
                <Chip key={permission}>
                  <Check aria-hidden="true" />
                  {getPermissionActionLabel(permission)}
                </Chip>
              ))}
            </ChipRow>
          </ModuleGroup>
        ))}
      </Panel>

      <Panel>
        <PanelHead>
          <PanelTitle>Assigned Users</PanelTitle>
        </PanelHead>
        {usersWithRole.length === 0 ? (
          <PanelBody>No users currently hold this role.</PanelBody>
        ) : (
          usersWithRole.map((user) => (
            <UserRow key={user.id}>
              <UserInfo>
                <UserAvatar name={user.name} size="1.5rem" />
                {user.name}
              </UserInfo>
              <span style={{ fontSize: "0.8125rem", flex: 1, textAlign: "left" }}>
                {isGlobal
                  ? "All projects"
                  : (user.projectIds.map((id) => getProjectName(id)).join(", ") || "—")}
              </span>
              <StatusBadge status={user.status} />
            </UserRow>
          ))
        )}
      </Panel>

      <Panel>
        <PanelHead>
          <PanelTitle>Project Scope</PanelTitle>
        </PanelHead>
        <ScopeBody>
          {isGlobal ? (
            <Badge variant="outline">
              <Globe2 aria-hidden="true" />
              All projects
            </Badge>
          ) : scopedProjectIds.length === 0 ? (
            <span style={{ color: "inherit", fontSize: "0.8125rem" }}>
              No projects yet.
            </span>
          ) : (
            scopedProjectIds.map((projectId) => (
              <Badge key={projectId} variant="outline">
                {getProjectName(projectId)}
              </Badge>
            ))
          )}
        </ScopeBody>
      </Panel>

      <Panel>
        <PanelHead>
          <PanelTitle>Change History</PanelTitle>
        </PanelHead>
        <Timeline>
          {history.map((entry) => (
            <TimelineItem
              icon={KeyRound}
              key={entry.id}
              meta={`By ${getUserName(entry.actorId)} · ${formatDateTime(entry.at)}`}
              title={entry.action}
            />
          ))}
        </Timeline>
      </Panel>
    </Root>
  );
}

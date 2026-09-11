"use client";

import { useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import styled from "styled-components";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACCESS_LEVEL_LABELS,
  ACCESS_LEVEL_STATUS_KEYS,
  ROLE_ACCESS_SCOPE,
  ROLE_LABELS,
} from "@/config/permissions";
import { PROJECT_OPTIONS } from "@/config/constants";
import { getEffectivePermissions } from "@/lib/access-resolution";
import { getProjectAssignments } from "@/lib/mock-data/project-assignments";
import { getProjectById } from "@/lib/mock-data/projects";
import { USERS, getUserName } from "@/lib/mock-data/users";
import { AccessNav } from "./access-nav";

const Root = styled.div`
  display: grid;
  max-width: 72rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const Banner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.card};
`;
const Stats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
`;
const StatLabel = styled.p`
  margin: 0 0 0.25rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.6875rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;
const StatValue = styled.p`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 650;
`;
const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.card};
  overflow: hidden;
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
const PanelDescription = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  &:first-child {
    border-top: 0;
  }
`;
const UserCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex: 1.2;
  min-width: 10rem;
  font-size: 0.84375rem;
  font-weight: 600;
`;
const RoleCell = styled.div`
  flex: 0.9;
  font-size: 0.8125rem;
`;
const AccessCell = styled.div`
  flex: 0.9;
`;
const PermissionsCell = styled.div`
  flex: 1.4;
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
`;
const PermChip = styled.span`
  padding: 0.1875rem 0.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  font-size: 0.71875rem;
  font-weight: 600;
`;

function usersForProject(project) {
  return USERS.filter(
    (user) =>
      ROLE_ACCESS_SCOPE[user.role] === "global" || user.projectIds.includes(project.id),
  );
}

export function ProjectAccessScreen() {
  const [projectId, setProjectId] = useState(PROJECT_OPTIONS[0].id);
  const project = getProjectById(projectId);
  const users = useMemo(() => usersForProject(project), [project]);
  const manager = getUserName(project.projectManagerId);

  return (
    <Root>
      <PageHeader
        description="A project-centric view of who has access, at what level. Answers 'Who has access to this project?'"
        eyebrow="Access & Permissions"
        title="Project Access"
      />
      <AccessNav />
      <Select onValueChange={setProjectId} value={projectId}>
        <SelectTrigger aria-label="Select project" style={{ width: "fit-content" }}>
          <Building2 aria-hidden="true" style={{ marginRight: "0.25rem" }} />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PROJECT_OPTIONS.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Banner>
        <Stats>
          <div>
            <StatLabel>Project Name</StatLabel>
            <StatValue>{project.name}</StatValue>
          </div>
          <div>
            <StatLabel>Project Code</StatLabel>
            <StatValue>{project.code}</StatValue>
          </div>
          <div>
            <StatLabel>Project Manager</StatLabel>
            <StatValue>{manager}</StatValue>
          </div>
          <div>
            <StatLabel>Total Users</StatLabel>
            <StatValue>{users.length}</StatValue>
          </div>
        </Stats>
        <StatusBadge status={project.status} />
      </Banner>

      <Panel>
        <PanelHead>
          <PanelTitle>Users with access</PanelTitle>
          <PanelDescription>
            {users.length} user{users.length === 1 ? "" : "s"} can see or act
            on {project.name}.
          </PanelDescription>
        </PanelHead>
        {users.map((user) => {
          const isGlobal = ROLE_ACCESS_SCOPE[user.role] === "global";
          const assignment = getProjectAssignments(user.id).find(
            (item) => item.projectId === project.id,
          );
          const accessLevel = isGlobal ? "management" : assignment?.accessLevel ?? "view";
          const permissions = getEffectivePermissions(user).slice(0, 3);
          return (
            <Row key={user.id}>
              <UserCell>
                <UserAvatar name={user.name} size="1.75rem" />
                {user.name}
              </UserCell>
              <RoleCell>{isGlobal ? ROLE_LABELS[user.role] : assignment?.roleOnProject ?? ROLE_LABELS[user.role]}</RoleCell>
              <AccessCell>
                <StatusBadge
                  label={isGlobal ? "Management Access" : ACCESS_LEVEL_LABELS[accessLevel]}
                  showIcon={false}
                  status={ACCESS_LEVEL_STATUS_KEYS[accessLevel]}
                />
              </AccessCell>
              <PermissionsCell>
                {isGlobal ? (
                  <Badge variant="outline">All modules</Badge>
                ) : (
                  permissions.map((permission) => (
                    <PermChip key={permission}>{permission.split(":")[0]}</PermChip>
                  ))
                )}
              </PermissionsCell>
            </Row>
          );
        })}
      </Panel>
    </Root>
  );
}

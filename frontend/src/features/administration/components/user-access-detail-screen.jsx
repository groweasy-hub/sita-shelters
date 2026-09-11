"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  KeyRound,
  Layers,
  Pencil,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import styled from "styled-components";

import { EmptyState } from "@/components/feedback/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline, TimelineItem } from "@/components/shared/timeline";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { getActivityLog } from "@/lib/mock-data/activity-log";
import {
  getPermissionOverrides,
  getSecondaryRoles,
} from "@/lib/mock-data/access-overrides";
import { getEmployeeDetails } from "@/lib/mock-data/employee-directory";
import { getProjectAssignments } from "@/lib/mock-data/project-assignments";
import { getUserName } from "@/lib/mock-data/users";
import { formatDateTime } from "@/lib/formatters";
import { useAdministrationUser } from "../hooks/use-administration-users";
import { ModulePermissionsPanel } from "./module-permissions-panel";
import { ProjectAccessTable } from "./project-access-table";
import { RoleAssignmentCard } from "./role-assignment-card";

const Root = styled.div`
  display: grid;
  max-width: 64rem;
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;
const Name = styled.h1`
  margin: 0;
  font-size: 1.375rem;
  font-weight: 650;
`;
const Sub = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
`;
const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 650;
  svg {
    width: 1rem;
    height: 1rem;
    color: ${({ theme }) => theme.colors.mutedForeground};
  }
`;
const PanelDescription = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
`;
const PanelBody = styled.div`
  padding: 1.5rem;
`;

export function UserAccessDetailScreen({ userId }) {
  const { data: user } = useAdministrationUser(userId);

  if (!user) {
    return (
      <EmptyState
        description="This account may have been removed or the link is incorrect."
        title="User not found"
      />
    );
  }

  const employee = getEmployeeDetails(user.id);
  const assignments = getProjectAssignments(user.id);
  const secondaryRoles = getSecondaryRoles(user.id);
  const overrides = getPermissionOverrides(user.id);
  const accessHistory = getActivityLog(user.id, "access");

  return (
    <Root>
      <BackLink href="/access/users">
        <ArrowLeft aria-hidden="true" />
        Back to Users
      </BackLink>

      <Header>
        <Identity>
          <UserAvatar name={user.name} size="3.25rem" style={{ fontSize: "1rem" }} />
          <div>
            <Name>{user.name}</Name>
            <Sub>
              {employee?.employeeId} · {employee?.department} ·{" "}
              {employee?.designation}
            </Sub>
          </div>
          <StatusBadge status={user.status} />
        </Identity>
        <Actions>
          <Button variant="outline">
            <Building2 aria-hidden="true" />
            Assign Projects
          </Button>
          <Button variant="outline">
            <Pencil aria-hidden="true" />
            Edit Access
          </Button>
          <Button variant="destructive">
            <ShieldAlert aria-hidden="true" />
            Deactivate User
          </Button>
        </Actions>
      </Header>

      <Panel>
        <PanelHead>
          <PanelTitle>
            <UserCheck aria-hidden="true" />
            Role Assignment
          </PanelTitle>
          <PanelDescription>
            One primary role, plus any additional access granted on top.
          </PanelDescription>
        </PanelHead>
        <PanelBody>
          <RoleAssignmentCard
            overrides={overrides}
            primaryRole={user.role}
            secondaryRoles={secondaryRoles}
          />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead>
          <PanelTitle>
            <Building2 aria-hidden="true" />
            Project Access
          </PanelTitle>
          <PanelDescription>
            Scope of visibility and control across projects.
          </PanelDescription>
        </PanelHead>
        <PanelBody>
          <ProjectAccessTable assignments={assignments} />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead>
          <PanelTitle>
            <Layers aria-hidden="true" />
            Module Permissions
          </PanelTitle>
          <PanelDescription>
            Grouped by module. Expand a category to see individual actions.
          </PanelDescription>
        </PanelHead>
        <ModulePermissionsPanel
          overrides={overrides}
          primaryRole={user.role}
          secondaryRoles={secondaryRoles}
        />
      </Panel>

      <Panel>
        <PanelHead>
          <PanelTitle>
            <CheckCircle2 aria-hidden="true" />
            Access History
          </PanelTitle>
        </PanelHead>
        {accessHistory.length === 0 ? (
          <PanelBody>
            <PanelDescription style={{ margin: 0 }}>
              No access changes recorded yet.
            </PanelDescription>
          </PanelBody>
        ) : (
          <Timeline>
            {accessHistory.map((entry) => (
              <TimelineItem
                icon={KeyRound}
                key={entry.id}
                meta={`By ${entry.actorId ? getUserName(entry.actorId) : "System"} · ${formatDateTime(entry.at)}`}
                title={entry.action}
              />
            ))}
          </Timeline>
        )}
      </Panel>
    </Root>
  );
}

"use client";

import { Building2, Pencil } from "lucide-react";
import styled from "styled-components";

import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/config/permissions";
import { getProjectName } from "@/lib/mock-data/projects";

const Card = styled.section`
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.card};
`;
const Identity = styled.div`
  flex: 1 1 15rem;
  min-width: 0;
`;
const NameRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.625rem;
`;
const Name = styled.h2`
  margin: 0;
  font-size: 1.1875rem;
  font-weight: 650;
`;
const Sub = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.84375rem;
`;
const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-top: 0.875rem;
`;
const MetaLabel = styled.p`
  margin: 0 0 0.25rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.6875rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;
const MetaValue = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
`;
const Projects = styled.div`
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 11rem;
`;
const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

export function ProfileHeader({ user }) {
  const assignedProjectNames = user.projectIds.map((projectId) =>
    getProjectName(projectId),
  );
  return (
    <Card>
      <UserAvatar name={user.name} size="4rem" style={{ fontSize: "1.25rem" }} />
      <Identity>
        <NameRow>
          <Name>{user.name}</Name>
          <StatusBadge status={user.status} />
        </NameRow>
        <Sub>
          {user.designation} · {user.employeeId}
        </Sub>
        <MetaRow>
          <div>
            <MetaLabel>Department</MetaLabel>
            <MetaValue>{user.department}</MetaValue>
          </div>
          <div>
            <MetaLabel>Primary Role</MetaLabel>
            <MetaValue>{ROLE_LABELS[user.role]}</MetaValue>
          </div>
          <div>
            <MetaLabel>Reporting Manager</MetaLabel>
            <MetaValue>{user.reportingManagerName ?? "—"}</MetaValue>
          </div>
        </MetaRow>
      </Identity>
      <Projects>
        <MetaLabel>Assigned Projects</MetaLabel>
        <ProjectList>
          {assignedProjectNames.length ? (
            assignedProjectNames.map((name) => (
              <Badge key={name} style={{ justifyContent: "flex-start" }} variant="outline">
                <Building2 aria-hidden="true" />
                {name}
              </Badge>
            ))
          ) : (
            <Badge style={{ justifyContent: "flex-start" }} variant="outline">
              <Building2 aria-hidden="true" />
              All projects
            </Badge>
          )}
        </ProjectList>
      </Projects>
      <Button style={{ flex: "0 0 auto" }} variant="outline">
        <Pencil aria-hidden="true" />
        Edit Profile
      </Button>
    </Card>
  );
}

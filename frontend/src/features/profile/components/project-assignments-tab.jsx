"use client";

import { Building2, Globe2, MapPin } from "lucide-react";
import styled from "styled-components";

import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  ACCESS_LEVEL_LABELS,
  ACCESS_LEVEL_STATUS_KEYS,
  ROLE_ACCESS_SCOPE,
} from "@/config/permissions";
import { getProjectById } from "@/lib/mock-data/projects";

const Root = styled.div`
  display: grid;
  gap: 1rem;
`;
const ScopeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;
const ScopeCopy = styled.div``;
const ScopeTitle = styled.h3`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 650;
`;
const ScopeDescription = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
`;
const Grid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr));
`;
const Card = styled.article`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.card};
  padding: 1.25rem;
`;
const CardHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.875rem;
`;
const CardTitleRow = styled.div`
  display: flex;
  gap: 0.75rem;
`;
const IconFrame = styled.span`
  display: flex;
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accentForeground};
  svg {
    width: 1.125rem;
    height: 1.125rem;
  }
`;
const CardTitle = styled.p`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 650;
`;
const CardMeta = styled.p`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0.125rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  svg {
    width: 0.75rem;
    height: 0.75rem;
  }
`;
const KvRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5625rem 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8125rem;
  &:first-of-type {
    border-top: 0;
    margin-top: 0.25rem;
  }
`;
const KvLabel = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
`;
const GlobalNotice = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.875rem;
  svg {
    width: 1.25rem;
    height: 1.25rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export function ProjectAssignmentsTab({ user, assignments }) {
  const isGlobal = ROLE_ACCESS_SCOPE[user.role] === "global";

  return (
    <Root>
      <ScopeRow>
        <ScopeCopy>
          <ScopeTitle>Project Assignments</ScopeTitle>
          <ScopeDescription>
            Every project you can access, and the scope of that access.
          </ScopeDescription>
        </ScopeCopy>
        <Badge variant={isGlobal ? "default" : "outline"}>
          Global Access: {isGlobal ? "Yes" : "No"}
        </Badge>
      </ScopeRow>

      {isGlobal ? (
        <GlobalNotice>
          <Globe2 aria-hidden="true" />
          Your role has workspace-wide access — every project is visible to
          you without an individual grant.
        </GlobalNotice>
      ) : assignments.length === 0 ? (
        <GlobalNotice>No project access assigned yet.</GlobalNotice>
      ) : (
        <Grid>
          {assignments.map((assignment) => {
            const project = getProjectById(assignment.projectId);
            if (!project) return null;
            return (
              <Card key={assignment.projectId}>
                <CardHead>
                  <CardTitleRow>
                    <IconFrame>
                      <Building2 aria-hidden="true" />
                    </IconFrame>
                    <div>
                      <CardTitle>{project.name}</CardTitle>
                      <CardMeta>
                        <MapPin aria-hidden="true" />
                        {project.location} · {project.code}
                      </CardMeta>
                    </div>
                  </CardTitleRow>
                </CardHead>
                <KvRow>
                  <KvLabel>Role on project</KvLabel>
                  <strong>{assignment.roleOnProject}</strong>
                </KvRow>
                <KvRow>
                  <KvLabel>Access</KvLabel>
                  <StatusBadge
                    label={ACCESS_LEVEL_LABELS[assignment.accessLevel]}
                    showIcon={false}
                    status={ACCESS_LEVEL_STATUS_KEYS[assignment.accessLevel]}
                  />
                </KvRow>
              </Card>
            );
          })}
        </Grid>
      )}
    </Root>
  );
}

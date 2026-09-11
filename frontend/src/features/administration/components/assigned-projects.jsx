"use client";

import styled from "styled-components";

import { EMPTY_VALUE, PROJECT_OPTIONS } from "@/config/constants";
import { ROLE_ACCESS_SCOPE } from "@/config/permissions";

const Muted = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
`;

/** Resolves a user's `projectIds` into readable project names for display. */
export function getAssignedProjectNames(user) {
  return user.projectIds
    .map((projectId) => PROJECT_OPTIONS.find((p) => p.id === projectId)?.name)
    .filter(Boolean);
}

export function isWorkspaceWideRole(role) {
  return ROLE_ACCESS_SCOPE[role] === "global";
}

export function AssignedProjects({ user }) {
  const names = getAssignedProjectNames(user);
  if (isWorkspaceWideRole(user.role) && user.projectIds.length === 0) {
    return <span>All projects</span>;
  }
  if (names.length === 0) {
    return <Muted>{EMPTY_VALUE}</Muted>;
  }
  return <span>{names.join(", ")}</span>;
}

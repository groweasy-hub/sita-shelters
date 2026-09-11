"use client";

import { Fragment, useMemo } from "react";
import { Check } from "lucide-react";
import styled from "styled-components";

import { PageHeader } from "@/components/shared/page-header";
import {
  APP_ROLES,
  PERMISSION_MODULES,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  getPermissionActionLabel,
} from "@/config/permissions";
import { AccessNav } from "./access-nav";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const MatrixPanel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
`;
const MatrixHeader = styled.header`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const MatrixTitle = styled.h2`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 650;
`;
const MatrixDescription = styled.p`
  margin: 0.375rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
`;
const MatrixScroll = styled.div`
  overflow-x: auto;
`;
const MatrixTable = styled.table`
  width: 100%;
  min-width: max-content;
  border-collapse: collapse;
  font-size: 0.8125rem;
`;
const GroupRow = styled.tr`
  background: ${({ theme }) => theme.colors.surfaceMuted};
`;
const GroupCell = styled.th`
  position: sticky;
  left: 0;
  padding: 0.5rem 1.25rem;
  background: ${({ theme }) => theme.colors.surfaceMuted};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-weight: 650;
  letter-spacing: 0.05em;
  text-align: left;
  text-transform: uppercase;
`;
const HeaderRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const CornerCell = styled.th`
  position: sticky;
  left: 0;
  z-index: 1;
  min-width: 16rem;
  padding: 0.625rem 1.25rem;
  background: ${({ theme }) => theme.colors.card};
  text-align: left;
`;
const RoleHeaderCell = styled.th`
  min-width: 8.5rem;
  padding: 0.625rem 0.75rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-weight: 650;
  text-align: center;
`;
const PermissionRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child {
    border-bottom: 0;
  }
`;
const PermissionCell = styled.td`
  position: sticky;
  left: 0;
  padding: 0.5rem 1.25rem;
  background: ${({ theme }) => theme.colors.card};
  font-size: 0.8125rem;
`;
const GrantCell = styled.td`
  padding: 0.5rem 0.75rem;
  text-align: center;
`;
const GrantIcon = styled(Check)`
  width: 1rem;
  height: 1rem;
  color: ${({ theme }) => theme.colors.success};
`;
const Dash = styled.span`
  color: ${({ theme }) => theme.colors.border};
`;

export function PermissionMatrixScreen() {
  const groups = useMemo(
    () => PERMISSION_MODULES.filter((group) => group.permissions.length > 0),
    [],
  );
  return (
    <Root>
      <PageHeader
        description="Every permission, grouped by module, checked against every role. Scroll horizontally to compare roles."
        eyebrow="Access & Permissions"
        title="Permission Matrix"
      />
      <AccessNav />
      <MatrixPanel>
        <MatrixHeader>
          <MatrixTitle>Full permission matrix</MatrixTitle>
          <MatrixDescription>
            A checkmark means the role is granted that action by default —
            an individual user&apos;s effective permissions can still be
            adjusted from their access detail page.
          </MatrixDescription>
        </MatrixHeader>
        <MatrixScroll>
          <MatrixTable aria-label="Role permission matrix">
            <thead>
              <HeaderRow>
                <CornerCell scope="col">Permission</CornerCell>
                {APP_ROLES.map((role) => (
                  <RoleHeaderCell key={role} scope="col">
                    {ROLE_LABELS[role]}
                  </RoleHeaderCell>
                ))}
              </HeaderRow>
            </thead>
            <tbody>
              {groups.map((group) => (
                <Fragment key={group.id}>
                  <GroupRow>
                    <GroupCell colSpan={APP_ROLES.length + 1} scope="colgroup">
                      {group.label}
                    </GroupCell>
                  </GroupRow>
                  {group.permissions.map((permission) => (
                    <PermissionRow key={permission}>
                      <PermissionCell>{getPermissionActionLabel(permission)}</PermissionCell>
                      {APP_ROLES.map((role) => {
                        const granted = ROLE_PERMISSIONS[role].includes(permission);
                        return (
                          <GrantCell key={role}>
                            {granted ? (
                              <GrantIcon aria-label="Granted" role="img" />
                            ) : (
                              <Dash aria-hidden="true">—</Dash>
                            )}
                          </GrantCell>
                        );
                      })}
                    </PermissionRow>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </MatrixTable>
        </MatrixScroll>
      </MatrixPanel>
    </Root>
  );
}

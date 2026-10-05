"use client";

import { Check, CornerDownRight, Shield } from "lucide-react";
import styled from "styled-components";

import { Badge } from "@/components/ui/badge";
import { PERMISSION_MODULES, ROLE_LABELS, ROLE_PERMISSIONS } from "@/config/permissions";

const Grid = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;
const Label = styled.p`
  margin: 0 0 0.75rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.6875rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;
const Flow = styled.div`
  display: flex;
  flex-direction: column;
`;
const PrimaryNode = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  width: fit-content;
  padding: 0.5rem 0.875rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryForeground};
  font-size: 0.84375rem;
  font-weight: 650;
  svg {
    width: 0.9375rem;
    height: 0.9375rem;
  }
`;
const InheritLabel = styled.p`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0.625rem 0 0.625rem 0.75rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  svg {
    width: 0.8125rem;
    height: 0.8125rem;
  }
`;
const LeafRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-left: 0.75rem;
`;
const Leaf = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  font-size: 0.8125rem;
  font-weight: 600;
  svg {
    width: 0.8125rem;
    height: 0.8125rem;
    color: ${({ theme }) => theme.colors.success};
  }
`;
const AdditionalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
const Empty = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
`;

export function RoleAssignmentCard({ overrides, primaryRole, secondaryRoles }) {
  const primaryPermissions = ROLE_PERMISSIONS[primaryRole] ?? [];
  const touchedModules = PERMISSION_MODULES.filter((group) =>
    group.permissions.some((permission) => primaryPermissions.includes(permission)),
  );

  return (
    <Grid>
      <div>
        <Label>Primary Role</Label>
        <Flow>
          <PrimaryNode>
            <Shield aria-hidden="true" />
            {ROLE_LABELS[primaryRole]}
          </PrimaryNode>
          <InheritLabel>
            <CornerDownRight aria-hidden="true" />
            Inherited Permissions
          </InheritLabel>
          <LeafRow>
            {touchedModules.map((group) => (
              <Leaf key={group.id}>
                <Check aria-hidden="true" />
                {group.label}
              </Leaf>
            ))}
          </LeafRow>
        </Flow>
      </div>
      <div>
        <Label>Additional Access</Label>
        {secondaryRoles.length === 0 && overrides.granted.length === 0 ? (
          <Empty>No additional roles or direct grants.</Empty>
        ) : (
          <AdditionalList>
            {secondaryRoles.map((role) => (
              <Badge key={role} style={{ justifyContent: "flex-start", padding: "0.5rem 0.75rem" }} variant="outline">
                <Check aria-hidden="true" />
                {ROLE_LABELS[role]}
              </Badge>
            ))}
            {overrides.granted.map((permission) => (
              <Badge
                key={permission}
                style={{ justifyContent: "flex-start", padding: "0.5rem 0.75rem" }}
                variant="outline"
              >
                <Check aria-hidden="true" />
                {permission}
              </Badge>
            ))}
          </AdditionalList>
        )}
      </div>
    </Grid>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import styled from "styled-components";

import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ROLE_LABELS, ROLE_PERMISSIONS } from "@/config/permissions";
import { formatDateTime } from "@/lib/formatters";
import { AssignedProjects } from "./assigned-projects";

const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1.25rem;
`;
const Email = styled.p`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0.125rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  svg {
    width: 0.8125rem;
    height: 0.8125rem;
  }
`;
const UserName = styled.p`
  margin: 0;
  font-size: 1rem;
  font-weight: 650;
`;
const Section = styled.section`
  padding: 0 1.25rem;
`;
const SectionTitle = styled.h3`
  margin: 0 0 0.625rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;
const DefinitionGrid = styled.dl`
  display: grid;
  gap: 0.75rem;
  margin: 0;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  dt {
    color: ${({ theme }) => theme.colors.mutedForeground};
    font-size: 0.75rem;
  }
  dd {
    margin: 0.125rem 0 0;
    font-size: 0.875rem;
    font-weight: 600;
  }
`;
const PermissionList = styled.ul`
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 16rem;
  overflow-y: auto;
`;
const PermissionRow = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  svg {
    width: 0.875rem;
    height: 0.875rem;
    flex: 0 0 auto;
    color: ${({ theme }) => theme.colors.success};
  }
`;
const Divider = styled.hr`
  margin: 0;
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;
const FooterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export function UserDetailSheet({ onOpenChange, open, user }) {
  if (!user) return null;
  const permissions = ROLE_PERMISSIONS[user.role] ?? [];
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="sr-only">{user.name}</SheetTitle>
          <SheetDescription className="sr-only">
            User account detail for {user.name}
          </SheetDescription>
        </SheetHeader>
        <Identity>
          <UserAvatar name={user.name} size="2.75rem" />
          <div>
            <UserName>{user.name}</UserName>
            <Email>
              <Mail aria-hidden="true" />
              {user.email}
            </Email>
          </div>
        </Identity>
        <Section>
          <DefinitionGrid>
            <div>
              <dt>Role</dt>
              <dd>{ROLE_LABELS[user.role]}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge status={user.status} />
              </dd>
            </div>
            <div>
              <dt>Assigned projects</dt>
              <dd>
                <AssignedProjects user={user} />
              </dd>
            </div>
            <div>
              <dt>Last login</dt>
              <dd>
                {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}
              </dd>
            </div>
          </DefinitionGrid>
        </Section>
        <Divider />
        <Section>
          <SectionTitle>
            Permissions granted ({permissions.length})
          </SectionTitle>
          <PermissionList>
            {permissions.map((permission) => (
              <PermissionRow key={permission}>
                <ShieldCheck aria-hidden="true" />
                {permission}
              </PermissionRow>
            ))}
          </PermissionList>
        </Section>
        <FooterRow>
          <Badge variant="outline">Quick preview</Badge>
          <Button asChild size="sm">
            <Link href={`/access/users/${user.id}`}>
              Open Access Details
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </FooterRow>
      </SheetContent>
    </Sheet>
  );
}

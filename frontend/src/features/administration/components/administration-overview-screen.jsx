"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  KeyRound,
  SlidersHorizontal,
  UserRoundCog,
  Users,
} from "lucide-react";
import styled from "styled-components";

import { KpiCard, KpiGrid, PageHeader } from "@/components/shared";
import { APP_ROLES, PERMISSIONS, PROJECT_OPTIONS } from "@/config";
import { USERS } from "@/lib/mock-data";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const Grid = styled.div`
  display: grid;
  gap: 1.25rem;
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;
const LinkCard = styled.button`
  display: grid;
  gap: 0.75rem;
  padding: 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.card};
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease;
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }
`;
const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;
const IconFrame = styled.span`
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accentForeground};
  svg {
    width: 1.125rem;
    height: 1.125rem;
  }
`;
const CardTitle = styled.h2`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 650;
`;
const CardDescription = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  line-height: 1.4;
`;
const CardLink = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.8125rem;
  font-weight: 650;
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`;

const links = [
  {
    href: "/access/users",
    icon: UserRoundCog,
    title: "Users",
    description:
      "View every workspace account, its role, assigned projects and account status.",
  },
  {
    href: "/access/roles",
    icon: KeyRound,
    title: "Roles & Permissions",
    description:
      "Manage roles, compare the permission matrix and see who has access to each project.",
  },
  {
    href: "/administration/settings",
    icon: SlidersHorizontal,
    title: "Settings",
    description:
      "Organization identity, defaults and illustrative workspace preferences.",
  },
];

export function AdministrationOverviewScreen() {
  const router = useRouter();
  const activeProjectCount = PROJECT_OPTIONS.filter(
    (project) => project.status === "active",
  ).length;
  return (
    <Root>
      <PageHeader
        description="User directory, role permissions and workspace settings for SITA Shelters."
        eyebrow="Workspace governance"
        title="Administration"
      />
      <KpiGrid>
        <KpiCard icon={Users} label="Total users" value={USERS.length} />
        <KpiCard icon={KeyRound} label="Roles" value={APP_ROLES.length} />
        <KpiCard
          icon={SlidersHorizontal}
          label="Permissions"
          value={PERMISSIONS.length}
        />
        <KpiCard
          icon={Building2}
          label="Active projects"
          value={activeProjectCount}
        />
      </KpiGrid>
      <Grid>
        {links.map((link) => (
          <LinkCard
            key={link.href}
            onClick={() => router.push(link.href)}
            type="button"
          >
            <CardTop>
              <IconFrame>
                <link.icon aria-hidden="true" />
              </IconFrame>
            </CardTop>
            <CardTitle>{link.title}</CardTitle>
            <CardDescription>{link.description}</CardDescription>
            <CardLink>
              Open
              <ArrowRight aria-hidden="true" />
            </CardLink>
          </LinkCard>
        ))}
      </Grid>
    </Root>
  );
}

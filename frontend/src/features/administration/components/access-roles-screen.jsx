"use client";

import { useMemo } from "react";
import {
  Award,
  Briefcase,
  Building2,
  Calculator,
  ClipboardCheck,
  Crown,
  DoorOpen,
  Eye,
  Gauge,
  HardHat,
  PenTool,
  PiggyBank,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  Warehouse,
  Wrench,
} from "lucide-react";
import styled from "styled-components";

import { PageHeader } from "@/components/shared/page-header";
import { APP_ROLES, ROLE_PERMISSIONS } from "@/config/permissions";
import { USERS } from "@/lib/mock-data/users";
import { AccessNav } from "./access-nav";
import { RoleCard } from "./role-card";

const roleIcons = {
  "super-admin": Crown,
  administrator: Settings,
  "project-head": Award,
  "project-manager": Briefcase,
  "site-executive": HardHat,
  "site-engineer": Wrench,
  supervisor: ClipboardCheck,
  "gate-man": DoorOpen,
  "store-manager": Warehouse,
  "project-accountant": Receipt,
  "quality-inspector": ShieldCheck,
  "procurement-manager": ShoppingCart,
  "finance-manager": Calculator,
  "hq-accountant": PiggyBank,
  "hq-design": PenTool,
  "hq-operations-head": Gauge,
  "hq-ceo": Star,
  "hq-md": Building2,
  viewer: Eye,
};
const systemRoles = new Set(["super-admin"]);

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const Grid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr));
`;

export function AccessRolesScreen() {
  const roleSummaries = useMemo(
    () =>
      APP_ROLES.map((role) => ({
        role,
        userCount: USERS.filter((user) => user.role === role).length,
        permissionCount: ROLE_PERMISSIONS[role].length,
      })),
    [],
  );
  return (
    <Root>
      <PageHeader
        description="Predefined roles that bundle permissions into a reusable, auditable set."
        eyebrow="Access & Permissions"
        title="Roles"
      />
      <AccessNav />
      <Grid>
        {roleSummaries.map((summary) => (
          <RoleCard
            icon={roleIcons[summary.role] ?? HardHat}
            isSystemRole={systemRoles.has(summary.role)}
            key={summary.role}
            permissionCount={summary.permissionCount}
            role={summary.role}
            userCount={summary.userCount}
          />
        ))}
      </Grid>
    </Root>
  );
}

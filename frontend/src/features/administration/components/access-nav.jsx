"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ShieldCheck, UserCheck, Building2 } from "lucide-react";
import styled from "styled-components";

const items = [
  { href: "/access/users", label: "Users", icon: UserCheck },
  { href: "/access/roles", label: "Roles", icon: ShieldCheck },
  { href: "/access/permissions", label: "Permission Matrix", icon: LayoutGrid },
  { href: "/access/project-access", label: "Project Access", icon: Building2 },
];

const Nav = styled.nav`
  display: inline-flex;
  width: fit-content;
  flex-wrap: wrap;
  gap: 0.125rem;
  padding: 0.1875rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.muted};
`;
const NavLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4375rem;
  height: 2.125rem;
  padding: 0 0.875rem;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.foreground : theme.colors.mutedForeground};
  background: ${({ $active, theme }) => ($active ? theme.colors.card : "transparent")};
  border-color: ${({ $active, theme }) => ($active ? theme.colors.border : "transparent")};
  box-shadow: ${({ $active, theme }) => ($active ? theme.shadows.subtle : "none")};
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`;

export function AccessNav() {
  const pathname = usePathname();
  return (
    <Nav aria-label="Access & Permissions sections">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <NavLink $active={active} href={item.href} key={item.href}>
            <item.icon aria-hidden="true" />
            {item.label}
          </NavLink>
        );
      })}
    </Nav>
  );
}

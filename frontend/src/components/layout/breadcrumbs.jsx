"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import styled from "styled-components";

const routeLabels = {
  dashboard: "Dashboard",
  projects: "Projects",
  materials: "Materials",
  categories: "Categories",
  inventory: "Inventory",
  "site-stock": "Site stock",
  "low-stock": "Low stock",
  damaged: "Damaged",
  ledger: "Ledger",
  indents: "Indents",
  create: "Create",
  procurement: "Procurement",
  requests: "Requests",
  quotations: "Quotations",
  "purchase-orders": "Purchase orders",
  inward: "Inward",
  "quality-control": "Quality control",
  "material-issues": "Material issues",
  consumption: "Consumption",
  returns: "Returns",
  "stock-transfers": "Stock transfers",
  vendors: "Vendors",
  resources: "Resources",
  reports: "Reports",
  administration: "Administration",
  users: "Users",
  roles: "Roles",
  settings: "Settings",
};
const Nav = styled.nav`
  display: none;
  min-width: 0;
  align-items: center;
  @media (min-width: 640px) {
    display: flex;
  }
`;
const CrumbGroup = styled.span`
  display: flex;
  min-width: 0;
  align-items: center;
`;
const CrumbLink = styled(Link)`
  max-width: 9rem;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
  }
`;
const HomeLink = styled(CrumbLink)`
  display: inline-flex;
  flex: 0 0 auto;
`;
const Separator = styled(ChevronRight)`
  margin-inline: 0.5rem;
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.mutedForeground};
  opacity: 0.6;
`;
const Current = styled.span`
  max-width: 12rem;
  overflow: hidden;
  font-size: 0.75rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const toTitle = (value) => routeLabels[value] ?? value.replaceAll("-", " ");

export function Breadcrumbs() {
  const segments = usePathname().split("/").filter(Boolean);
  return (
    <Nav aria-label="Breadcrumb">
      <HomeLink aria-label="Dashboard" href="/dashboard">
        <Home aria-hidden="true" size={14} />
      </HomeLink>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const current = index === segments.length - 1;
        return (
          <CrumbGroup key={href}>
            <Separator aria-hidden="true" size={13} />
            {current ? (
              <Current aria-current="page">
                {routeLabels[segment]
                  ? toTitle(segment)
                  : segment.toUpperCase()}
              </Current>
            ) : (
              <CrumbLink href={href}>{toTitle(segment)}</CrumbLink>
            )}
          </CrumbGroup>
        );
      })}
    </Nav>
  );
}

"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import styled from "styled-components";

import {
  getNavigationSections,
  isNavigationItemActive,
} from "@/config/navigation";
import { useCurrentUser } from "@/features/profile";
import { useUiStore } from "@/stores/ui-store";

const Sidebar = styled.aside`
  display: flex;
  width: ${({ $mobile, $collapsed }) =>
    $mobile ? "100%" : $collapsed ? "4.75rem" : "16.5rem"};
  height: 100%;
  min-height: 0;
  flex-direction: column;
  color: ${({ theme }) => theme.colors.sidebarForeground};
  background: ${({ theme }) => theme.colors.sidebar};
  ${({ $mobile, theme }) =>
    !$mobile
      ? `border-right: 1px solid ${theme.colors.sidebarBorder}; transition: width 200ms ease;`
      : ""}
`;
const Brand = styled.div`
  display: flex;
  height: 4.5rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: ${({ $collapsed }) =>
    $collapsed ? "center" : "flex-start"};
  padding: ${({ $collapsed }) => ($collapsed ? "0 0.75rem" : "0 1.25rem")};
  border-bottom: 1px solid ${({ theme }) => theme.colors.sidebarBorder};
`;
const Logo = styled.span`
  display: grid;
  width: ${({ $collapsed }) => ($collapsed ? "2.5rem" : "10.75rem")};
  height: ${({ $collapsed }) => ($collapsed ? "2.5rem" : "3rem")};
  flex: 0 0 auto;
  place-items: center;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;
const Nav = styled.nav`
  min-height: 0;
  flex: 1;
  padding: 1rem 0.75rem;
  overflow-y: auto;
`;
const Section = styled.div`
  margin-top: ${({ $first }) => ($first ? 0 : "1.25rem")};
  padding-top: ${({ $first }) => ($first ? 0 : "1rem")};
  border-top: ${({ $first, theme }) =>
    $first ? 0 : `1px solid ${theme.colors.sidebarBorder}`};
`;
const SectionTitle = styled.p`
  margin: 0 0 0.5rem;
  padding: 0 0.5rem;
  color: ${({ theme }) => theme.colors.sidebarMuted};
  font-size: 0.61rem;
  font-weight: 650;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;
const NavList = styled.div`
  display: grid;
  gap: 0.125rem;
`;
const NavLink = styled(Link)`
  position: relative;
  display: flex;
  min-height: 2.25rem;
  align-items: center;
  justify-content: ${({ $collapsed }) =>
    $collapsed ? "center" : "flex-start"};
  gap: ${({ $collapsed }) => ($collapsed ? 0 : "0.75rem")};
  padding: ${({ $collapsed }) => ($collapsed ? "0 0.5rem" : "0 0.625rem")};
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.sidebarForeground : theme.colors.sidebarMuted};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.sidebarAccent : "transparent"};
  font-size: 0.8rem;
  text-decoration: none;
  transition:
    color 150ms ease,
    background 150ms ease;
  &:hover {
    color: ${({ theme }) => theme.colors.sidebarForeground};
    background: ${({ theme }) => theme.colors.sidebarHover};
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.sidebarForeground};
    outline-offset: 1px;
  }
  svg {
    flex: 0 0 auto;
  }
`;
const ActiveMark = styled.span`
  position: absolute;
  inset: 0.5rem auto 0.5rem 0;
  width: 2px;
  background: ${({ theme }) => theme.colors.sidebarHighlight};
`;
const LinkText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const SubNav = styled.div`
  margin-left: 1.1rem;
  padding: 0.25rem 0 0.25rem 0.75rem;
  border-left: 1px solid ${({ theme }) => theme.colors.sidebarBorder};
`;
const SubLink = styled(Link)`
  display: block;
  padding: 0.375rem 0.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.sidebarForeground : theme.colors.sidebarMuted};
  font-size: 0.72rem;
  text-decoration: none;
  &:hover {
    color: ${({ theme }) => theme.colors.sidebarForeground};
  }
`;
const Footer = styled.div`
  flex: 0 0 auto;
  padding: 0.75rem;
  border-top: 1px solid ${({ theme }) => theme.colors.sidebarBorder};
`;
const CollapseButton = styled.button`
  display: flex;
  width: 100%;
  height: 2.25rem;
  align-items: center;
  justify-content: ${({ $collapsed }) =>
    $collapsed ? "center" : "flex-start"};
  gap: 0.75rem;
  padding: 0 0.625rem;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.sidebarMuted};
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.sidebarHover};
    color: ${({ theme }) => theme.colors.sidebarForeground};
  }
`;
const FooterNote = styled.p`
  margin: 0;
  padding: 0.25rem 0.5rem;
  color: ${({ theme }) => theme.colors.sidebarMuted};
  font-size: 0.65rem;
`;

function SidebarItem({ item, pathname, collapsed, onNavigate }) {
  const active = isNavigationItemActive(pathname, item);
  const Icon = item.icon;
  return (
    <div>
      <NavLink
        $active={active}
        $collapsed={collapsed}
        aria-current={active ? "page" : undefined}
        href={item.href}
        onClick={onNavigate}
        title={collapsed ? item.title : undefined}
      >
        {active ? <ActiveMark /> : null}
        <Icon aria-hidden="true" size={16} strokeWidth={1.75} />
        {!collapsed ? <LinkText>{item.title}</LinkText> : null}
      </NavLink>
      {!collapsed && active && item.items?.length ? (
        <SubNav>
          {item.items.map((child) => (
            <SubLink
              $active={isNavigationItemActive(pathname, child)}
              aria-current={
                isNavigationItemActive(pathname, child) ? "page" : undefined
              }
              href={child.href}
              key={child.href}
              onClick={onNavigate}
            >
              {child.title}
            </SubLink>
          ))}
        </SubNav>
      ) : null}
    </div>
  );
}

export function AppSidebar({ mobile = false, onNavigate }) {
  const pathname = usePathname();
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const collapsed = mobile ? false : sidebarCollapsed;
  const user = useCurrentUser();
  const navigationSections = useMemo(
    () => (user ? getNavigationSections({ roles: [user.role] }) : []),
    [user],
  );
  return (
    <Sidebar
      $collapsed={collapsed}
      $mobile={mobile}
      aria-label="Primary navigation"
    >
      <Brand $collapsed={collapsed}>
        <Logo $collapsed={collapsed}>
          <Image
            alt="Sita Shelters"
            height={collapsed ? 512 : 627}
            priority
            src={collapsed ? "/icons/favicon.png" : "/images/logo.png"}
            width={collapsed ? 512 : 2236}
          />
        </Logo>
      </Brand>
      <Nav>
        {navigationSections.map((section, index) => (
          <Section $first={index === 0} key={section.title}>
            {!collapsed ? <SectionTitle>{section.title}</SectionTitle> : null}
            <NavList>
              {section.items.map((item) => (
                <SidebarItem
                  collapsed={collapsed}
                  item={item}
                  key={item.href}
                  onNavigate={onNavigate}
                  pathname={pathname}
                />
              ))}
            </NavList>
          </Section>
        ))}
      </Nav>
      <Footer>
        {!mobile ? (
          <CollapseButton
            $collapsed={collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleSidebar}
            type="button"
          >
            {collapsed ? (
              <ChevronsRight aria-hidden="true" size={16} />
            ) : (
              <>
                <ChevronsLeft aria-hidden="true" size={16} />
                Collapse navigation
              </>
            )}
          </CollapseButton>
        ) : (
          <FooterNote>Sita Group · Enterprise workspace</FooterNote>
        )}
      </Footer>
    </Sidebar>
  );
}

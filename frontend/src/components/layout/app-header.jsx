"use client";

import { Bell, Menu, Search } from "lucide-react";
import styled from "styled-components";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNotificationUiStore } from "@/stores/notification-ui-store";
import { useUiStore } from "@/stores/ui-store";
import { Breadcrumbs } from "./breadcrumbs";
import { ProjectSwitcher } from "./project-switcher";
import { UserMenu } from "./user-menu";

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  height: 4.5rem;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background}f2;
  backdrop-filter: blur(12px);
  @media (min-width: 640px) {
    padding-inline: 1.5rem;
  }
  @media (min-width: 1024px) {
    padding-inline: 2rem;
  }
`;
const MobileMenuButton = styled(Button)`
  @media (min-width: 768px) {
    display: none;
  }
`;
const CrumbArea = styled.div`
  min-width: 0;
  flex: 1;
`;
const MobileBrand = styled.p`
  margin: 0;
  overflow: hidden;
  font-size: 0.75rem;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-overflow: ellipsis;
  white-space: nowrap;
  @media (min-width: 640px) {
    display: none;
  }
`;
const CommandButton = styled.button`
  display: none;
  height: 2rem;
  min-width: 11rem;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.625rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
    border-color: ${({ theme }) => theme.colors.input};
  }
  @media (min-width: 1024px) {
    display: flex;
  }
`;
const CommandText = styled.span`
  flex: 1;
  text-align: left;
`;
const Shortcut = styled.kbd`
  padding: 0.125rem 0.375rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xs};
  background: ${({ theme }) => theme.colors.muted};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.58rem;
`;
const CompactSearch = styled.span`
  display: inline-flex;
  @media (min-width: 1024px) {
    display: none;
  }
`;
const NotificationButton = styled(Button)`
  position: relative;
`;
const UnreadDot = styled.span`
  position: absolute;
  top: 0.375rem;
  right: 0.375rem;
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.warning};
  box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.background};
`;
const Divider = styled.div`
  width: 1px;
  height: 1.25rem;
  margin-left: 0.125rem;
  background: ${({ theme }) => theme.colors.border};
`;

export function AppHeader() {
  const toggleMobileNavigation = useUiStore(
    (state) => state.toggleMobileNavigation,
  );
  const toggleCommandPalette = useUiStore(
    (state) => state.toggleCommandPalette,
  );
  const toggleNotificationPanel = useNotificationUiStore(
    (state) => state.toggleNotificationPanel,
  );
  return (
    <Header>
      <MobileMenuButton
        aria-label="Open navigation"
        onClick={toggleMobileNavigation}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <Menu aria-hidden="true" size={18} />
      </MobileMenuButton>
      <CrumbArea>
        <Breadcrumbs />
        <MobileBrand>SITA SHELTERS</MobileBrand>
      </CrumbArea>
      <ProjectSwitcher />
      <CommandButton onClick={toggleCommandPalette} type="button">
        <Search aria-hidden="true" size={14} />
        <CommandText>Search workspace</CommandText>
        <Shortcut>⌘K</Shortcut>
      </CommandButton>
      <CompactSearch>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Search workspace"
              onClick={toggleCommandPalette}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <Search aria-hidden="true" size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search workspace</TooltipContent>
        </Tooltip>
      </CompactSearch>
      <Tooltip>
        <TooltipTrigger asChild>
          <NotificationButton
            aria-label="Open notifications, 2 unread"
            onClick={toggleNotificationPanel}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Bell aria-hidden="true" size={16} />
            <UnreadDot />
          </NotificationButton>
        </TooltipTrigger>
        <TooltipContent>Notifications</TooltipContent>
      </Tooltip>
      <Divider />
      <UserMenu />
    </Header>
  );
}

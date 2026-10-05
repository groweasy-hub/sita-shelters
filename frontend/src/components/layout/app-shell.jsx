"use client";

import styled from "styled-components";

import { useUiStore } from "@/stores/ui-store";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { CommandMenu } from "./command-menu";
import { MobileNavigation } from "./mobile-navigation";
import { NotificationPanel } from "./notification-panel";

const Shell = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;
const DesktopSidebar = styled.div`
  display: none;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 40;
  @media (min-width: 768px) {
    display: block;
  }
`;
const Workspace = styled.div`
  min-height: 100vh;
  transition: padding-left 200ms ease;
  @media (min-width: 768px) {
    padding-left: ${({ $collapsed }) => ($collapsed ? "4.75rem" : "16.5rem")};
  }
`;
const Main = styled.main`
  max-width: 100rem;
  margin: 0 auto;
  padding: 1rem;
  @media (min-width: 640px) {
    padding: 1.5rem;
  }
  @media (min-width: 1024px) {
    padding: 2rem;
  }
`;

export function AppShell({ children }) {
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  return (
    <Shell>
      <DesktopSidebar>
        <AppSidebar />
      </DesktopSidebar>
      <Workspace $collapsed={sidebarCollapsed}>
        <AppHeader />
        <Main id="main-content">{children}</Main>
      </Workspace>
      <MobileNavigation />
      <CommandMenu />
      <NotificationPanel />
    </Shell>
  );
}

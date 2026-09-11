"use client";

import { useMemo } from "react";
import { PackageX, TriangleAlert, X } from "lucide-react";
import styled from "styled-components";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAllInventoryItems } from "@/features/inventory";
import { useCurrentUser } from "@/features/profile";
import { formatRelativeTime } from "@/lib/formatters";
import { useNotificationUiStore } from "@/stores/notification-ui-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useClearedNotifications } from "./use-cleared-notifications";

/**
 * Notifications are derived live from inventory state rather than stored as
 * their own record type — this module has no dedicated notifications
 * backend, so alerts are computed from the same data other screens read.
 */
function useLiveNotifications() {
  const { data: inventoryItems = [] } = useAllInventoryItems();
  return useMemo(() => {
    const lowStock = inventoryItems
      .filter((item) => item.status === "low-stock")
      .sort(
        (first, second) =>
          first.availableQuantity / first.reorderLevel -
          second.availableQuantity / second.reorderLevel,
      )
      .slice(0, 4)
      .map((item) => ({
        id: `low-stock:${item.id}`,
        category: "low-stock",
        title: "Low-stock threshold reached",
        detail: `${item.materialName} · ${item.projectName}`,
        time: formatRelativeTime(item.updatedAt),
        unread: true,
        icon: TriangleAlert,
        tone: "warning",
      }));
    const damaged = inventoryItems
      .filter((item) => item.status === "damaged")
      .slice(0, 3)
      .map((item) => ({
        id: `damaged:${item.id}`,
        category: "damaged-stock",
        title: "Damaged stock reported",
        detail: `${item.materialName} · ${item.projectName}`,
        time: formatRelativeTime(item.updatedAt),
        unread: false,
        icon: PackageX,
        tone: "danger",
      }));
    return [...lowStock, ...damaged];
  }, [inventoryItems]);
}
const Content = styled(SheetContent)`
  width: min(100%, 26rem);
  max-width: 26rem;
  gap: 0;
  padding: 0;
`;
const Header = styled(SheetHeader)`
  padding: 1.5rem 3rem 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
`;
const Description = styled(SheetDescription)`
  margin-top: 0.25rem;
`;
const Filters = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  button {
    text-transform: capitalize;
  }
`;
const Feed = styled.div`
  min-height: 0;
  flex: 1;
  overflow-y: auto;
`;
const Notification = styled.article`
  position: relative;
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $unread, theme }) =>
    $unread ? `${theme.colors.accent}55` : "transparent"};
`;
const Dot = styled.span`
  position: absolute;
  top: 1.25rem;
  right: 1rem;
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.info};
`;
const IconFrame = styled.span`
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ $tone, theme }) => theme.colors[$tone]};
  background: ${({ $tone, theme }) => theme.colors[$tone]}18;
`;
const NotificationCopy = styled.div`
  min-width: 0;
  padding-right: 1rem;
  flex: 1;
`;
const DismissButton = styled.button`
  display: flex;
  width: 1.5rem;
  height: 1.5rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.mutedForeground};
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.muted};
    color: ${({ theme }) => theme.colors.foreground};
  }
  svg {
    width: 0.8125rem;
    height: 0.8125rem;
  }
`;
const NotificationTitle = styled.h3`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 650;
`;
const Detail = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const Time = styled.p`
  margin: 0.5rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.68rem;
`;
const Footer = styled.div`
  padding: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  button {
    width: 100%;
  }
`;

export function NotificationPanel() {
  const open = useNotificationUiStore((state) => state.notificationPanelOpen);
  const setOpen = useNotificationUiStore(
    (state) => state.setNotificationPanelOpen,
  );
  const activeFilter = useNotificationUiStore((state) => state.activeFilter);
  const setActiveFilter = useNotificationUiStore(
    (state) => state.setActiveFilter,
  );
  const user = useCurrentUser();
  const { clearedIds, clearAll, clearOne } = useClearedNotifications(user?.id);
  const notificationPreferences = usePreferencesStore((state) => state.notifications);
  const allNotifications = useLiveNotifications();
  const notifications = useMemo(
    () =>
      allNotifications.filter(
        (notification) =>
          !clearedIds.has(notification.id) &&
          notificationPreferences[notification.category]?.inApp !== false,
      ),
    [allNotifications, clearedIds, notificationPreferences],
  );
  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;
  const visibleNotifications = notifications.filter(
    (notification) => activeFilter === "all" || notification.unread,
  );
  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <Content>
        <Header>
          <HeaderRow>
            <div>
              <SheetTitle>Notifications</SheetTitle>
              <Description>
                Workflow activity across your portfolio.
              </Description>
            </div>
            {unreadCount > 0 ? (
              <Badge variant="warning">{unreadCount} new</Badge>
            ) : null}
          </HeaderRow>
        </Header>
        <Filters>
          {["all", "unread"].map((filter) => (
            <Button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              size="sm"
              type="button"
              variant={activeFilter === filter ? "secondary" : "ghost"}
            >
              {filter}
            </Button>
          ))}
        </Filters>
        <Feed>
          {visibleNotifications.length ? (
            visibleNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <Notification $unread={notification.unread} key={notification.id}>
                  {notification.unread ? <Dot /> : null}
                  <IconFrame $tone={notification.tone}>
                    <Icon aria-hidden="true" size={16} />
                  </IconFrame>
                  <NotificationCopy>
                    <NotificationTitle>{notification.title}</NotificationTitle>
                    <Detail>{notification.detail}</Detail>
                    <Time>{notification.time}</Time>
                  </NotificationCopy>
                  <DismissButton
                    aria-label="Clear this notification"
                    onClick={() => clearOne(notification.id)}
                    type="button"
                  >
                    <X aria-hidden="true" />
                  </DismissButton>
                </Notification>
              );
            })
          ) : (
            <EmptyState
              compact
              description="You're all caught up."
              title="No notifications"
            />
          )}
        </Feed>
        <Footer>
          <Button
            disabled={notifications.length === 0}
            onClick={() => clearAll(allNotifications.map((notification) => notification.id))}
            size="sm"
            variant="outline"
          >
            <X aria-hidden="true" size={15} />
            Clear all
          </Button>
        </Footer>
      </Content>
    </Sheet>
  );
}

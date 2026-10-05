"use client";

import styled from "styled-components";

import { usePreferencesStore } from "@/stores/preferences-store";
import { NOTIFICATION_CATEGORIES } from "../constants/preferences.constants";
import { NotificationPreferenceRow } from "./notification-preference-row";

const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.card};
  overflow: hidden;
`;
const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  font-weight: 650;
  &:first-child {
    border-top: 0;
  }
  svg {
    width: 0.9375rem;
    height: 0.9375rem;
  }
`;

export function NotificationsSection() {
  const notifications = usePreferencesStore((state) => state.notifications);
  const setNotificationChannel = usePreferencesStore(
    (state) => state.setNotificationChannel,
  );

  return (
    <Panel>
      {NOTIFICATION_CATEGORIES.map((category) => (
        <div key={category.id}>
          <CategoryHeader>
            <category.icon aria-hidden="true" />
            {category.label}
          </CategoryHeader>
          {category.rows.map((row) => (
            <NotificationPreferenceRow
              description={row.description}
              key={row.id}
              label={row.label}
              onChange={(channel, value) =>
                setNotificationChannel(row.id, channel, value)
              }
              value={notifications[row.id]}
            />
          ))}
        </div>
      ))}
    </Panel>
  );
}

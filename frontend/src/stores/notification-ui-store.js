"use client";
import { create } from "zustand";
/**
 * Stores presentation state only. Notification records and unread counts are
 * server state and belong in TanStack Query.
 */
export const useNotificationUiStore = create((set) => ({
  notificationPanelOpen: false,
  activeFilter: "all",
  setNotificationPanelOpen: (notificationPanelOpen) =>
    set({ notificationPanelOpen }),
  toggleNotificationPanel: () =>
    set((state) => ({
      notificationPanelOpen: !state.notificationPanelOpen,
    })),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  closeNotificationPanel: () => set({ notificationPanelOpen: false }),
}));

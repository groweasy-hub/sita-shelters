"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS } from "../config/constants";
function readPersistedSidebarState(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const sidebarCollapsed = Reflect.get(value, "sidebarCollapsed");
  return typeof sidebarCollapsed === "boolean" ? sidebarCollapsed : false;
}
export const useUiStore = create()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavigationOpen: false,
      commandPaletteOpen: false,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileNavigationOpen: (mobileNavigationOpen) =>
        set({ mobileNavigationOpen }),
      toggleMobileNavigation: () =>
        set((state) => ({
          mobileNavigationOpen: !state.mobileNavigationOpen,
        })),
      setCommandPaletteOpen: (commandPaletteOpen) =>
        set({ commandPaletteOpen }),
      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      closeTransientUi: () =>
        set({ mobileNavigationOpen: false, commandPaletteOpen: false }),
    }),
    {
      name: STORAGE_KEYS.ui,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ sidebarCollapsed }) => ({ sidebarCollapsed }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        sidebarCollapsed: readPersistedSidebarState(persistedState),
      }),
    },
  ),
);

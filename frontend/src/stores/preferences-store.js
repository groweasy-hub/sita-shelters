"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS } from "../config/constants";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_WIDGET_VISIBILITY,
} from "../features/preferences/constants/preferences.constants";

const defaultState = {
  appearance: {
    themeMode: "light",
    density: "comfortable",
  },
  notifications: DEFAULT_NOTIFICATION_PREFERENCES,
  dashboard: {
    defaultProjectId: null,
    defaultDateRange: "last-30-days",
    widgetVisibility: DEFAULT_WIDGET_VISIBILITY,
  },
  regional: {
    language: "en-IN",
    timeZone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "en-IN",
    currency: "INR",
  },
  accessibility: {
    fontSize: "default",
    reducedMotion: false,
    highContrast: false,
  },
};

export const usePreferencesStore = create()(
  persist(
    (set) => ({
      ...defaultState,
      setThemeMode: (themeMode) =>
        set((state) => ({ appearance: { ...state.appearance, themeMode } })),
      setDensity: (density) =>
        set((state) => ({ appearance: { ...state.appearance, density } })),
      setNotificationChannel: (rowId, channel, value) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [rowId]: { ...state.notifications[rowId], [channel]: value },
          },
        })),
      setDefaultProjectId: (defaultProjectId) =>
        set((state) => ({ dashboard: { ...state.dashboard, defaultProjectId } })),
      setDefaultDateRange: (defaultDateRange) =>
        set((state) => ({ dashboard: { ...state.dashboard, defaultDateRange } })),
      toggleWidgetVisibility: (widgetId) =>
        set((state) => ({
          dashboard: {
            ...state.dashboard,
            widgetVisibility: {
              ...state.dashboard.widgetVisibility,
              [widgetId]: !state.dashboard.widgetVisibility[widgetId],
            },
          },
        })),
      setRegionalField: (field, value) =>
        set((state) => ({ regional: { ...state.regional, [field]: value } })),
      setFontSize: (fontSize) =>
        set((state) => ({ accessibility: { ...state.accessibility, fontSize } })),
      setReducedMotion: (reducedMotion) =>
        set((state) => ({ accessibility: { ...state.accessibility, reducedMotion } })),
      setHighContrast: (highContrast) =>
        set((state) => ({ accessibility: { ...state.accessibility, highContrast } })),
    }),
    {
      name: STORAGE_KEYS.preferences,
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        if (version < 2 && persistedState?.appearance?.themeMode === "system") {
          return {
            ...persistedState,
            appearance: { ...persistedState.appearance, themeMode: "light" },
          };
        }
        return persistedState;
      },
    },
  ),
);

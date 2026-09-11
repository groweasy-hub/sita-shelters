"use client";
import { useEffect, useRef } from "react";
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

const createDefaultState = () => ({
  ...defaultState,
  appearance: { ...defaultState.appearance },
  notifications: Object.fromEntries(
    Object.entries(defaultState.notifications).map(([key, value]) => [
      key,
      { ...value },
    ]),
  ),
  dashboard: {
    ...defaultState.dashboard,
    widgetVisibility: { ...defaultState.dashboard.widgetVisibility },
  },
  regional: { ...defaultState.regional },
  accessibility: { ...defaultState.accessibility },
});

const getPreferencesStorageKey = (userId) =>
  userId ? `${STORAGE_KEYS.preferences}.${userId}` : STORAGE_KEYS.preferences;

const normalizeThemeMode = (themeMode) =>
  themeMode === "dark" || themeMode === "light" ? themeMode : "light";

const getSavedPreferencesState = (storageKey) => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return JSON.parse(window.localStorage.getItem(storageKey))?.state ?? null;
  } catch {
    return null;
  }
};

const normalizePreferencesState = (savedState) => ({
  ...createDefaultState(),
  ...savedState,
  appearance: {
    ...defaultState.appearance,
    ...savedState?.appearance,
    themeMode: normalizeThemeMode(savedState?.appearance?.themeMode),
  },
  notifications: {
    ...defaultState.notifications,
    ...savedState?.notifications,
  },
  dashboard: {
    ...defaultState.dashboard,
    ...savedState?.dashboard,
    widgetVisibility: {
      ...defaultState.dashboard.widgetVisibility,
      ...savedState?.dashboard?.widgetVisibility,
    },
  },
  regional: {
    ...defaultState.regional,
    ...savedState?.regional,
  },
  accessibility: {
    ...defaultState.accessibility,
    ...savedState?.accessibility,
  },
});

const createActions = (set) => ({
  setThemeMode: (themeMode) =>
    set((state) => ({
      appearance: { ...state.appearance, themeMode: normalizeThemeMode(themeMode) },
    })),
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
});

export const usePreferencesStore = create()(
  persist(
    (set) => ({
      ...createDefaultState(),
      ...createActions(set),
    }),
    {
      name: STORAGE_KEYS.preferences,
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        appearance: {
          ...currentState.appearance,
          ...persistedState?.appearance,
          themeMode: normalizeThemeMode(persistedState?.appearance?.themeMode),
        },
      }),
    },
  ),
);

export function useScopedPreferences(userId) {
  const storageKey = getPreferencesStorageKey(userId);
  const activeStorageKeyRef = useRef(null);

  useEffect(() => {
    if (activeStorageKeyRef.current === storageKey) {
      return;
    }

    activeStorageKeyRef.current = storageKey;
    usePreferencesStore.persist.setOptions({ name: storageKey });
    usePreferencesStore.setState(
      normalizePreferencesState(getSavedPreferencesState(storageKey)),
    );
  }, [storageKey]);
}

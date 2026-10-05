"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS } from "../config/constants";
function normalizeProjectId(projectId) {
  if (projectId === null) {
    return null;
  }
  const normalized = projectId.trim();
  return normalized.length > 0 ? normalized : null;
}
function readPersistedProjectId(value) {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const projectId = Reflect.get(value, "selectedProjectId");
  return typeof projectId === "string" ? normalizeProjectId(projectId) : null;
}
export const useProjectContextStore = create()(
  persist(
    (set) => ({
      selectedProjectId: null,
      hasHydrated: false,
      setSelectedProject: (projectId) =>
        set({ selectedProjectId: normalizeProjectId(projectId) }),
      selectAllProjects: () => set({ selectedProjectId: null }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: STORAGE_KEYS.projectContext,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ selectedProjectId }) => ({ selectedProjectId }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        selectedProjectId: readPersistedProjectId(persistedState),
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
export function selectProjectScope(state) {
  return state.selectedProjectId
    ? { kind: "project", projectId: state.selectedProjectId }
    : { kind: "all-projects", projectId: null };
}
export const selectIsAllProjects = (state) => state.selectedProjectId === null;

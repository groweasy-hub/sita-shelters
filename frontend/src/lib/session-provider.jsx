"use client";

import { createContext, useContext } from "react";

import { useScopedPreferences } from "@/stores/preferences-store";

/**
 * Carries the session's user id, resolved server-side once in
 * `(dashboard)/layout.jsx` via `getSessionUser()`, down to every client
 * component in the tree. Reading it from context (rather than re-parsing the
 * session cookie in the browser) means the signed-in user is known from the
 * very first server-rendered paint — no hydration flash of stale/default
 * content, and the value is available synchronously everywhere.
 */
const SessionContext = createContext(null);

export function SessionProvider({ children, userId }) {
  useScopedPreferences(userId);

  return (
    <SessionContext.Provider value={userId}>{children}</SessionContext.Provider>
  );
}

export function useSessionUserId() {
  return useContext(SessionContext);
}

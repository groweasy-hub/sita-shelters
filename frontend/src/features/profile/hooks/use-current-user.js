"use client";

import { useMemo } from "react";

import { useSessionUserId } from "@/lib/session-provider";
import { DEFAULT_USER_ID } from "../constants/profile.constants";
import {
  getCurrentUser,
  getCurrentUserActivity,
  getCurrentUserProjectAssignments,
  getCurrentUserSessions,
} from "../services/profile.service";

/**
 * Every dashboard route is wrapped in `SessionProvider` (see
 * `(dashboard)/layout.jsx`), which already resolved and validated the
 * session server-side — so this is only ever `null` outside that tree.
 */
function useResolvedUserId() {
  return useSessionUserId() ?? DEFAULT_USER_ID;
}

export function useCurrentUser() {
  const userId = useResolvedUserId();
  return useMemo(() => getCurrentUser(userId), [userId]);
}

export function useCurrentUserProjectAssignments() {
  const userId = useResolvedUserId();
  return useMemo(() => getCurrentUserProjectAssignments(userId), [userId]);
}

export function useCurrentUserActivity() {
  const userId = useResolvedUserId();
  return useMemo(() => getCurrentUserActivity(userId), [userId]);
}

export function useCurrentUserSessions() {
  return useMemo(() => getCurrentUserSessions(), []);
}

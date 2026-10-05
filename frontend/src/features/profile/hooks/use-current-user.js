"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authQueryKeys, useAuth } from "@/features/auth";
import {
  DEFAULT_USER_ID,
  PROFILE_LIVE_REFETCH_MS,
  profileQueryKeys,
} from "../constants/profile.constants";
import {
  enrichCurrentUser,
  getCurrentUserProjectAssignments,
  profileService,
} from "../services/profile.service";

/**
 * Every dashboard route sits under `(dashboard)/layout.jsx`, which gates on
 * `useAuth()` and only renders once it resolves to a real signed-in user —
 * so `authUser` here is only ever null outside that tree.
 */
export function useCurrentUser() {
  const { data: authUser } = useAuth();
  return useMemo(() => enrichCurrentUser(authUser), [authUser]);
}

function useResolvedUserId() {
  const { data: authUser } = useAuth();
  return authUser?.id ?? DEFAULT_USER_ID;
}

export function useCurrentUserProjectAssignments() {
  const userId = useResolvedUserId();
  return useMemo(() => getCurrentUserProjectAssignments(userId), [userId]);
}

/** Recent account events from the audit log; polls so new activity shows up without a reload. */
export function useCurrentUserActivity() {
  return useQuery({
    queryKey: profileQueryKeys.activity,
    queryFn: () => profileService.listActivity(),
    refetchInterval: PROFILE_LIVE_REFETCH_MS,
    refetchOnWindowFocus: true,
  });
}

/** Live sessions for this account — one per device signed in. */
export function useCurrentUserSessions() {
  return useQuery({
    queryKey: profileQueryKeys.sessions,
    queryFn: () => profileService.listSessions(),
    refetchInterval: PROFILE_LIVE_REFETCH_MS,
    refetchOnWindowFocus: true,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => profileService.updateProfile(input),
    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKeys.me, user);
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.activity });
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => profileService.changePassword(input),
    onSuccess: () => {
      // The user's `passwordChangedAt` moved and other devices were signed out.
      queryClient.invalidateQueries({ queryKey: authQueryKeys.me });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.sessions });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.activity });
    },
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId) => profileService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.sessions });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.activity });
    },
  });
}

export function useRevokeAllSessions() {
  return useMutation({
    mutationFn: () => profileService.revokeAllSessions(),
  });
}

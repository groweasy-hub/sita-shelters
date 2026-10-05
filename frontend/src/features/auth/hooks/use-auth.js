"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { authQueryKeys } from "../constants/auth.constants";
import { fetchCurrentSession } from "../services/auth.service";

/**
 * The single source of "who's signed in", backed by the HTTP-only session
 * cookie. Vercel resolves `/api/auth/me` through its same-origin proxy; the
 * dashboard remains client-gated so TanStack Query can own cache invalidation
 * after login and logout. Every consumer calls this hook directly, and its
 * cache dedupes requests without a context provider.
 */
export function useAuth() {
  return useQuery({
    queryKey: authQueryKeys.me,
    queryFn: fetchCurrentSession,
  });
}

export function useInvalidateAuth() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: authQueryKeys.me });
}

/**
 * Revalidates the session and populates the cache with the result. Used right
 * after login: the dashboard may have just cached a fresh `null` session
 * before it redirected the visitor to `/login`. Invalidate that result first;
 * otherwise the 60-second default stale time lets `fetchQuery` return the
 * cached signed-out value instead of reading the newly created cookie.
 */
export function useRefreshAuth() {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({
      queryKey: authQueryKeys.me,
      refetchType: "none",
    });
    return queryClient.fetchQuery({
      queryKey: authQueryKeys.me,
      queryFn: fetchCurrentSession,
    });
  };
}

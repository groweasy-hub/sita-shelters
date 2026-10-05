"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { RouteAccessGuard } from "@/components/layout/route-access-guard";
import { LoadingState } from "@/components/feedback";
import { useAuth } from "@/features/auth";
import { PreferencesEffects } from "@/features/preferences";

/**
 * Auth is resolved client-side through `useAuth()`, so TanStack Query owns
 * session cache invalidation after login and logout. The production Vercel
 * `/api` proxy keeps the HTTP-only cookie same-origin; this client gate still
 * deliberately trades a zero-flash SSR redirect for a single shared auth
 * state across the dashboard.
 */
export default function ApplicationLayout({ children }) {
  const router = useRouter();
  const { data: user, isPending } = useAuth();

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

  if (isPending || !user) {
    return <LoadingState label="Loading your workspace" variant="page" />;
  }

  return (
    <>
      <PreferencesEffects />
      <AppShell>
        <RouteAccessGuard>{children}</RouteAccessGuard>
      </AppShell>
    </>
  );
}

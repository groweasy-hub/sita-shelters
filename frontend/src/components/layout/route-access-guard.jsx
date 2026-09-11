"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { AccessDeniedState } from "@/components/shared/access-denied";
import { getRequiredAccessForPath } from "@/config/navigation";
import { ROLE_LABELS, meetsAccessRequirement } from "@/config/permissions";
import { useCurrentUser } from "@/features/profile";

/**
 * Single enforcement point for "hide or deny" access: every route the
 * sidebar knows about (see `getRequiredAccessForPath`) is checked against
 * the signed-in role here. Routes outside that tree (profile, preferences,
 * the dashboard root) are open to any signed-in role by default. This is
 * frontend-only — the eventual backend must independently enforce the same
 * rules.
 */
export function RouteAccessGuard({ children }) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const requirement = useMemo(() => getRequiredAccessForPath(pathname), [pathname]);

  if (!user) {
    return null;
  }
  if (requirement && !meetsAccessRequirement(user.role, requirement)) {
    return (
      <AccessDeniedState pageName={requirement.title} roleLabel={ROLE_LABELS[user.role]} />
    );
  }
  return children;
}

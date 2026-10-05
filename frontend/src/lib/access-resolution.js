import { ROLE_PERMISSIONS } from "@/config/permissions";
import {
  getPermissionOverrides,
  getSecondaryRoles,
} from "@/lib/mock-data/access-overrides";

/**
 * Resolves how a single permission applies to a user, combining their
 * primary role, any additional roles, and individual overrides into one of
 * four states the Access & Permissions UI renders:
 *
 * - "restricted": explicitly blocked for this user, regardless of role.
 * - "granted": granted directly to this user, independent of role.
 * - "inherited": comes from the user's primary or an additional role.
 * - "unavailable": not derivable from any role and not explicitly granted.
 */
export function resolvePermissionState(
  { primaryRole, secondaryRoles = [], overrides = { granted: [], restricted: [] } },
  permission,
) {
  if (overrides.restricted?.includes(permission)) {
    return { state: "restricted" };
  }
  if (overrides.granted?.includes(permission)) {
    return { state: "granted" };
  }
  if (ROLE_PERMISSIONS[primaryRole]?.includes(permission)) {
    return { state: "inherited", from: primaryRole };
  }
  const inheritedFrom = secondaryRoles.find((role) =>
    ROLE_PERMISSIONS[role]?.includes(permission),
  );
  if (inheritedFrom) {
    return { state: "inherited", from: inheritedFrom };
  }
  return { state: "unavailable" };
}

/** Convenience wrapper that loads a user's overrides/secondary roles by id. */
export function resolveUserPermissionState(user, permission) {
  return resolvePermissionState(
    {
      primaryRole: user.role,
      secondaryRoles: getSecondaryRoles(user.id),
      overrides: getPermissionOverrides(user.id),
    },
    permission,
  );
}

/** Every permission a user effectively holds, across role and overrides. */
export function getEffectivePermissions(user) {
  const secondaryRoles = getSecondaryRoles(user.id);
  const overrides = getPermissionOverrides(user.id);
  const rolePermissions = new Set([
    ...(ROLE_PERMISSIONS[user.role] ?? []),
    ...secondaryRoles.flatMap((role) => ROLE_PERMISSIONS[role] ?? []),
    ...overrides.granted,
  ]);
  overrides.restricted.forEach((permission) => rolePermissions.delete(permission));
  return [...rolePermissions];
}

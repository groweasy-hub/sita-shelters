/**
 * Access customizations layered on top of a user's primary role:
 * `SECONDARY_ROLES` are additional full roles a user also holds, and
 * `PERMISSION_OVERRIDES` are individual permissions explicitly granted or
 * restricted for that user, independent of any role. See
 * `src/lib/access-resolution.js` for how these combine into a single
 * per-permission state (inherited / granted / restricted / unavailable).
 */
export const SECONDARY_ROLES = {
  "usr-priyanka-das": ["viewer"],
};
export const PERMISSION_OVERRIDES = {
  "usr-priyanka-das": {
    granted: ["stock-transfers:approve"],
    restricted: ["inventory:manage"],
  },
  "usr-ritu-agarwal": {
    granted: [],
    restricted: [],
  },
};
export function getSecondaryRoles(userId) {
  return SECONDARY_ROLES[userId] ?? [];
}
export function getPermissionOverrides(userId) {
  return PERMISSION_OVERRIDES[userId] ?? { granted: [], restricted: [] };
}

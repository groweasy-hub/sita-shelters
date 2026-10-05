/**
 * Fallback account used only when no one has signed in yet (see
 * `src/lib/session.js`) — e.g. the instant before the client session cookie
 * is read. Once the dummy login sets a session, that user's id is used
 * everywhere instead.
 */
export const DEFAULT_USER_ID = "usr-arjun-rao";
/** Used when a signed-in user has no entry in `ADMIN_USER_ACCOUNT_DETAILS`. */
export const FALLBACK_ACCOUNT_STATUS = { status: "active", lastLoginAt: null };
export const profileQueryKeys = {
  sessions: ["profile", "sessions"],
  activity: ["profile", "activity"],
};
/** How often the security and activity tabs re-poll so they stay current without a reload. */
export const PROFILE_LIVE_REFETCH_MS = 15_000;
export const PROFILE_TABS = [
  { value: "personal", label: "Personal Information" },
  { value: "professional", label: "Professional Information" },
  { value: "projects", label: "Project Assignments" },
  { value: "security", label: "Account & Security" },
  { value: "activity", label: "Activity History" },
];

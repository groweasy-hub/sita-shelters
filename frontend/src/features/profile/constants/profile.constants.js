/**
 * Fallback account used only when no one has signed in yet (see
 * `src/lib/session.js`) — e.g. the instant before the client session cookie
 * is read. Once the dummy login sets a session, that user's id is used
 * everywhere instead.
 */
export const DEFAULT_USER_ID = "usr-arjun-rao";
/** Used when a signed-in user has no entry in `ADMIN_USER_ACCOUNT_DETAILS`. */
export const FALLBACK_ACCOUNT_STATUS = { status: "active", lastLoginAt: null };
export const ACTIVE_SESSIONS = [
  {
    id: "session-1",
    device: "MacBook Pro · Chrome",
    location: "Bengaluru, IN",
    lastActiveLabel: "Active now",
    current: true,
  },
  {
    id: "session-2",
    device: "iPhone 14 · Sita App",
    location: "Whitefield Site Office",
    lastActiveLabel: "3 hours ago",
    current: false,
  },
  {
    id: "session-3",
    device: "Windows PC · Edge",
    location: "SITA Enclave Site Office",
    lastActiveLabel: "2 days ago",
    current: false,
  },
];
export const PROFILE_TABS = [
  { value: "personal", label: "Personal Information" },
  { value: "professional", label: "Professional Information" },
  { value: "projects", label: "Project Assignments" },
  { value: "security", label: "Account & Security" },
  { value: "activity", label: "Activity History" },
];

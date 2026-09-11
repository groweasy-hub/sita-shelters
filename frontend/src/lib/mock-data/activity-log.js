/**
 * Account and access activity, keyed by user id. `category` is "account"
 * (login, password, profile edits — shown on the Profile Activity History
 * tab) or "access" (role/permission/project grants — shown on the Access
 * user detail page's Access History section). `actorId` is `null` when the
 * user performed the action themselves.
 */
export const ACTIVITY_LOG = {
  "usr-arjun-rao": [
    {
      id: "act-ar-1",
      category: "account",
      action: "Logged in",
      device: "MacBook Pro · Chrome",
      ipMasked: "203.192.**.** · Bengaluru, IN",
      status: "success",
      actorId: null,
      at: "2026-09-04T08:15:00+05:30",
    },
    {
      id: "act-ar-2",
      category: "account",
      action: "Profile updated",
      device: "MacBook Pro · Chrome",
      ipMasked: "203.192.**.** · Bengaluru, IN",
      status: "success",
      actorId: null,
      at: "2026-09-03T18:42:00+05:30",
    },
    {
      id: "act-ar-3",
      category: "access",
      action: "Assigned Store Manager role — Priyanka Das",
      device: "Administrator action",
      ipMasked: null,
      status: "applied",
      actorId: null,
      at: "2026-08-20T00:00:00+05:30",
    },
    {
      id: "act-ar-4",
      category: "account",
      action: "Password changed",
      device: "iPhone 14 · Sita App",
      ipMasked: "117.98.**.** · Whitefield, IN",
      status: "success",
      actorId: null,
      at: "2026-08-30T16:20:00+05:30",
    },
    {
      id: "act-ar-5",
      category: "account",
      action: "Failed login attempt",
      device: "Unknown device",
      ipMasked: "41.203.**.** · Lagos, NG",
      status: "blocked",
      actorId: null,
      at: "2026-08-21T14:47:00+05:30",
    },
  ],
  "usr-priyanka-das": [
    {
      id: "act-pd-1",
      category: "access",
      action: "Assigned Store Manager role",
      device: "Administrator action",
      ipMasked: null,
      status: "applied",
      actorId: "usr-kavita-nair",
      at: "2026-08-20T00:00:00+05:30",
    },
    {
      id: "act-pd-2",
      category: "access",
      action: "Granted access to SITA Heights (Operational)",
      device: "Administrator action",
      ipMasked: null,
      status: "applied",
      actorId: "usr-manoj-verma",
      at: "2026-08-02T00:00:00+05:30",
    },
    {
      id: "act-pd-3",
      category: "access",
      action: "Restricted Adjust Stock permission",
      device: "Administrator action",
      ipMasked: null,
      status: "applied",
      actorId: "usr-kavita-nair",
      at: "2026-07-14T00:00:00+05:30",
    },
    {
      id: "act-pd-4",
      category: "access",
      action: "Additional access granted — Viewer",
      device: "Administrator action",
      ipMasked: null,
      status: "applied",
      actorId: "usr-kavita-nair",
      at: "2026-06-01T00:00:00+05:30",
    },
    {
      id: "act-pd-5",
      category: "account",
      action: "Account activated",
      device: "System",
      ipMasked: null,
      status: "success",
      actorId: null,
      at: "2021-11-10T00:00:00+05:30",
    },
  ],
};
export function getActivityLog(userId, category) {
  const entries = ACTIVITY_LOG[userId] ?? [];
  return category
    ? entries.filter((entry) => entry.category === category)
    : entries;
}

/**
 * Access activity (role/permission/project grants), keyed by user id, shown
 * on the Access user detail page's Access History section. Account activity
 * (logins, password and profile changes) is no longer mocked — the Profile
 * Activity History tab reads it live from the backend's audit log.
 * `actorId` is `null` when the user performed the action themselves.
 */
export const ACTIVITY_LOG = {
  "usr-arjun-rao": [
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
  ],
};
export function getActivityLog(userId, category) {
  const entries = ACTIVITY_LOG[userId] ?? [];
  return category
    ? entries.filter((entry) => entry.category === category)
    : entries;
}

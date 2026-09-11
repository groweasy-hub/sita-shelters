/** Change history entries shown on a role's detail page, keyed by role slug. */
export const ROLE_CHANGE_HISTORY = {
  "store-manager": [
    {
      id: "rch-sm-1",
      action: 'Added "Approve Stock Transfer" permission',
      actorId: "usr-kavita-nair",
      at: "2026-07-04T00:00:00+05:30",
    },
    {
      id: "rch-sm-2",
      action: "Role created",
      actorId: "usr-arjun-rao",
      at: "2024-01-12T00:00:00+05:30",
    },
  ],
  "quality-inspector": [
    {
      id: "rch-qi-1",
      action: 'Added "Approve Quality Control" permission',
      actorId: "usr-kavita-nair",
      at: "2025-11-02T00:00:00+05:30",
    },
    {
      id: "rch-qi-2",
      action: "Role created",
      actorId: "usr-arjun-rao",
      at: "2024-01-12T00:00:00+05:30",
    },
  ],
};
export function getRoleChangeHistory(role) {
  return (
    ROLE_CHANGE_HISTORY[role] ?? [
      {
        id: `rch-${role}-created`,
        action: "Role created",
        actorId: "usr-arjun-rao",
        at: "2024-01-12T00:00:00+05:30",
      },
    ]
  );
}

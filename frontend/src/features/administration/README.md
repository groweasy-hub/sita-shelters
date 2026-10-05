# Administration feature

Owns user directory, role/permission visualization, and organization-settings
presentation for the Administration module. Everything here is a UI layer
over existing data:

- `src/lib/mock-data/users.js` (`USERS`) is the canonical user directory.
  This feature never edits that file; instead its service layer
  (`services/administration.service.js`) layers a couple of presentation-only
  account fields (`status`, `lastLoginAt`) onto each user via a local,
  fixed-literal lookup table (`ADMIN_USER_ACCOUNT_DETAILS`).
- `src/config/permissions.js` (`APP_ROLES`, `ROLE_LABELS`, `PERMISSIONS`,
  `ROLE_PERMISSIONS`) is the real, already-implemented permission model. The
  Roles screen visualizes that data; it does not invent a new one.
- `src/config` (`siteConfig`, `DEFAULT_CURRENCY`, `DEFAULT_LOCALE`,
  `PROJECT_OPTIONS`) backs the Settings and Overview screens.

## Structure

- `constants/` — list defaults, query keys, and the account-detail lookup.
- `schemas/` — Zod contracts for the augmented user record and list params.
- `services/` — an in-memory adapter (`mockAdministrationUsersAdapter`)
  behind a swappable service, following the same shape as every other
  feature's mock service.
- `hooks/` — TanStack Query hooks over the users service.
- `components/` — screens (`AdministrationOverviewScreen`, `UsersScreen`,
  `RolesScreen`, `SettingsScreen`) plus small reusable pieces
  (`UserAvatar`, `AssignedProjects`, `UserDetailSheet`,
  `SettingsToggleRow`) that are local to this feature.

## Permissions are presentation concerns only

Nothing in this feature enforces access. Role labels, the permission matrix,
and the "Edit" affordance in the user detail sheet are all read-only
illustrations. A future backend must independently authorize every protected
read and mutation; see `ARCHITECTURE.md` at the repo root.

Authentication is intentionally outside the present frontend foundation. Add
forms, services, schemas, and query hooks here only when identity integration
is defined.

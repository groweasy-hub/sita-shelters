# SITA Shelters Frontend Architecture

This document describes the implemented JavaScript frontend foundation for the
SITA Shelters Construction Resource & Inventory Management System.

**The backend is a separate service.** It does not live in this repository
tree — see `backend/` at the repo root, a standalone Node/Express + MongoDB
(Mongoose) API deployed to Railway. This app deploys to Vercel and has one
server-side `/api/[...path]` proxy route: every `api*Adapter` calls the
shared client in `src/lib/api-client.js`, which uses that same-origin proxy
in production. `BACKEND_API_URL` is server-only in Vercel; see §12 and §17
below and `backend/README.md` for the backend's own structure.

Auth/authorization and a growing set of master-data modules (Users,
Sessions, Projects, Materials, Material Categories, UOMs, Vendors,
Project Assignments) are live against the backend's MongoDB database. The
Vercel proxy keeps the HTTP-only session cookie first-party; the dashboard
still uses the client-side `useAuth()` query so a login/logout can reliably
invalidate one shared session cache.

Every transactional workflow module past master data — Indents, Procurement
(Requests, Quotations, Purchase Orders), GRN/Inward, QC, Site Stock,
Material Issues, Consumption, Returns and Stock Transfers — is live against
the backend's database. Damaged Stock is derived from inspected returns and
the persisted `backend/src/db/models/damaged-stock.model.js` records.

## 1. High-level architecture philosophy

The application is organized around feature ownership and thin routes:

- App Router files own URL structure, metadata, parameters, loading/error
  boundaries, and composition.
- Business components, query hooks, schemas, services, and constants live in
  their owning feature.
- Reusable UI is separated into primitives, shared application patterns,
  layout structure, and feedback states.
- styled-components owns component styling; semantic theme roles prevent raw
  palette values from spreading through the product.
- Zustand owns browser interaction state. TanStack Query owns remote records,
  caching, retries, and invalidation.
- Zod supplies runtime contracts now that the codebase is JavaScript-only.
- Permissions are presentation concerns only. A future backend must authorize
  every protected read and mutation.

The architecture favors small public module surfaces and progressive
complexity. A feature gains a folder only when that layer has real work.

## 2. Complete folder structure

```text
.
├── .env.example
├── .openai/hosting.json
├── ARCHITECTURE.md
├── README.md
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package.json
├── prettier.config.mjs
├── vercel.json
├── vite.config.mjs
├── build/
│   └── sites-vite-plugin.js
├── worker/
│   └── index.js
├── public/
│   ├── fonts/README.md
│   ├── icons/README.md
│   ├── images/README.md
│   └── og.png
└── src/
    ├── app/
    │   ├── (auth)/
    │   │   ├── layout.jsx
    │   │   ├── login/page.jsx
    │   │   ├── forgot-password/page.jsx
    │   │   └── reset-password/page.jsx
    │   ├── (dashboard)/
    │   │   ├── layout.jsx
    │   │   ├── loading.jsx
    │   │   ├── dashboard/page.jsx
    │   │   ├── projects/{page.jsx,[projectId]/page.jsx}
    │   │   ├── materials/{page.jsx,categories/page.jsx,[materialId]/page.jsx}
    │   │   ├── inventory/
    │   │   │   ├── page.jsx
    │   │   │   ├── site-stock/page.jsx
    │   │   │   ├── low-stock/page.jsx
    │   │   │   ├── damaged/page.jsx
    │   │   │   └── ledger/page.jsx
    │   │   ├── indents/{page.jsx,create/page.jsx,[indentId]/page.jsx}
    │   │   ├── procurement/
    │   │   │   ├── page.jsx
    │   │   │   ├── requests/page.jsx
    │   │   │   ├── quotations/page.jsx
    │   │   │   └── purchase-orders/{page.jsx,[poId]/page.jsx}
    │   │   ├── inward/{page.jsx,[inwardId]/page.jsx}
    │   │   ├── quality-control/{page.jsx,[qcId]/page.jsx}
    │   │   ├── material-issues/page.jsx
    │   │   ├── consumption/page.jsx
    │   │   ├── returns/page.jsx
    │   │   ├── stock-transfers/{page.jsx,[transferId]/page.jsx}
    │   │   ├── vendors/{page.jsx,[vendorId]/page.jsx}
    │   │   ├── resources/page.jsx
    │   │   ├── reports/page.jsx
    │   │   └── administration/
    │   │       ├── page.jsx
    │   │       ├── users/page.jsx
    │   │       ├── roles/page.jsx
    │   │       └── settings/page.jsx
    │   ├── api/README.md
    │   ├── error.jsx
    │   ├── layout.jsx
    │   ├── loading.jsx
    │   ├── not-found.jsx
    │   ├── page.jsx
    │   └── providers.jsx
    ├── components/
    │   ├── ui/
    │   ├── shared/
    │   ├── layout/
    │   └── feedback/
    ├── features/
    │   ├── dashboard/
    │   ├── projects/
    │   ├── materials/
    │   ├── inventory/
    │   ├── indents/
    │   ├── procurement/
    │   ├── inward/
    │   ├── quality-control/
    │   ├── material-issues/
    │   ├── consumption/
    │   ├── returns/
    │   ├── stock-transfers/
    │   ├── damaged-stock/
    │   ├── vendors/
    │   ├── resources/
    │   ├── reports/
    │   └── administration/
    ├── config/
    ├── hooks/
    ├── lib/
    ├── services/
    ├── stores/
    └── styles/
        ├── global-styles.js
        ├── styled-components-registry.jsx
        └── theme.js
```

## 3. Explanation of every root folder

- `src/app`: framework-only route and layout composition.
- `src/components/ui`: styled Radix/native primitives with no business domain.
- `src/components/shared`: reusable product patterns such as `DataTable`,
  `PageHeader`, `StatusBadge`, filters, search, and confirmation.
- `src/components/layout`: persistent application/authentication shells and
  global overlay composition.
- `src/components/feedback`: loading, empty, error, and skeleton patterns.
- `src/features`: business ownership boundaries. Cross-feature imports use a
  feature's public `index.js` when it has one.
- `src/config`: site identity, navigation, permissions, design-independent
  constants, and workflow status maps.
- `src/hooks`: domain-neutral browser hooks.
- `src/lib`: formatters, validators, query-client policy, and small utilities.
- `src/services`: transport contracts and a future HTTP adapter boundary.
- `src/stores`: Zustand stores for browser-owned global state only.
- `src/styles`: theme objects, global style reset, and server style registry.
- `public`: immutable URL-addressable assets. Feature-imported assets should be
  colocated with their feature instead.
- `build` and `worker`: Sites/vinext delivery plumbing, not application APIs.
- `tests`: rendered-output checks for the application shell and architecture.

The project deliberately has no `src/types` directory. Runtime Zod schemas,
well-named objects, narrow module APIs, and optional JSDoc describe JavaScript
contracts without reintroducing TypeScript.

## 4. Next.js App Router architecture

Route groups keep public authentication presentation separate from the
application shell without changing URLs.

```text
(auth)                         (dashboard)
├── /login                     ├── /dashboard
├── /forgot-password           ├── /projects, /projects/[projectId]
└── /reset-password            ├── /materials, /materials/categories
                               ├── /inventory/*
                               ├── /indents/*
                               ├── /procurement/*
                               ├── /inward/*
                               ├── /quality-control/*
                               ├── /material-issues, /consumption, /returns
                               ├── /stock-transfers/*
                               ├── /vendors/*, /resources, /reports
                               └── /administration/*
```

Every route remains small. Dynamic route files read their identifier and pass
it to a feature-level composition. `loading.jsx`, `error.jsx`, and
`not-found.jsx` cover framework states consistently. `src/app/api` holds route
handlers only for modules with live D1 persistence (`auth/*`, `projects/*`,
`materials/*`, `vendors/*`, `administration/users/*` — see rules
17–18); each imports its logic from `backend/db/` rather than implementing it
inline. A module still on mock data has no API routes.

## 5. Root layout hierarchy

```text
RootLayout
└── StyledComponentsRegistry
    └── Providers
        ├── styled-components ThemeProvider
        ├── TanStack QueryClientProvider
        ├── Radix TooltipProvider
        └── route group layout
            ├── AuthenticationLayout → AuthShell
            └── ApplicationLayout → AppShell
                ├── desktop AppSidebar
                ├── AppHeader
                ├── responsive content region
                ├── MobileNavigation
                ├── CommandMenu
                └── NotificationPanel
```

The dashboard shell is mounted by the route-group layout, so it is preserved
across feature navigation rather than recreated by pages.

## 6. Provider architecture

`providers.jsx` is a narrow client boundary. It creates one query client per
browser session, supplies the single branded Sita Shelters theme object, and
initializes Radix tooltip behavior. Future providers belong here only when they
truly span the app.

`styled-components-registry.jsx` collects server-rendered rules with
`ServerStyleSheet` and flushes them through `useServerInsertedHTML`. This avoids
unstyled streaming content and lets styled-components take over after
hydration.

## 7. Theme and design-token architecture

`theme.js` exports one light, warm-grey and rich-red semantic theme optimized
for the administrative dashboard. Components never choose raw brand hex
values. They ask for roles:

- Brand/action: `primary`, `secondary`, `accent`.
- Surfaces: `background`, `card`, `elevated`, `surfaceMuted`, `sunken`.
- Text: `foreground`, `mutedForeground`, inverse foreground roles.
- State: `success`, `warning`, `danger`, `info` and their foreground pairs.
- Shell: `sidebar`, `sidebarForeground`, `sidebarMuted`, `sidebarAccent`.
- Shape/elevation: shared radii and restrained shadows.
- Responsive: named mobile, tablet, laptop, and desktop breakpoints.

The operating system cannot replace this palette with an unrelated dark mode.
If a dark theme is introduced later, it must be separately designed and
contrast-tested before being exposed as a user preference.

## 8. Global-style architecture

`global-styles.js` uses `createGlobalStyle` for the smallest truly global set:

1. box sizing and document defaults;
2. body surface, typography, and font smoothing;
3. heading rhythm;
4. accessible focus-visible outlines;
5. form-control inheritance;
6. selection and scrollbar treatment;
7. reduced-motion behavior;
8. a small set of keyframes shared by feedback primitives.

Page-specific selectors and business layout do not belong there. Each
component owns its styles next to its markup through named styled-components.

## 9. Component architecture

### UI primitives

`components/ui` wraps native controls and Radix primitives. Buttons, inputs,
labels, dialogs, sheets, tooltips, dropdowns, selects, tabs, badges, and
separators share the same focus, density, radius, and state language.

### Shared patterns

`components/shared` combines primitives into domain-neutral product patterns.
Promotion into this directory requires proven reuse across multiple features.

### Data table

The reusable TanStack Table adapter supports:

- global search and feature-supplied filters;
- sorting and controlled/manual server modes;
- pagination and configurable page sizes;
- column visibility;
- row selection and bulk-action slots;
- export callbacks;
- keyboard-aware row activation;
- loading, empty, and responsive overflow behavior.

Column definitions remain inside their feature, for example
`features/inventory/components/inventory-columns.jsx`. This keeps material and
workflow semantics out of the generic table implementation.

### Layout and feedback

Layout components own structure only. Feedback components are reusable at
page, component, table, card, and inline scope.

## 10. Feature-module architecture

Inventory is the reference feature:

```text
features/inventory/
├── components/inventory-columns.jsx
├── constants/inventory.constants.js
├── hooks/use-inventory.js
├── schemas/inventory.schema.js
├── services/inventory.service.js
├── README.md
└── index.js
```

- the schema validates runtime inputs and responses;
- constants own query keys, defaults, and option lists;
- the service normalizes transport behavior;
- the hook composes the service with TanStack Query;
- columns define inventory-specific rendering;
- `index.js` is the supported external surface.

Other feature folders start as ownership markers and gain layers only when
needed. Do not duplicate the complete inventory tree into every module.

## 11. State-management architecture

| State kind             | Owner           | Examples                                       |
| ---------------------- | --------------- | ---------------------------------------------- |
| Remote/server state    | TanStack Query  | inventory rows, vendors, approvals, projects   |
| Cross-app client state | Zustand         | sidebar, project selection, overlay visibility |
| Local component state  | React           | field expansion, local dialog step, draft UI   |
| Form state             | React Hook Form | user-entered values, dirty state, submit state |
| Runtime validation     | Zod             | forms, search parameters, service boundaries   |

Server records must not be copied permanently into Zustand. Mutations update
or invalidate query caches. Store persistence is limited to stable device-local
preferences.

## 12. API/service-layer architecture

`services/http-client.js` defines the one fetch adapter boundary (normalized
request, response, cancellation, and error behavior — with
`credentials: "include"` for the session cookie). `src/lib/api-client.js`
instantiates it once against `NEXT_PUBLIC_API_URL` when explicitly supplied,
or `/` by default. Every live feature's
`api*Adapter` (`apiProjectsAdapter`, `apiMaterialsAdapter`,
`apiVendorsAdapter`, `apiAdministrationUsersAdapter`) calls through that one
client — none define their own `fetch` wrapper. UI components never call
`fetch` directly.

The flow is:

```text
route → feature component → feature query hook → feature service
      → src/lib/api-client.js → /api/[...path] (Vercel) → Railway backend
```

In Vercel, set the server-only `BACKEND_API_URL` to the Railway HTTPS URL and
leave `NEXT_PUBLIC_API_URL` unset. For local development,
`NEXT_PUBLIC_API_URL=http://localhost:4000` intentionally bypasses the proxy.
Secrets never use a `NEXT_PUBLIC_` prefix and do not belong in the browser
bundle — the backend, not this app, holds every credential.

## 13. Project-context architecture

`project-context-store.js` treats `null` as the canonical **All Projects**
scope. The header project switcher persists the selected identifier only.
Actual project records remain TanStack Query data.

Feature query keys include a normalized scope object so switching projects
changes the cache identity rather than mutating unrelated records. Features may
require a specific project, support the global scope, or deliberately ignore
scope; that decision stays explicit at the feature boundary.

## 14. Status and workflow architecture

`config/status.js` centralizes status definitions:

```text
status key → label → semantic tone → semantic icon key
```

It contains indent, purchase-order, transfer, and inventory state machines plus
allowed transitions. `StatusBadge` consumes this map, so pages do not recreate
labels or colors. Adding a backend status requires one mapping and an explicit
decision about its workflow transitions.

## 15. Responsive architecture

The design is desktop-first but not desktop-only:

- desktop (`≥1280px`): persistent sidebar and dense information layout;
- laptop (`1024–1279px`): compact spacing and preserved core columns;
- tablet (`768–1023px`): reduced sidebar width and horizontally safe tables;
- mobile (`<768px`): navigation in a sheet, stacked forms/cards, compact header,
  and filter/bulk controls that can move into sheets.

Tables use horizontal containment when data density is essential. Future
features may provide purpose-built condensed cards when reading priority is
more important than column comparison.

## 16. Example import flow

```jsx
// src/app/(dashboard)/inventory/page.jsx
import { InventoryScreen } from "@/features/inventory";

export default function InventoryPage() {
  return <InventoryScreen />;
}
```

```jsx
// src/features/inventory/components/inventory-screen.jsx
import { DataTable } from "@/components/shared";
import { useInventory } from "../hooks/use-inventory";
import { inventoryColumns } from "./inventory-columns";
```

The route sees only the public feature API. The feature sees shared primitives
and its own private layers. Shared code never imports a business feature.

## 17. Architecture rules and boundaries

1. Keep route files lightweight; no service calls or business rules in pages.
2. Use JavaScript/JSX only. Do not add `.ts`, `.tsx`, `tsconfig.json`, TypeScript
   packages, type-only imports, interfaces, enums, or compile-time assertions.
3. Style components with styled-components and semantic theme roles. Do not
   add Tailwind utilities, raw scattered palette values, or page CSS files.
4. A module creating styled-components is a Client Component in App Router.
5. Keep server-rendered style collection in the root registry.
6. Use Zod where data crosses an untrusted runtime boundary.
7. Keep API calls inside services; use TanStack Query from feature hooks.
8. Keep remote data out of Zustand.
9. Treat UI permission checks as presentation only. The server independently
   re-enforces every protected route via `requirePermission` (rule 18) —
   never trust the client's role/permission state alone.
10. Import a feature through its public `index.js` outside that feature.
11. Keep business columns, form schemas, and status meaning inside the owner.
12. Use descriptive kebab-case filenames and PascalCase React components.
13. Use `use-*.js` for hooks, `*.schema.js` for schemas,
    `*.service.js` for services, and `*.constants.js` for feature constants.
14. Preserve keyboard navigation, focus visibility, semantic HTML, and Radix
    accessibility behavior.
15. Prefer composition and small focused components over prop drilling or
    monolithic screens.
16. Add a global abstraction only after genuine cross-feature reuse.
17. **No backend code lives in this repository tree at all.** `backend/` is
    a separate top-level sibling of `frontend/` (this app) — its own
    `package.json`, its own deploy target (Railway), no Next.js/React
    dependency, and no import path crosses the boundary in either
    direction except two intentionally-duplicated static config copies
    (see §18 below). This app talks to it exclusively over HTTP through
    `src/lib/api-client.js` (§12).
18. Vercel forwards `/api/*` to Railway server-to-server, so the session
    cookie stays same-origin. `src/features/auth/hooks/use-auth.js`
    (`useAuth()`, backed by TanStack Query) is the single source of "who's
    signed in" — every consumer calls it directly rather than threading a
    session through context or props; the cache dedupes it.
    `(dashboard)/layout.jsx` is a **client component** that gates on
    `useAuth()` and redirects to `/login` client-side when it resolves to
    signed-out. This deliberately centralizes session-cache invalidation
    after login and logout.
19. Treat UI permission checks (`src/config/permissions.js`) as
    presentation only. The backend independently re-enforces every
    protected route with its own copy of the same role → permission map
    (`backend/src/permissions.js`) — never trust the client's role state
    alone.
20. Each live feature's `src/features/*/services/*.service.js` has an
    `api*Adapter` that calls the backend through the shared client
    (§12), and `create*Service(adapter)` wraps it with Zod validation;
    `list`/`get` are `async` and `await` the adapter so the same service
    shape works whether the adapter is sync (a retained `mock*Adapter`,
    kept only for tests) or async (the live API). Hooks built against a
    live adapter must not pass a synchronous `initialData` callback to
    `useQuery` — an async adapter makes that return a pending Promise
    instead of data, which TanStack Query cannot use.

## 18. The backend (`backend/` at the repo root)

Full detail lives in `backend/README.md` — this is the summary this app's
contributors need to know:

- Standalone Node/Express API over MongoDB with Mongoose models. It deploys
  independently to Railway; Vercel communicates with it through the
  server-side API proxy.
- Live domains include auth (bcrypt + hashed bearer-token sessions), master
  data, and the transactional workflows listed above. See the backend route
  modules for the current source of truth.
- CORS is locked to an explicit origin allowlist (`FRONTEND_ORIGIN`) for
  intentional direct API calls. Production sessions are `SameSite=Lax;
Secure; HttpOnly`, because the browser communicates through the same-origin
  Vercel proxy.
- `backend/src/permissions.js` is a hand-synced copy of the relevant parts
  of `src/config/permissions.js` (`APP_ROLES`, `ROLE_PERMISSIONS`,
  `hasPermission`). `backend/src/db/seed-data/*.js` are hand-synced copies
  of the matching `src/lib/mock-data/*.js` files. Both are deliberate
  duplication, not drift by accident — the two apps are separately
  deployed packages with no shared-package tooling set up yet; keep them
  in sync by hand when either changes, and see the comment atop
  `backend/src/permissions.js` for why this was chosen over npm
  workspaces at the project's current size.
- Local dev needs a real MongoDB (the backend has no in-memory fallback) —
  see `backend/README.md` for the quickest way to get one running and get
  both services talking to each other.

# SITA Shelters Frontend Architecture

This document describes the implemented JavaScript frontend foundation for the
SITA Shelters Construction Resource & Inventory Management System. It creates
the durable seams needed for a multi-project enterprise product without adding
authentication logic. Every module except Projects is in-memory mock data with
no backend; Projects alone has a real, isolated backend — see rules 17–18.

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
├── vite.config.mjs
├── backend/
│   ├── drizzle.config.mjs
│   ├── db/
│   │   ├── schema.ts
│   │   └── projects-repository.js
│   └── drizzle/
│       └── (generated SQL migrations)
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
`not-found.jsx` cover framework states consistently. `src/app/api` holds only
the Projects module's route handlers (`projects/route.js`,
`projects/[projectId]/route.js`); they import their logic from `backend/db/`
(see rules 17–18) rather than implementing it inline. No other module has API
routes.

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

## 12. API/service-layer preparation

No backend endpoint is implemented. `services/http-client.js` defines a small
fetch adapter boundary with normalized request, response, cancellation, and
error behavior. Feature services depend on that boundary and return validated
domain data. UI components never call `fetch` directly.

The intended flow is:

```text
route → feature component → feature query hook → feature service
      → shared HTTP client → future backend
```

Environment-specific origins come from `NEXT_PUBLIC_API_URL`; secrets never use
a `NEXT_PUBLIC_` prefix and do not belong in the browser bundle.

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
9. Treat UI permission checks as presentation only, never authorization.
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
17. Keep backend, database, and authentication implementation outside this
    frontend-foundation scope. The one deliberate exception is the Projects
    module: it is backed by a real Cloudflare D1 database via Drizzle, and
    every line of that implementation lives under the top-level `backend/`
    folder (see section 18), never inside `src/`. Every other module remains
    an in-memory mock-data feature.
18. `backend/` is a self-contained persistence layer with one job: serve
    `/api/projects` and `/api/projects/[projectId]`.
    - `backend/db/schema.ts` is a migration-only Drizzle schema (the only
      TypeScript file in the repository) used solely by `drizzle-kit` to
      generate SQL migrations into `backend/drizzle/`.
    - `backend/db/projects-repository.js` is the runtime data layer. It talks
      to Cloudflare D1 directly through the raw prepared-statement API
      (`env.DB`, bound per `.openai/hosting.json`'s `d1: "DB"`), not through
      `drizzle-orm` — Drizzle is a migration tool here, not a query layer.
    - `backend/drizzle.config.mjs` points `drizzle-kit generate` at that
      schema; run it via `npm run db:generate`.
    - The Next.js route handlers in `src/app/api/projects/` stay in `src/app`
      because Next.js requires API routes to live there — they are thin
      framework glue that imports the actual logic from `backend/db/`.
    - `src/features/projects/services/projects.service.js` calls those API
      routes over `fetch` (`apiProjectsAdapter`) exactly like a browser client
      would call any other backend; it retains a `mockProjectsAdapter` only
      for tests and demos, never used by the live app.
    - No other feature may depend on `backend/`. If a future module needs
      real persistence, give it its own repository file under `backend/db/`
      and its own route handlers — do not grow `projects-repository.js` into
      a shared data-access layer.

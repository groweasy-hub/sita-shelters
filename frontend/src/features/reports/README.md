# Reports feature boundary

Reports has no primary records of its own — it is a pure aggregation layer
over every other feature's public API (`@/features/inventory`,
`@/features/consumption`, `@/features/procurement`, `@/features/stock-transfers`,
`@/features/damaged-stock`), the same composition pattern
`src/features/projects/services/projects.service.js` uses.

`components/reports-screen.jsx` owns a single global project filter shared
by all five report tabs (Inventory, Consumption, Procurement, Transfers,
Damage & Wastage). Each tab is a self-contained component that reads the
already-fetched data via that feature's `useAll*` hook and aggregates it
client-side with the pure helpers in `lib/aggregate.js`. `components/bar-list.jsx`
is a dependency-free "top N" visualization — no charting library is used
anywhere in this feature, consistent with `dashboard-overview.jsx`'s
`Track`/`Fill` pattern.

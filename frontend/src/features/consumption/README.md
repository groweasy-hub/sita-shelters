# Consumption feature boundary

Owns recording and reviewing material consumption against the Material Issues
a work team drew stock against. Each entry links back to a `materialIssueId`
so consumption is always traceable to an issue and never invented in
isolation.

The dependency flow is one way:

```text
route/client composition -> hook/query options -> service -> adapter
                         \-> columns + shared DataTable + trend panel
```

- `components/` owns consumption-specific presentation: column definitions,
  the list/log screen, and a local `ConsumptionTrend` bar-list panel (plain
  styled-components, no charting library).
- `hooks/` owns TanStack Query integration and query-key selection.
- `services/` reads the Material Issues feature's public `materialIssuesService`
  to resolve each entry's project/material/unit from its `materialIssueId`,
  keeping issue data as the single source of truth. The in-memory adapter is
  deterministic, hand-authored scaffolding: for every issue id, the sum of
  `quantityConsumed` across its entries equals that issue's `consumedQuantity`
  running total.
- `schemas/` validates request and response-shaped data at runtime.
- `constants/` contains stable query keys, options, and defaults.

When a backend is available, implement the adapter contract and pass it to
`createConsumptionService`. UI components should not call `fetch` or import a
transport client directly, and consumption data should never be copied into
Zustand.

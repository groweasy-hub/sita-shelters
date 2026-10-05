# Material issues feature boundary

Owns the workflow for issuing available site stock to work teams: stock moves
from Available to Issued but is not yet consumed. This directory follows the
inventory feature's reference shape.

The dependency flow is one way:

```text
route/client composition -> hook/query options -> service -> adapter
                         \-> columns + shared DataTable
```

- `components/` owns issue-specific presentation such as column definitions
  and the list/log screen.
- `hooks/` owns TanStack Query integration and query-key selection, including
  `useAllMaterialIssues`, the cross-feature read model the Consumption and
  Returns features use to resolve `materialIssueId` references.
- `services/` validates both sides of the transport boundary. The in-memory
  adapter is deterministic, hand-authored scaffolding, not application state:
  every record's `consumedQuantity` and `returnedQuantity` are authored to
  match the totals the Consumption and Returns datasets sum to for that issue,
  so `consumedQuantity + returnedQuantity <= issuedQuantity` always holds.
- `schemas/` validates request and response-shaped data at runtime.
- `constants/` contains stable query keys, options, and defaults.

When a backend is available, implement the adapter contract and pass it to
`createMaterialIssuesService`. UI components should not call `fetch` or import
a transport client directly, and issue data should never be copied into
Zustand.

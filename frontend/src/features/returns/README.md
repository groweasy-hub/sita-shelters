# Returns feature boundary

Owns return-to-store workflows and Return Quality Check (QC): the unused
remainder of a Material Issue coming back to store, and its inspection
outcome. QC is modelled as a nested `inspection` object on the same return
record (`pending-inspection` → `good` back to available stock, or `damaged`
split off as damaged stock) rather than a separate feature, since a return is
never meaningfully displayed without its inspection state.

The dependency flow is one way:

```text
route/client composition -> hook/query options -> service -> adapter
                         \-> columns + shared DataTable
```

- `components/` owns return-specific presentation: column definitions
  (including the good/damaged quantity split) and the list/log screen.
- `hooks/` owns TanStack Query integration and query-key selection.
- `services/` reads the Material Issues feature's public `materialIssuesService`
  to resolve each record's project/material/unit from its `materialIssueId`.
  The in-memory adapter is deterministic, hand-authored scaffolding: for every
  issue id, the sum of `returningQuantity` across its return records equals
  that issue's `returnedQuantity` running total, and every record's
  `goodQuantity + damagedQuantity` stays within its own `returningQuantity`.
- `schemas/` validates request and response-shaped data at runtime, including
  the nested inspection contract.
- `constants/` contains stable query keys, options, and defaults.

When a backend is available, implement the adapter contract and pass it to
`createReturnsService`. UI components should not call `fetch` or import a
transport client directly, and return data should never be copied into
Zustand.

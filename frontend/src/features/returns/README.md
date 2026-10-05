# Returns feature boundary

Owns return-to-store workflows and Return Quality Check (QC): the unused
remainder of a Material Issue coming back to store, and its inspection
outcome. QC is modelled as a nested `inspection` object on the same return
record (`pending-inspection` → `good` back to available stock, or `damaged`
split off as damaged stock) rather than a separate feature, since a return is
never meaningfully displayed without its inspection state.

The Returns page is titled **Returns & Replacements** and lists only goods-inward
quantity rejected at QC and sent back to the vendor (`GET /api/returns/vendor`,
read from QC inspection records) with its replace/refund status. Site returns
(unused issued material coming back to store) still have their own
detail/create routes (`/returns/:id`, `/returns/new`) but no list on this page.
Both kinds are settled with a replace or a refund for a `quantity`; the value
is always calculated on the server (quantity × current unit price), never
typed in.

Choosing *replace* only records what is to be replaced. When the vendor's
material actually arrives, **Items replaced** records a full or partial
delivery (`POST …/replacements`): it gets a replacement id (`RPL-#####`) and
goes through the same approval path as a GRN — Site Engineer, Project Manager
(whose approval posts the stock, held as awaiting confirmation) and Store
Manager confirmation — before it is added to available stock as a
`replacement` ledger movement referencing that id (`POST /api/replacements/:id/…`).
Deliveries can be repeated until the agreed quantity is in (awaiting →
partially replaced → replaced); a rejected delivery frees its quantity. The stock is then issued and consumed like any other.

Choosing *refund* likewise records what is owed; **Refund completed** then marks
the money as received (with an optional credit-note reference), taking the row
from Refund Pending to Refund Completed.

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

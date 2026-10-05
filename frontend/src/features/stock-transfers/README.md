# Stock Transfers feature

Owns inter-project stock transfer requests: the list screen, the transfer
detail/workflow screen, mock data, query hooks, and schemas. This module lets
one project move surplus material to another that is short, instead of
raising a fresh purchase.

The dependency flow is one way, matching the inventory reference feature:

```text
route/client composition -> hook/query options -> service -> adapter
                         \-> columns + shared DataTable
```

- `components/` owns transfer-specific presentation: list columns, the list
  screen, the detail screen, the workflow stepper, the source/in-transit/
  destination stock visual, and the presentational "new transfer" dialog.
- `hooks/` owns TanStack Query integration and query-key selection.
- `services/` hand-authors 22 deterministic mock transfer records and
  validates both sides of the transport boundary. The in-memory adapter is
  scaffolding, not application state.
- `schemas/` validates request- and response-shaped data at runtime with Zod.
- `constants/` contains stable query keys, options, and defaults. Status
  vocabulary and allowed transitions are NOT redefined here — they come from
  `workflowConfig.transfer` in `src/config/status.js`.

## Workflow

```text
draft -> requested -> approved -> ready-for-dispatch -> dispatched -> in-transit -> received
                    \-> rejected (branch off requested or approved)
```

Before dispatch, the source project's quantity is reserved for the transfer
but not deducted. At dispatch it becomes "in transit" — deducted from source
available stock, not yet added to the destination. Only at `received` does
the destination's available stock increase. `TransferStockFlow` narrates this
rule visually; it does not mutate live inventory since there is no backend.

When a backend is available, implement the same adapter contract
(`list`, `get`, `listAll`) and pass it to `createStockTransfersService`. UI
components should not call `fetch` or import a transport client directly, and
transfer records should never be copied into Zustand.

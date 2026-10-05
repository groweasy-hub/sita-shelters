# Indents feature boundary

Material demand requests raised by project and site engineers against a
project, and their approval-to-fulfilment lifecycle. This is the entry point
of the connected procurement workflow described in the product spec:

```text
MATERIAL MASTER -> PROJECT REQUIREMENT -> INDENT -> CHECK INTERNAL STOCK
  -> (stock exists) -> stock transfer (owned by the stock-transfers feature)
  -> (stock missing) -> PROCUREMENT
```

The dependency flow mirrors the inventory reference feature:

```text
route/client composition -> hook/query options -> service -> adapter
                         \-> columns + shared DataTable
```

- `components/` owns indent-specific presentation: the list/create/detail
  screens, table columns, and the shared `StockRecommendation` callout used
  by both the create form and the detail page's stock-check panel.
- `hooks/` owns TanStack Query integration and query-key selection, plus the
  mock `useCreateIndent` mutation backing the "Raise Indent" form.
- `services/` validates both sides of the transport boundary. The in-memory
  adapter is deterministic, hand-authored scaffolding (24 indents across all
  eight projects), not application state.
- `schemas/` validates request/response-shaped data and the create-form
  input at runtime with Zod.
- `constants/` contains stable query keys, priority/status option lists, and
  list defaults.

## Stock intelligence

`StockRecommendation` reads `useAllInventoryItems()` from the public
inventory feature API (`@/features/inventory`) — it never re-implements
inventory access. Given a material, project and requested quantity it
renders one of three states: sufficient stock at the current project,
a transfer recommendation naming the best-surplus project with a link to
`/stock-transfers`, or a "will require procurement" notice.

## Linked procurement

Ten of the seeded indents carry `hasProcurementRequest: true` and are the
exact `sourceIndentId` values referenced by the procurement feature's mock
purchase requests. The indent detail page renders a static "Procurement
Request Raised" affordance for those records rather than a live
cross-feature query, keeping the two features loosely coupled.

When a backend is available, implement the `IndentsAdapter` shape used by
`mockIndentsAdapter` and pass it to `createIndentsService`. UI components
should not call `fetch` or import a transport client directly.

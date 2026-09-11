# Goods Inward feature boundary

Records a vendor delivery arriving on site against a purchase order. This
is the step between procurement and quality control in the connected
workflow:

```text
VENDOR DELIVERY -> GOODS INWARD -> QC CHECK -> ACCEPT (site stock) / REJECT (vendor return)
```

The dependency flow mirrors the inventory reference feature:

```text
route/client composition -> hook/query options -> service -> adapter
                         \-> columns + shared DataTable
```

- `components/` owns the list and detail screens and table columns.
- `hooks/` owns TanStack Query integration and query-key selection.
- `services/` validates both sides of the transport boundary. The
  in-memory adapter is deterministic, hand-authored scaffolding (14
  records, each tracing back to a `purchaseOrderId` from the procurement
  feature's mock purchase orders), not application state.
- `schemas/` validates request/response-shaped data at runtime with Zod.
- `constants/` contains stable query keys, status options, and list
  defaults.

## Goods inward is not stock

Every record starts as `pending-qc` or `under-inspection`. A vendor
delivery arriving on site never becomes available inventory on its own —
the quality-control feature is the only thing that can move a line into
`accepted` (destined for site stock) or `rejected` (destined for a vendor
return). `partially-accepted` is used for one record where part of a
delivery passed inspection and part was flagged as damaged; it is not in
the centralized status vocabulary in `src/config/status.js` and is
rendered through `StatusBadge`'s graceful unknown-status fallback rather
than by editing that file.

When a backend is available, implement the `InwardAdapter` shape used by
`mockInwardAdapter` and pass it to `createInwardService`. UI components
should not call `fetch` or import a transport client directly.

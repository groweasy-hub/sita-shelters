# Procurement feature boundary

Covers the middle of the connected workflow — everything between an
approved indent's demand and a supplier delivering against a purchase
order:

```text
PURCHASE REQUEST -> VENDOR RFQ / QUOTATIONS -> COMPARISON -> PURCHASE ORDER
  -> VENDOR DELIVERY (tracked by the inward feature)
```

Three sub-resources share this feature boundary because they are read
together constantly (a comparison screen needs both the request and its
quotations; a PO references the request that produced it), but each keeps
its own service/hook pair:

```text
services/purchase-requests.service.js  -> hooks/use-purchase-requests.js
services/quotations.service.js         -> hooks/use-quotations.js
services/purchase-orders.service.js    -> hooks/use-purchase-orders.js
```

- `components/` owns the overview, purchase-request list, quotation
  comparison, purchase-order list/detail screens and their table columns.
- `lib/purchase-order-metrics.js` centralizes order-value and
  delivery-progress math so the list, detail and overview screens agree.
- `schemas/` validates all three record shapes at runtime with Zod.
- `constants/` contains stable query keys and status/option lists for all
  three sub-resources.

## Mock data linkage

- Ten purchase requests reference the ten indents flagged
  `hasProcurementRequest: true` in the indents feature's mock data via
  `sourceIndentId` (a literal identifier, not a live join).
- Six of those purchase requests carry 2-4 vendor quotations each; the
  quotation marked `status: "selected"` is the one a purchase order was
  raised from.
- Sixteen purchase orders span every `purchaseOrder` workflow status. Four
  demonstrate partial supply across multiple `deliverySchedule` entries.
  `usePurchaseOrdersForIndent(indentId)` is exported publicly so the
  indents feature's detail page can resolve linked orders directly instead
  of only showing a static affordance.

When a backend is available, implement each `*Adapter` shape and pass it to
its matching `create*Service` factory. UI components should not call
`fetch` or import a transport client directly.

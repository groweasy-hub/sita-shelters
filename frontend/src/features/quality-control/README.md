# Quality Control feature boundary

Records the accept/reject verdict against a goods-inward delivery — the
final decision point before the connected workflow forks:

```text
GOODS INWARD -> QC CHECK -> ACCEPT -> SITE STOCK (inventory)
                          -> REJECT -> VENDOR RETURN
```

The dependency flow mirrors the inventory reference feature:

```text
route/client composition -> hook/query options -> service -> adapter
                         \-> columns + shared DataTable
```

- `components/` owns the list and detail screens and table columns. The
  detail screen visually splits accepted vs. rejected quantity and
  describes (without executing) the downstream inventory/vendor-return
  step.
- `hooks/` owns TanStack Query integration and query-key selection, plus
  the publicly exported `useQualityControlInspectionsForInward(inwardId)`
  used by the inward feature's detail page.
- `services/` validates both sides of the transport boundary. The
  in-memory adapter is deterministic, hand-authored scaffolding — 14
  inspections, one per line item across the inward feature's 14 mock GRNs,
  joined by a real `inwardId` reference — not application state.
- `schemas/` validates request/response-shaped data at runtime with Zod.
- `constants/` contains stable query keys, status options, and list
  defaults.

When a backend is available, implement the `QualityControlAdapter` shape
used by `mockQualityControlAdapter` and pass it to
`createQualityControlService`. UI components should not call `fetch` or
import a transport client directly, and no feature in this module set
writes QC verdicts back into inventory or a returns record — that
integration is explicitly out of scope for this mock-data milestone.

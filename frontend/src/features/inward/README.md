# Goods Inward feature boundary

Records a vendor delivery arriving on site against a purchase order. This
is the step between procurement and quality control in the connected
workflow:

```text
VENDOR DELIVERY -> GOODS INWARD -> QC CHECK -> GRN CREATED
   -> SITE ENGINEER APPROVAL -> PROJECT MANAGER APPROVAL (posts stock)
   -> STORE MANAGER CONFIRMS RECEIPT -> READY TO USE
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

A delivery arriving on site never becomes usable inventory on its own. Each
record carries a `stage` (separate from its QC `status`):

| Stage | Waiting for | Who (permission) |
| --- | --- | --- |
| `awaiting-qc` | quality check on every line | QC (`quality-control:manage` + `approve`) |
| `pending-engineer-approval` | GRN raised once QC finished with something accepted | Site Engineer (`inward:engineer-approve`) |
| `pending-manager-approval` | final check | Project Manager (`inward:manager-approve`) |
| `pending-store-confirmation` | stock posted, held as "awaiting confirmation" | Store Manager (`inward:confirm-receipt`) |
| `received` | — stock is available to issue and use | |
| `rejected` / `closed` | an approver turned it down / nothing was accepted | |

The Project Manager's approval is what authorises the stock posting: the
accepted quantity is posted to the site as `pendingReceiptQuantity` and the
purchase order's delivered quantity moves. The Store Manager's confirmation
moves it into available stock (a `goods-inward` ledger entry referencing the
GRN). GRNs from before the workflow have no stage and read as `received`.

When a backend is available, implement the `InwardAdapter` shape used by
`mockInwardAdapter` and pass it to `createInwardService`. UI components
should not call `fetch` or import a transport client directly.

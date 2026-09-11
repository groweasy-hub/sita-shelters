# Inventory feature boundary

This directory is the reference shape for a data-backed feature. Route files may
compose its public exports, but inventory UI, query definitions, validation, and
transport contracts remain here.

The dependency flow is one way:

```text
route/client composition -> hook/query options -> service -> adapter
                         \-> columns + shared DataTable
```

- `components/` owns inventory-specific presentation such as column definitions.
- `hooks/` owns TanStack Query integration and query-key selection.
- `services/` validates both sides of the transport boundary. The in-memory
  adapter is deterministic scaffolding, not application state.
- `schemas/` validates request and response-shaped data at runtime.
- `types/` contains frontend read models and the adapter contract; these are not
  database schemas.
- `constants/` contains stable query keys, options, and defaults.

When a backend is available, implement `InventoryAdapter` and pass it to
`createInventoryService`. UI components should not call `fetch` or import a
transport client directly, and inventory server data should never be copied into
Zustand.

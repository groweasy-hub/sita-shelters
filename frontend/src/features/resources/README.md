# Resources feature

Owns Resource Management: machinery, equipment, water tankers, tools,
scaffolding and vehicles — reusable physical assets that move between
projects repeatedly. This is deliberately distinct from `materials` and
`inventory`, which track consumable stock that is used up rather than
returned and reassigned.

The dependency flow is one way, mirroring the `inventory` reference feature:

```text
route/client composition -> hook/query options -> service -> adapter
                         \-> columns + shared DataTable
```

- `components/` owns resource-specific presentation: list/detail screens and
  column definitions for the resource register, the cross-resource
  assignment log and the cross-resource maintenance log.
- `hooks/` owns TanStack Query integration and query-key selection.
- `services/` validates both sides of the transport boundary. The in-memory
  adapters (`resources.service.js`, `resource-assignments.service.js`,
  `resource-maintenance.service.js`) are deterministic, hand-authored
  scaffolding, not application state.
- `schemas/` validates request- and response-shaped data at runtime.
- `constants/` contains stable query keys, category/status option lists and
  defaults.

When a backend is available, implement the resource adapter contracts and
pass them to `createResourcesService`. UI components should not call `fetch`
or import a transport client directly, and resource server data should never
be copied into Zustand.

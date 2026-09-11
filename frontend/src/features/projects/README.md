# Projects feature boundary

The project directory and per-project command centre. `ProjectsScreen` lists
every project as a card with computed inventory value, active indents,
pending procurement and low-stock counts (aggregated live from the inventory
feature). `ProjectDetailScreen` is a tabbed workspace — Overview and
Inventory are fully wired to real data; the remaining tabs (Indents,
Procurement, Inward, Consumption, Transfers, Resources, Reports) link out to
their owning module and will render project-scoped content directly once
those modules are connected here.

`services/projects.service.js` enriches the canonical `PROJECTS` mock-data
records with aggregates computed from `@/features/inventory`'s public API —
this is intentional: Projects composes other features through their public
surface rather than owning inventory data itself.

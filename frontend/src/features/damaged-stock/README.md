# Damaged & wastage feature boundary

This feature has no primary records of its own. It composes a unified
damage/wastage log from three origins, matching the product's explicit
separation of damaged material from construction wastage:

- Quality Control rejections at goods inward (`sourceType: "qc-rejection"`,
  read through `@/features/quality-control`'s public API).
- Return QC findings on unused issued material
  (`sourceType: "return-inspection"`, read through `@/features/returns`).
- Directly logged incidents — transportation, weather, improper storage,
  expiry, accidental damage, and all construction wastage
  (`sourceType: "other"`), which have no owning transactional module.

`services/damaged-stock.service.js` is read-only and never mutates the
source features; it is the same pattern as `projects.service.js` composing
`@/features/inventory` for aggregate metrics. `DamagedStockScreen` is
composed into `/inventory/damaged` alongside the raw damaged-status
inventory position table, and it is intentionally not a standalone
navigation entry since the product's information architecture treats it as
part of stock control.

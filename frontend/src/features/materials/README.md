# Materials feature

Owns the material catalogue, category presentation, material detail UI, and
material form validation. Stock quantities and movements belong to Inventory,
not this catalogue boundary.

Future code should expose a small `index.js`; keep table columns, hooks,
services, schemas, and data contracts private to this feature unless another feature has
a genuine shared contract.

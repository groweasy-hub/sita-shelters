# Vendors feature

Owns vendor directory, vendor detail, qualification presentation, and
vendor-specific forms. Procurement may reference stable vendor contracts, but
vendor lifecycle behavior stays here.

When implemented, keep service requests behind query hooks and expose only
route-ready components and intentionally shared contracts through `index.js`.

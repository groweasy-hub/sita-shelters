# Shared styles

Theme tokens live in `theme.js`, application-wide rules in `global-styles.js`,
and App Router style collection in `styled-components-registry.jsx`. Reserve
this directory for styles that genuinely span the whole application.

The active admin palette is intentionally singular: rich red `#990011`, deep
wine `#80011f`, light warm grey `#fcf6f5`, and warm stone `#9e9a8d`, with
semantic supporting values for surfaces, text, status, and accessibility.

Keep route- and feature-specific styled components beside the component that
owns them.

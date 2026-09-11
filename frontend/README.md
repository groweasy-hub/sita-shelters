# SITA Shelters

Frontend foundation for the **Construction Resource & Inventory Management
System**. The project uses JavaScript and JSX throughout—there is no project
TypeScript toolchain or TypeScript source.

## Frontend stack

- Next.js App Router and React
- styled-components with one centralized warm-grey and rich-red brand theme
- Radix UI primitives and Lucide icons
- Zustand for browser-owned global UI state
- TanStack Query for remote/server state
- React Hook Form and Zod for future feature forms
- Framer Motion for intentional transitions
- ESLint and Prettier

The Cloudflare-compatible vinext/Sites build remains available alongside the
standard Next.js project conventions.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. If the terminal says another vinext server is
already running, use the displayed URL or stop that specific process before
starting another server.

## Quality checks

```bash
npm run lint
npm run build
npm test
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the route map, folder ownership,
styled-components theme and SSR registry, component layers, state boundaries,
service preparation, project context, workflows, and extension rules.

Authentication and backend APIs are intentionally not implemented in this
foundation. The auth screens are presentation shells, permissions affect UI
visibility only, and feature services are prepared integration boundaries.

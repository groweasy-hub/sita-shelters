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

The Cloudflare-compatible vinext/Sites build remains available for the
existing local workflow. Production deployment is configured for Vercel's
Next.js runtime and a Railway API.

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
npx next build
```

`npm run build` verifies the existing vinext/Sites target. `npx next build`
is the Vercel production build and is intentionally kept explicit in
`vercel.json`.

## Deploying frontend to Vercel

Import this repository in Vercel and set the project's **Root Directory** to
`frontend`. The committed `vercel.json` selects the Next.js framework and
uses `npx next build`.

Set these environment variables for Production (and Preview if you want
preview deployments to use the API):

- `BACKEND_API_URL=https://<your-railway-service>.up.railway.app`
- `NEXT_PUBLIC_ENABLE_TELEMETRY=false` (optional)

Do **not** set `NEXT_PUBLIC_API_URL` in Vercel. When absent, every browser
request goes to this app's `/api/*` route, which forwards it server-to-server
to Railway. This avoids third-party-cookie failures and avoids needing to add
each temporary Vercel preview domain to backend CORS. The Railway URL remains
server-only and is not bundled into browser JavaScript.

For local development, keep `NEXT_PUBLIC_API_URL=http://localhost:4000` in
`.env.local` to call the local API directly. See `../backend/README.md` for
the Railway environment variables and release order.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the route map, folder ownership,
styled-components theme and SSR registry, component layers, state boundaries,
service preparation, project context, workflows, and extension rules.

Authentication and feature APIs use the standalone `../backend` Express
service. The client has one API boundary in `src/lib/api-client.js`; in Vercel
it resolves to the same-origin proxy route, while local development may point
directly at `http://localhost:4000`.

# SITA Shelters backend

Standalone Node/Express + MongoDB API for the SITA Shelters construction
ERP. Deployed independently of the frontend (`../frontend`, a Next.js app on
Vercel) — this service has no Next.js/React dependency and can run on any Node
host. Railway is the production target.

In production, Vercel's same-origin `/api/*` route forwards browser requests
to this service using its server-only `BACKEND_API_URL`. That keeps session
cookies first-party and avoids cross-origin preview deployment issues. Local
development may call this API directly at `http://localhost:4000`.

## Stack

- Express
- MongoDB via Mongoose (schemas with validation, not a schemaless driver)
- bcryptjs for password hashing, hashed bearer-token sessions (own cookie,
  not a framework session library)

## Local setup

You need a real MongoDB — there is no in-memory fallback. Either a MongoDB
Atlas cluster (free tier is enough) or a local `mongod`/Docker instance work.

**Option A — MongoDB Atlas (recommended, no local install)**

Create a free cluster at mongodb.com/atlas, add a database user, and copy
its connection string ("Connect your application" → Node.js driver).

**Option B — Docker Compose** (see `docker-compose.yml`)

```bash
docker compose up -d
# MONGODB_URI=mongodb://localhost:27017/sita_shelters_dev
```

Then, from this directory:

```bash
cp .env.example .env
# Edit .env: MONGODB_URI must point at the database above and include a
# database name. Keep `${MONGODB_PASSWORD}` in its URI template and put the
# newly rotated Atlas password only in MONGODB_PASSWORD.

npm install
npm run db:seed      # loads demo projects/materials/vendors/users, etc.
```

Set `BOOTSTRAP_SUPER_ADMIN_PASSWORD` in `.env` before the first `db:seed` to
create the bootstrap super-admin (`arjun.rao@sitashelters-example.com`). Its
password is bcrypt-hashed before it is stored and is never printed or logged.
Seeding is idempotent — re-running it leaves an existing password untouched.

```bash
npm run dev   # listens on :4000, restarts on file change
```

Point the frontend at it: in `../frontend/.env.local`,
`NEXT_PUBLIC_API_URL=http://localhost:4000`.

## Authentication security

- `/api/auth/login` permits at most 10 requests per IP per minute, applies a
  1s/2s/4s/8s progressive delay to consecutive failures, and locks the
  account for 15 minutes on the fifth failure. The process-local state is
  appropriate for a single API instance; replace it with Redis or Upstash
  before horizontally scaling the API.
- Set `TRUST_PROXY_HOPS` to the exact number of proxies in front of the API
  (or `0` when directly exposed). This keeps forwarded IP headers from being
  spoofed to evade the rate limit.
- Login, registration, and password-reset input is validated with Zod on the
  server. Text is normalized and sanitized; passwords are validated without
  stripping symbols, so the server never changes a chosen secret.
- Passwords use bcrypt at cost 12. A successful login automatically upgrades
  a plaintext, MD5, SHA-1, or lower-cost bcrypt value. Run
  `npm run passwords:migrate` to report migration counts without exposing any
  hashes, addresses, or passwords.
- Password-reset links and account-lock notifications use Resend when
  `PUBLIC_APP_URL`, `RESEND_API_KEY`, and `EMAIL_FROM` are configured. The
  database stores only a SHA-256 fingerprint of a reset token, never the token
  sent in the email.

## Project layout

```text
src/
├── index.js          entrypoint: connect to MongoDB, then listen
├── app.js             Express app: CORS, JSON body parsing, routers
├── config.js           env-derived constants (port, cookie name, allowed origins)
├── permissions.js      hand-synced copy of frontend/src/config/permissions.js
├── db/
│   ├── connection.js    mongoose.connect() wrapper (idempotent, used by server + seed)
│   ├── seed.js           idempotent demo-data seeding
│   ├── models/*.js       Mongoose schemas/models (one file per collection)
│   └── seed-data/*.js    hand-synced copies of frontend/src/lib/mock-data/*.js
├── auth/               password hashing, session token generation/hashing
├── middleware/          requirePermission (role/permission check per route)
├── repositories/        one file per collection (or small tightly-coupled group)
└── routes/               one Express router per domain, mounted in app.js
```

Child records that are always read/written as a single unit with one parent
(indent lines, PO lines/approvals/delivery schedule, GRN lines/approvals,
vendor contacts, a material's approved-vendor list, …) are embedded as
subdocument arrays on the parent document rather than kept in a separate
collection — see the comments atop `db/models/*.js` for which. Collections
that are queried or listed independently of a single parent (users,
projects, indents, purchase orders, supplier quotations, …) stay top-level,
referenced by their string `_id` (human-readable ids like `IND-00001`,
`GRN-00001` — every model overrides `_id` to `String` and callers assign it
explicitly, there's no ObjectId auto-generation in this codebase).

Adding a new persisted domain: define its model in `db/models/`, add a
repository (Mongoose calls, following `repositories/projects.js` as the
reference), add a route file (following `routes/projects.js`), mount it in
`app.js`, and if it needs demo data, add a `seed-data/*.js` file plus a seed
function called from `db/seed.js`'s `runSeed()`.

## Why some things are duplicated from the frontend

`permissions.js` and `db/seed-data/*.js` are hand-synced copies of files in
`../frontend/src/`, not imports across the repo boundary. The two apps are
separately deployed packages with their own `package.json` — real
code-sharing would mean npm workspaces or a published package, which is
overhead this project doesn't need yet at its current size. If either
`../frontend/src/config/permissions.js` or a `../frontend/src/lib/mock-data/*.js`
file changes, update the matching copy here by hand.

## Deploying to Railway

1. **Create a MongoDB Atlas cluster** first (or any MongoDB reachable from
   the internet). Note its connection string.
2. **Create a Railway service** from this repository, with:
   - **Root Directory**: `backend`
   - **Config File Path**: `/backend/railway.json`
   - Railway detects the Node app with Railpack; the committed configuration
     starts `npm start`, waits for `GET /health`, and restarts failed runs.
3. **Environment variables** on the Railway service:
   - `MONGODB_URI` — the Atlas URI template with a database name in the
     path, using `${MONGODB_PASSWORD}` in its password position
   - `MONGODB_PASSWORD` — the newly rotated Atlas database-user password;
     store it only in Railway's encrypted environment-variable settings
   - `FRONTEND_ORIGIN=http://localhost:3000,https://<your-app>.vercel.app`
     — exact origins only; this is a safe fallback for intentional direct
     API calls. The normal Vercel proxy flow is same-origin and needs no
     preview-domain wildcard.
   - `NODE_ENV=production`
   - `PUBLIC_APP_URL=https://<your-app>.vercel.app` — the exact frontend URL
     used for reset links
   - `RESEND_API_KEY` and `EMAIL_FROM` — required for password-reset and
     lockout notification emails
   - `TRUST_PROXY_HOPS=1` — Railway's reverse-proxy hop. Revisit this value
     if the network topology changes.
   - `GMAIL_SMTP_USER`, `GMAIL_SMTP_APP_PASSWORD`, and
     `GMAIL_SMTP_FROM_NAME` only if welcome-email delivery is enabled
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
     `CLOUDINARY_API_SECRET` only if image uploads are enabled
   - `PORT` is set by Railway automatically — don't override it
4. **First deploy**: the app connects to MongoDB at startup
   (`src/index.js` calls `connectDB()` before `app.listen()`) — there's no
   separate migration step, Mongoose creates collections/indexes on first
   write. Seed data does not run automatically — after the first successful
   deploy, run `npm run db:seed` once against the production database
   (Railway's shell, or locally with `MONGODB_URI` pointed at Atlas) to load
   demo projects/materials/vendors. Set
   `BOOTSTRAP_SUPER_ADMIN_PASSWORD` before that seed if a bootstrap account
   is needed; the password is never printed or logged.
5. **Deploy the frontend in Vercel**: set its server-only
   `BACKEND_API_URL` to this Railway service's public HTTPS URL and leave
   `NEXT_PUBLIC_API_URL` unset. See `../frontend/README.md`.

After Railway reports a healthy deployment, verify
`https://<your-railway-service>.up.railway.app/health` returns `{ "ok": true
}` before deploying Vercel. CORS only allows exact origins in
`FRONTEND_ORIGIN`; do not use a wildcard with credentials.

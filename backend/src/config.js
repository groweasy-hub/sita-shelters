export const SESSION_COOKIE_NAME = "sita_shelters_session";
export const PORT = Number(process.env.PORT) || 4000;
export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const IS_PRODUCTION = NODE_ENV === "production";

// Comma-separated list so local dev and an intentional direct Vercel
// frontend request can both be allowed at once. Sourced from .env only —
// no hardcoded fallback host, so an unset value fails closed (no origin is
// allowed) rather than silently defaulting to a dev URL in production.
export const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Password-reset links are always directed to the application, never to the
// API itself. Configure this explicitly when the primary frontend differs
// from the first allowed CORS origin.
export const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL ?? FRONTEND_ORIGINS[0];

// Resend is called through its HTTPS API, so no SMTP dependency or password
// is kept in process. If either is absent, delivery fails safely and is logged
// without logging an address, reset link, credential, or token.
export const RESEND_API_KEY = process.env.RESEND_API_KEY ?? null;
export const EMAIL_FROM = process.env.EMAIL_FROM ?? null;

// New-employee welcome emails (sign-in email + one-time temporary password)
// are sent separately, over Gmail/Google Workspace SMTP with an App
// Password rather than Resend's API — a different mailbox may be the one
// the company wants these coming from.
export const GMAIL_SMTP_USER = process.env.GMAIL_SMTP_USER ?? null;
export const GMAIL_SMTP_APP_PASSWORD =
  process.env.GMAIL_SMTP_APP_PASSWORD ?? null;
export const GMAIL_SMTP_FROM_NAME =
  process.env.GMAIL_SMTP_FROM_NAME ?? "SITA Shelters";

// Image uploads (currently: user profile pictures) go to Cloudinary rather
// than this server's own disk/storage.
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? null;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY ?? null;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ?? null;

const configuredProxyHops = Number.parseInt(
  process.env.TRUST_PROXY_HOPS ?? "0",
  10,
);
// Trusting every forwarded-address header would let a caller spoof an IP and
// evade login rate limiting. Direct connections are the safe local default.
export const TRUST_PROXY_HOPS =
  Number.isInteger(configuredProxyHops) && configuredProxyHops >= 0
    ? configuredProxyHops
    : 0;

/**
 * Kept separate from `session.js` (which imports the server-only
 * `next/headers`) so the API routes that set/clear this cookie can import
 * just the name without pulling a server-only module into their bundle.
 */
export const SESSION_COOKIE_NAME = "sita_shelters_uid";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

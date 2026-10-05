import crypto from "node:crypto";

export function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

/** Only the hash is ever persisted; the raw token exists solely as the cookie value. */
export function hashSessionToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

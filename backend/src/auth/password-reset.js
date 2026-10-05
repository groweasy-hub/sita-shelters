import crypto from "node:crypto";

export const PASSWORD_RESET_TTL_MS = 60 * 60_000;

export function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString("base64url");
}

/** Only this SHA-256 token fingerprint is persisted; the raw token is emailed once. */
export function hashPasswordResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

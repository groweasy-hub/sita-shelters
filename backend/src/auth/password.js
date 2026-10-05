import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const SALT_ROUNDS = 12;
const BCRYPT_HASH_PATTERN = /^\$2[aby]\$(\d{2})\$[./A-Za-z0-9]{53}$/;
const MD5_HASH_PATTERN = /^[a-f0-9]{32}$/i;
const SHA1_HASH_PATTERN = /^[a-f0-9]{40}$/i;

// Used only to keep the login timing path consistent when the account does
// not exist. It is not a real account credential and is never persisted.
export const DUMMY_PASSWORD_HASH =
  "$2b$12$CMTA4QT.VAsqa52XHVmjO.N9omLSh0wZow4k36fApY/K6H/ZL6K7W";

function constantTimeTextEqual(left, right) {
  const leftDigest = crypto.createHash("sha256").update(left).digest();
  const rightDigest = crypto.createHash("sha256").update(right).digest();
  return crypto.timingSafeEqual(leftDigest, rightDigest);
}

function getBcryptRounds(hash) {
  const match = BCRYPT_HASH_PATTERN.exec(hash ?? "");
  return match ? Number(match[1]) : null;
}

function legacyDigestMatches(password, storedHash, algorithm) {
  const candidate = crypto.createHash(algorithm).update(password).digest("hex");
  return constantTimeTextEqual(candidate, storedHash.toLowerCase());
}

export async function hashPassword(password) {
  if (
    typeof password !== "string" ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    throw new Error("Password cannot be stored safely");
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifies bcrypt hashes with bcrypt's constant-time comparator. On a
 * successful legacy (plaintext, MD5, SHA-1, or weak bcrypt) login, returns a
 * replacement bcrypt-12 hash so the caller can persist the upgrade at once.
 */
export async function verifyPasswordAndUpgrade(password, storedHash) {
  if (typeof password !== "string" || typeof storedHash !== "string") {
    return { valid: false, replacementHash: null };
  }

  const rounds = getBcryptRounds(storedHash);
  if (rounds !== null) {
    try {
      const valid = await bcrypt.compare(password, storedHash);
      return {
        valid,
        replacementHash:
          valid && rounds < SALT_ROUNDS ? await hashPassword(password) : null,
      };
    } catch {
      return { valid: false, replacementHash: null };
    }
  }

  let valid = false;
  if (MD5_HASH_PATTERN.test(storedHash)) {
    valid = legacyDigestMatches(password, storedHash, "md5");
  } else if (SHA1_HASH_PATTERN.test(storedHash)) {
    valid = legacyDigestMatches(password, storedHash, "sha1");
  } else {
    // Legacy plaintext values are only compared long enough to replace them
    // with bcrypt after a successful login; never return or log the value.
    valid = constantTimeTextEqual(password, storedHash);
  }

  return {
    valid,
    replacementHash: valid ? await hashPassword(password) : null,
  };
}

export async function verifyPassword(password, storedHash) {
  return (await verifyPasswordAndUpgrade(password, storedHash)).valid;
}

export function passwordValuesMatch(left, right) {
  return constantTimeTextEqual(left, right);
}

export function passwordHashMigrationKind(storedHash) {
  const rounds = getBcryptRounds(storedHash);
  if (rounds !== null) {
    return rounds < SALT_ROUNDS ? "weak-bcrypt" : "current-bcrypt";
  }
  if (MD5_HASH_PATTERN.test(storedHash ?? "")) return "md5";
  if (SHA1_HASH_PATTERN.test(storedHash ?? "")) return "sha1";
  return storedHash ? "plaintext-or-unknown" : "missing";
}

/** A readable one-time password for freshly seeded accounts. */
export function generateTemporaryPassword() {
  return crypto.randomBytes(16).toString("base64url");
}

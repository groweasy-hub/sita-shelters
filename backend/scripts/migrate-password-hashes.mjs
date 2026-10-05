import { passwordHashMigrationKind } from "../src/auth/password.js";
import { connectDB, disconnectDB } from "../src/db/connection.js";
import { User } from "../src/db/models/index.js";

/**
 * Passwords cannot be securely rehashed without their plaintext value. This
 * script reports the accounts that require an opportunistic migration; the
 * login handler verifies the submitted password and immediately replaces a
 * plaintext, MD5, SHA-1, or bcrypt cost below 12 with bcrypt-12.
 *
 * It intentionally reports counts only—never hashes, emails, or passwords.
 */
async function main() {
  await connectDB();
  const rows = await User.find({}, { passwordHash: 1 }).lean();
  const counts = new Map();
  for (const row of rows) {
    const kind = passwordHashMigrationKind(row.passwordHash);
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }

  const summary = Object.fromEntries([...counts.entries()].sort());
  console.log("[password-migration] Hash classifications", summary);
  console.log(
    "[password-migration] Legacy and weak hashes are upgraded after the account's next successful login.",
  );
}

main()
  .catch((error) => {
    console.error("[password-migration] Failed", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });

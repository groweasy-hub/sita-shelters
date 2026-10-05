/**
 * One-off: gives existing accounts their employee details. Seeded accounts get
 * the ids/department/joining date they already hold in the demo directory;
 * anyone else (e.g. users added before employee ids existed) gets the next
 * generated id, EMP-####. Values already set are never changed.
 *
 *   node --env-file=.env scripts/backfill-employee-details.mjs          # dry run
 *   node --env-file=.env scripts/backfill-employee-details.mjs --yes    # apply
 */
import { connectDB, disconnectDB } from "../src/db/connection.js";
import { backfillEmployeeDetails } from "../src/repositories/users.js";

const apply = process.argv.includes("--yes");
await connectDB();
try {
  const changes = await backfillEmployeeDetails({ apply });
  if (changes.length === 0) {
    console.log("Every account already has its employee details.");
  }
  for (const { name, userId, update } of changes) {
    console.log(`${apply ? "updated" : "would update"} ${name} (${userId}): ${JSON.stringify(update)}`);
  }
  if (!apply && changes.length > 0) {
    console.log("\nDry run only. Re-run with --yes to apply.");
  }
} finally {
  await disconnectDB();
}

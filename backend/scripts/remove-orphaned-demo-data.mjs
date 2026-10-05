/**
 * One-off cleanup: removes Material Issues, Consumption records and Returns
 * that point at a project which no longer exists (the old demo data seeded for
 * projects that were later deleted). Records for real projects are never
 * touched.
 *
 *   node --env-file=.env scripts/remove-orphaned-demo-data.mjs          # dry run: lists what would go
 *   node --env-file=.env scripts/remove-orphaned-demo-data.mjs --yes    # actually deletes
 */
import { connectDB, disconnectDB, mongoose } from "../src/db/connection.js";

const COLLECTIONS = ["consumptionrecords", "returns", "materialissues"];
const confirmed = process.argv.includes("--yes");

await connectDB();
try {
  const db = mongoose.connection.db;
  const projectIds = (await db.collection("projects").find({}, { projection: { _id: 1 } }).toArray()).map(
    (project) => project._id,
  );
  console.log(`Real projects (kept): ${projectIds.join(", ") || "none"}`);

  for (const name of COLLECTIONS) {
    const filter = { projectId: { $nin: projectIds } };
    const total = await db.collection(name).countDocuments();
    const orphaned = await db.collection(name).countDocuments(filter);
    if (!confirmed) {
      console.log(`${name.padEnd(20)} ${orphaned} of ${total} would be deleted`);
      continue;
    }
    const result = await db.collection(name).deleteMany(filter);
    console.log(`${name.padEnd(20)} deleted ${result.deletedCount} of ${total}`);
  }
  if (!confirmed) {
    console.log("\nDry run only. Re-run with --yes to delete.");
  }
} finally {
  await disconnectDB();
}

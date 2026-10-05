import { createApp } from "./app.js";
import { PORT } from "./config.js";
import { connectDB } from "./db/connection.js";

async function main() {
  await connectDB();

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`[server] Listening on port ${PORT}`);
  });
}

main().catch((error) => {
  console.error("[server] Failed to start", error);
  process.exit(1);
});

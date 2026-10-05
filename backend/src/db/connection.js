import mongoose from "mongoose";

function resolveMongoUri() {
  const uri = process.env.MONGODB_URI;
  const password = process.env.MONGODB_PASSWORD;

  if (!uri) {
    return null;
  }

  // Keep the URI template safe to store locally: a raw Atlas password is
  // placed only in MONGODB_PASSWORD and encoded before it becomes user-info.
  if (uri.includes("${MONGODB_PASSWORD}")) {
    if (!password) {
      throw new Error("MONGODB_PASSWORD environment variable is required");
    }
    return uri.replaceAll("${MONGODB_PASSWORD}", encodeURIComponent(password));
  }

  return uri;
}

const MONGODB_URI = resolveMongoUri();
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is required");
}

mongoose.set("strictQuery", true);

let connectPromise = null;

/** Idempotent — safe to call from multiple entry points (server boot, seed script). */
export function connectDB() {
  if (!connectPromise) {
    connectPromise = mongoose.connect(MONGODB_URI).then((instance) => {
      console.log(`[db] Connected to MongoDB (${instance.connection.name})`);
      return instance;
    });
  }
  return connectPromise;
}

export async function disconnectDB() {
  connectPromise = null;
  await mongoose.disconnect();
}

export { mongoose };

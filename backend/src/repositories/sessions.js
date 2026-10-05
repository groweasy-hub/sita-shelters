import { Session } from "../db/models/index.js";
import { generateSessionToken, hashSessionToken } from "../auth/session-tokens.js";
import { describeDevice, maskIpAddress } from "../auth/user-agent.js";

const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

/** Creates a session row and returns the raw bearer token to set as a cookie. */
export async function createSession(userId, { userAgent = null, ipAddress = null } = {}) {
  const token = generateSessionToken();
  const id = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

  await Session.create({ _id: id, userId, expiresAt, userAgent, ipAddress });

  return { token, expiresAt, maxAgeSeconds: SESSION_MAX_AGE_MS / 1000 };
}

/** Resolves a bearer token to its session row, or null if missing/expired. */
export async function getSessionByToken(token) {
  if (!token) {
    return null;
  }
  const id = hashSessionToken(token);
  const row = await Session.findById(id).lean();
  if (!row) {
    return null;
  }
  if (row.expiresAt.getTime() <= Date.now()) {
    await Session.deleteOne({ _id: id });
    return null;
  }
  return { id: row._id, userId: row.userId, expiresAt: row.expiresAt };
}

export async function deleteSessionByToken(token) {
  if (!token) {
    return;
  }
  await Session.deleteOne({ _id: hashSessionToken(token) });
}

export async function deleteExpiredSessions() {
  await Session.deleteMany({ expiresAt: { $lte: new Date() } });
}

/** Every unexpired session for a user, newest first, flagged with the one making this request. */
export async function listSessionsByUser(userId, currentToken) {
  const currentId = currentToken ? hashSessionToken(currentToken) : null;
  const rows = await Session.find({ userId, expiresAt: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .lean();
  return rows.map((row) => {
    const device = describeDevice(row.userAgent);
    return {
      id: row._id,
      device: device.label,
      deviceType: device.type,
      ipMasked: maskIpAddress(row.ipAddress),
      signedInAt: row.createdAt.toISOString(),
      current: row._id === currentId,
    };
  });
}

/** Ends one session, but only if it belongs to `userId`. Returns whether a session was removed. */
export async function deleteSessionForUser(userId, sessionId) {
  const result = await Session.deleteOne({ _id: sessionId, userId });
  return result.deletedCount > 0;
}

/** Ends every session for a user, optionally keeping the one identified by `exceptToken`. */
export async function deleteSessionsByUser(userId, { exceptToken = null } = {}) {
  const filter = { userId };
  if (exceptToken) {
    filter._id = { $ne: hashSessionToken(exceptToken) };
  }
  const result = await Session.deleteMany(filter);
  return result.deletedCount;
}

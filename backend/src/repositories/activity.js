import { AuditLog } from "../db/models/index.js";
import { describeDevice, maskIpAddress } from "../auth/user-agent.js";

const ACCOUNT_MODULE = "account";
const HISTORY_WINDOW_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const HISTORY_LIMIT = 200;

/**
 * Records one account event (sign-in, password change, …) for the profile's
 * Activity History. Never throws: a logging failure must not fail the
 * login/logout/update the user actually asked for.
 */
export async function recordAccountActivity(
  userId,
  action,
  { req = null, status = "success", remarks = null } = {},
) {
  try {
    await AuditLog.create({
      _id: crypto.randomUUID(),
      userId,
      module: ACCOUNT_MODULE,
      referenceId: userId,
      action,
      status,
      remarks,
      ipAddress: req?.ip ?? null,
      userAgent: req?.headers?.["user-agent"] ?? null,
    });
  } catch (error) {
    console.error("Account activity log error", error);
  }
}

export async function listAccountActivity(userId) {
  const since = new Date(Date.now() - HISTORY_WINDOW_MS);
  const rows = await AuditLog.find({
    userId,
    module: ACCOUNT_MODULE,
    createdAt: { $gte: since },
  })
    .sort({ createdAt: -1 })
    .limit(HISTORY_LIMIT)
    .lean();

  return rows.map((row) => ({
    id: row._id,
    action: row.action,
    device: describeDevice(row.userAgent).label,
    ipMasked: maskIpAddress(row.ipAddress),
    status: row.status ?? "success",
    remarks: row.remarks ?? null,
    at: row.createdAt.toISOString(),
  }));
}

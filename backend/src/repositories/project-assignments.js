import { ProjectAssignment } from "../db/models/index.js";
import { mongoose } from "../db/connection.js";

export async function listProjectIdsByUser(userId) {
  const rows = await ProjectAssignment.find({ userId }, { projectId: 1 }).lean();
  return rows.map((row) => row.projectId);
}

/** The user's project grants with their access level, e.g. [{ projectId, accessLevel }]. */
export async function listAssignmentsByUser(userId) {
  const rows = await ProjectAssignment.find({ userId }, { projectId: 1, accessLevel: 1 }).lean();
  return rows.map((row) => ({ projectId: row.projectId, accessLevel: row.accessLevel }));
}

export async function listProjectIdsByUsers(userIds) {
  const byUser = new Map(userIds.map((id) => [id, []]));
  if (userIds.length === 0) {
    return byUser;
  }
  const rows = await ProjectAssignment.find(
    { userId: { $in: userIds } },
    { userId: 1, projectId: 1 },
  ).lean();
  for (const row of rows) {
    byUser.get(row.userId)?.push(row.projectId);
  }
  return byUser;
}

/** Replaces every assignment for a user with the given project id list. */
export async function setUserProjectAssignments(
  userId,
  projectIds,
  accessLevel = "operational",
) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await ProjectAssignment.deleteMany({ userId }, { session });
      if (projectIds.length === 0) {
        return;
      }
      await ProjectAssignment.insertMany(
        projectIds.map((projectId) => ({
          _id: crypto.randomUUID(),
          userId,
          projectId,
          accessLevel,
        })),
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
}

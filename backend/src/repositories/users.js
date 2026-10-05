import crypto from "node:crypto";

import { User } from "../db/models/index.js";
import { generateTemporaryPassword, hashPassword } from "../auth/password.js";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
  PASSWORD_RESET_TTL_MS,
} from "../auth/password-reset.js";
import { EMPLOYEE_DETAILS } from "../db/seed-data/employee-details.js";
import {
  listAssignmentsByUser,
  listProjectIdsByUser,
  listProjectIdsByUsers,
  setUserProjectAssignments,
} from "./project-assignments.js";
import { setProjectManager } from "./projects.js";

function mapUser(row) {
  if (!row) {
    return null;
  }
  return {
    id: row._id,
    name: row.name,
    email: row.email,
    username: row.username ?? null,
    role: row.role,
    status: row.status,
    mobile: row.mobile ?? null,
    avatarUrl: row.avatarUrl ?? null,
    employeeId: row.employeeId ?? null,
    department: row.department ?? null,
    reportingManagerId: row.reportingManagerId ?? null,
    joiningDate: row.joiningDate ?? null,
    passwordChangedAt: row.passwordChangedAt
      ? row.passwordChangedAt.toISOString()
      : null,
    lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
  };
}

export async function listUsers() {
  const rows = await User.find().sort({ name: 1 }).lean();
  const projectIdsByUser = await listProjectIdsByUsers(
    rows.map((row) => row._id),
  );
  const nameById = new Map(rows.map((row) => [row._id, row.name]));
  return rows.map((row) => ({
    ...mapUser(row),
    reportingManagerName: nameById.get(row.reportingManagerId) ?? null,
    projectIds: projectIdsByUser.get(row._id) ?? [],
  }));
}

/**
 * Adds what the profile page needs on top of the lean session user: the
 * reporting manager's name and each project grant with its access level.
 * Kept out of `getUserById`, which runs on every authenticated request.
 */
export async function withProfileDetails(user) {
  const [manager, projectAssignments] = await Promise.all([
    user.reportingManagerId
      ? User.findById(user.reportingManagerId, { name: 1 }).lean()
      : null,
    listAssignmentsByUser(user.id),
  ]);
  return {
    ...user,
    reportingManagerName: manager?.name ?? null,
    projectAssignments,
  };
}

export async function getUserById(userId) {
  const row = await User.findById(userId).lean();
  if (!row) {
    return null;
  }
  const projectIds = await listProjectIdsByUser(userId);
  return { ...mapUser(row), projectIds };
}

/** Includes `passwordHash` — for login verification only, never returned to clients. */
export async function getUserByEmailWithCredentials(email) {
  const row = await User.findOne({ email })
    .collation({ locale: "en", strength: 2 })
    .lean();
  if (!row) {
    return null;
  }
  return { ...mapUser(row), passwordHash: row.passwordHash };
}

/** Records a sign-in; a first successful sign-in also turns an invited account active. */
export async function touchLastLogin(userId) {
  await User.updateOne({ _id: userId }, { lastLoginAt: new Date() });
  await User.updateOne(
    { _id: userId, status: "invited" },
    { status: "active" },
  );
}

export async function setPasswordHash(userId, passwordHash) {
  await User.updateOne(
    { _id: userId },
    { passwordHash, passwordChangedAt: new Date() },
  );
}

/** Stores only a reset-token hash; the raw token is returned exactly once for email delivery. */
export async function createPasswordResetToken(userId) {
  const token = generatePasswordResetToken();
  await User.updateOne(
    { _id: userId },
    {
      passwordResetTokenHash: hashPasswordResetToken(token),
      passwordResetExpiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    },
  );
  return token;
}

/** Atomically consumes a reset token so it cannot be replayed in a second request. */
export async function consumePasswordResetToken(token, passwordHash) {
  const row = await User.findOneAndUpdate(
    {
      passwordResetTokenHash: hashPasswordResetToken(token),
      passwordResetExpiresAt: { $gt: new Date() },
    },
    {
      passwordHash,
      passwordChangedAt: new Date(),
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    },
    { new: true },
  ).lean();
  return mapUser(row);
}

/** Self-service edits only — email, role and HR fields stay admin-managed. */
export async function updateOwnProfile(userId, { name, mobile }) {
  await User.updateOne({ _id: userId }, { name, mobile: mobile || null });
  return getUserById(userId);
}

/** The current avatar's Cloudinary public id, if any — needed to delete or replace it there. */
export async function getUserAvatarPublicId(userId) {
  const row = await User.findById(userId, { avatarPublicId: 1 }).lean();
  return row?.avatarPublicId ?? null;
}
export async function setUserAvatar(userId, { url, publicId }) {
  await User.updateOne(
    { _id: userId },
    { avatarUrl: url, avatarPublicId: publicId },
  );
  return getUserById(userId);
}
export async function clearUserAvatar(userId) {
  await User.updateOne(
    { _id: userId },
    { avatarUrl: null, avatarPublicId: null },
  );
  return getUserById(userId);
}

/** Includes `passwordHash` — for re-verifying the current password before a change. */
export async function getUserByIdWithCredentials(userId) {
  const row = await User.findById(userId).lean();
  if (!row) {
    return null;
  }
  return { ...mapUser(row), passwordHash: row.passwordHash };
}

export class DuplicateEmailError extends Error {
  constructor() {
    super("Duplicate account identifier");
    this.name = "DuplicateEmailError";
  }
}

async function nextUserId(name) {
  const slug = name
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
  let candidate = `usr-${slug || "user"}`;
  let suffix = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await User.exists({ _id: candidate })) {
    suffix += 1;
    candidate = `usr-${slug || "user"}-${suffix}`;
  }
  return candidate;
}

export class UnknownReportingManagerError extends Error {
  constructor(managerId) {
    super(`Unknown reporting manager: ${managerId}`);
    this.name = "UnknownReportingManagerError";
  }
}

const EMPLOYEE_ID_PATTERN = /^EMP-(\d+)$/;
const FIRST_EMPLOYEE_NUMBER = 1001;

/**
 * The next free employee id (EMP-1041, EMP-1042, ...): one above the highest
 * in use, counting both what's stored on accounts and the ids the seeded
 * accounts already hold in the demo directory (so those are never reissued
 * before the stored copy is backfilled).
 */
async function nextEmployeeId() {
  const rows = await User.find(
    { employeeId: { $type: "string" } },
    { employeeId: 1 },
  ).lean();
  const numbers = [
    ...rows.map((row) => row.employeeId),
    ...Object.values(EMPLOYEE_DETAILS).map((details) => details.employeeId),
  ]
    .map((id) => Number(EMPLOYEE_ID_PATTERN.exec(id)?.[1]))
    .filter(Number.isFinite);
  const next = Math.max(FIRST_EMPLOYEE_NUMBER - 1, ...numbers) + 1;
  return `EMP-${String(next).padStart(4, "0")}`;
}

/**
 * Creates a new employee account with a one-time temporary password (the
 * only place it's ever visible in plaintext — same pattern as the seed
 * script's bootstrap super-admin), a generated employee id, and assigns them
 * to the given projects. If the role is `project-manager`, every listed
 * project's `projectManagerId` is set to this user — "the manager is
 * assigned at the time of creating the manager" is the whole point of this
 * endpoint existing.
 */
export async function createUser({
  name,
  email,
  role,
  projectIds,
  department,
  reportingManagerId,
  mobile,
  joiningDate,
}) {
  const existing = await User.findOne({ email })
    .collation({ locale: "en", strength: 2 })
    .lean();
  if (existing) {
    throw new DuplicateEmailError();
  }
  if (reportingManagerId && !(await User.exists({ _id: reportingManagerId }))) {
    throw new UnknownReportingManagerError(reportingManagerId);
  }

  const id = await nextUserId(name);
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  // Two people added at the same moment can be offered the same id; the
  // unique index rejects the second, which then simply takes the next one.
  for (let attempt = 1; ; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await User.create({
        _id: id,
        name,
        email,
        role,
        status: "invited",
        passwordHash,
        employeeId: await nextEmployeeId(),
        department,
        reportingManagerId: reportingManagerId || null,
        mobile,
        joiningDate,
      });
      break;
    } catch (error) {
      const clashedOnEmployeeId =
        error?.code === 11000 && error?.keyPattern?.employeeId;
      if (!clashedOnEmployeeId || attempt >= 5) {
        throw error;
      }
    }
  }

  await setUserProjectAssignments(id, projectIds);
  if (role === "project-manager") {
    await Promise.all(
      projectIds.map((projectId) => setProjectManager(projectId, id)),
    );
  }

  return { user: await getUserById(id), temporaryPassword };
}

/**
 * Public registration always has an indistinguishable response for new and
 * duplicate accounts, preventing email or username enumeration. The caller
 * must never return the generated id or account record to an unauthenticated
 * requester.
 */
export async function createSelfRegisteredUser({
  email,
  username,
  displayName,
  passwordHash,
}) {
  // Random ids avoid a pre-insert lookup whose timing could otherwise differ
  // for an existing public username.
  const id = `usr-${crypto.randomUUID()}`;
  try {
    await User.create({
      _id: id,
      name: displayName,
      email,
      username,
      role: "viewer",
      status: "active",
      passwordHash,
    });
    return true;
  } catch (error) {
    // Unique-index races are deliberately indistinguishable from an already
    // registered identifier. Other database errors still reach monitoring.
    if (error?.code === 11000) return false;
    throw error;
  }
}

/**
 * Fills in employee details on accounts that lack them: the seeded accounts
 * get the details they hold in the demo directory; anyone else gets the next
 * generated employee id. Never overwrites a value that's already set.
 * Returns what was (or, unless `apply`, would be) changed.
 */
export async function backfillEmployeeDetails({ apply = false } = {}) {
  const rows = await User.find().sort({ createdAt: 1 }).lean();
  const realUserIds = new Set(rows.map((row) => row._id));
  const changes = [];
  // Counted locally so a dry run shows distinct ids, exactly as a real run assigns.
  let nextNumber = Number(EMPLOYEE_ID_PATTERN.exec(await nextEmployeeId())[1]);
  for (const row of rows) {
    const legacy = EMPLOYEE_DETAILS[row._id] ?? {};
    const update = {};
    for (const field of [
      "employeeId",
      "department",
      "joiningDate",
      "mobile",
      "reportingManagerId",
    ]) {
      if (row[field]) continue;
      const value = legacy[field];
      if (!value) continue;
      if (field === "reportingManagerId" && !realUserIds.has(value)) continue;
      update[field] = value;
    }
    if (!row.employeeId && !update.employeeId) {
      update.employeeId = `EMP-${String(nextNumber).padStart(4, "0")}`;
      nextNumber += 1;
    }
    if (Object.keys(update).length === 0) continue;
    changes.push({ userId: row._id, name: row.name, update });
    if (apply) {
      // eslint-disable-next-line no-await-in-loop
      await User.updateOne({ _id: row._id }, update);
    }
  }
  return changes;
}

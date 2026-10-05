import { Project } from "../db/models/index.js";
import { ROLE_ACCESS_SCOPE } from "../permissions.js";

/** Generates the next sequential SS-001, SS-002, ... code, retrying past any collision. */
async function nextProjectCode() {
  const count = await Project.countDocuments();
  let candidate = `SS-${String(count + 1).padStart(3, "0")}`;
  let suffix = count + 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Project.exists({ code: candidate })) {
    suffix += 1;
    candidate = `SS-${String(suffix).padStart(3, "0")}`;
  }
  return candidate;
}

/** Derives the project id from its name (lowercased, hyphenated), retrying past any collision. */
async function projectIdFromName(name) {
  const slug = name
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
  let candidate = slug || "project";
  let suffix = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Project.exists({ _id: candidate })) {
    suffix += 1;
    candidate = `${slug || "project"}-${suffix}`;
  }
  return candidate;
}

function mapProject(row) {
  if (!row) {
    return null;
  }
  return {
    id: row._id,
    code: row.code,
    name: row.name,
    location: row.city,
    status: row.status,
    projectManagerId: row.projectManagerId,
    startDate: row.startDate,
    estimatedCompletionDate: row.estimatedCompletionDate,
    progressPercent: row.progressPercent,
    description: row.description,
    address: {
      line1: row.addressLine1,
      ...(row.addressLine2 ? { line2: row.addressLine2 } : {}),
      ...(row.landmark ? { landmark: row.landmark } : {}),
      city: row.city,
      state: row.state,
      postalCode: row.postalCode,
      country: row.country,
    },
  };
}

export async function listProjects() {
  const rows = await Project.find().sort({ createdAt: -1, name: 1 }).lean();
  return rows.map(mapProject);
}

/**
 * Projects a user can work against: everything for workspace-wide roles, only
 * their assigned projects for project-scoped roles.
 */
export async function listProjectsForUser(user) {
  if (ROLE_ACCESS_SCOPE[user.role] === "global") {
    return listProjects();
  }
  const rows = await Project.find({ _id: { $in: user.projectIds ?? [] } })
    .sort({ createdAt: -1, name: 1 })
    .lean();
  return rows.map(mapProject);
}

export async function getProject(projectId) {
  const row = await Project.findById(projectId).lean();
  return mapProject(row);
}

export async function createProject(input) {
  const code = await nextProjectCode();
  const id = await projectIdFromName(input.name);
  await Project.create({
    _id: id,
    code,
    name: input.name,
    status: input.status,
    projectManagerId: input.projectManagerId || null,
    startDate: input.startDate,
    estimatedCompletionDate: input.estimatedCompletionDate,
    progressPercent: input.progressPercent,
    description: input.description,
    addressLine1: input.address.line1,
    addressLine2: input.address.line2 || null,
    landmark: input.address.landmark || null,
    city: input.address.city,
    state: input.address.state,
    postalCode: input.address.postalCode,
    country: input.address.country,
  });

  return getProject(id);
}

/** Sets a project's manager — called when a project-manager user is created/assigned against it. */
export async function setProjectManager(projectId, managerId) {
  await Project.updateOne({ _id: projectId }, { projectManagerId: managerId });
}

/** Updates a project's delivery status and completion percentage. */
export async function updateProjectProgress(projectId, { status, progressPercent }) {
  const existing = await Project.exists({ _id: projectId });
  if (!existing) {
    return null;
  }
  await Project.updateOne({ _id: projectId }, { status, progressPercent });
  return getProject(projectId);
}

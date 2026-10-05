import {
  Material,
  MaterialCategory,
  MaterialIssue,
  Project,
  Replacement,
  Return,
  SiteStockBalance,
  User,
} from "../db/models/index.js";
import { adjustSiteStock, confirmPendingReceipt } from "./inventory.js";

export { InsufficientStockError } from "./inventory.js";

export function deriveStatus(issuedQuantity, consumedQuantity, returnedQuantity) {
  if (consumedQuantity === 0 && returnedQuantity === 0) return "issued";
  if (consumedQuantity >= issuedQuantity) return "consumed";
  if (
    consumedQuantity + returnedQuantity >= issuedQuantity &&
    returnedQuantity > 0
  )
    return "returned";
  return "partially-consumed";
}

function mapIssue(row) {
  return {
    id: row._id,
    projectId: row.projectId,
    projectName: row.projectName,
    materialCode: row.materialCode,
    materialName: row.materialName,
    unit: row.unit,
    issuedQuantity: Number(row.issuedQuantity),
    consumedQuantity: Number(row.consumedQuantity),
    returnedQuantity: Number(row.returnedQuantity),
    recipientName: row.recipientName,
    department: row.department,
    purpose: row.purpose,
    workLocation: row.workLocation,
    issuedById: row.issuedById,
    issuedByName: row.issuedByName ?? row.issuedById,
    issuedAt: row.issuedAt.toISOString(),
    status: row.status,
    returns: row.returns ?? [],
  };
}

/**
 * The returns logged against each issue, keyed by issue id, with how much of
 * the damaged part was replaced. Shared by the Material Issues and
 * Consumption reads so both link an issue to what came back.
 */
export async function linkedReturnsByIssue(issueIds) {
  const byIssue = new Map();
  if (issueIds.length === 0) return byIssue;
  const rows = await Return.find({ materialIssueId: { $in: issueIds } })
    .sort({ returnedAt: 1 })
    .lean();
  // Only replacement units that were approved and confirmed into stock count as replaced.
  const receipts = rows.length
    ? await Replacement.find(
        { sourceType: "return", sourceId: { $in: rows.map((row) => row._id) } },
        { sourceId: 1, quantity: 1, stage: 1 },
      ).lean()
    : [];
  const receivedByReturn = new Map();
  for (const receipt of receipts) {
    if ((receipt.stage ?? "received") !== "received") continue;
    receivedByReturn.set(
      receipt.sourceId,
      (receivedByReturn.get(receipt.sourceId) ?? 0) + Number(receipt.quantity),
    );
  }
  for (const row of rows) {
    const list = byIssue.get(row.materialIssueId) ?? [];
    list.push({
      id: row._id,
      returnedQuantity: Number(row.returningQuantity),
      inspectionStatus: row.inspectionStatus,
      damagedQuantity: Number(row.inspectionDamagedQuantity),
      replacedQuantity: receivedByReturn.get(row._id) ?? 0,
      resolutionType: row.resolutionType ?? null,
    });
    byIssue.set(row.materialIssueId, list);
  }
  return byIssue;
}

async function withNames(rows) {
  const projectIds = [...new Set(rows.map((row) => row.projectId))];
  const userIds = [...new Set(rows.map((row) => row.issuedById))];
  const [projectRows, userRows, returnsByIssue] = await Promise.all([
    projectIds.length
      ? Project.find({ _id: { $in: projectIds } }, { name: 1 }).lean()
      : Promise.resolve([]),
    userIds.length
      ? User.find({ _id: { $in: userIds } }, { name: 1 }).lean()
      : Promise.resolve([]),
    linkedReturnsByIssue(rows.map((row) => row._id)),
  ]);
  const projectNames = new Map(projectRows.map((row) => [row._id, row.name]));
  const userNames = new Map(userRows.map((row) => [row._id, row.name]));
  return rows.map((row) => ({
    ...row,
    projectName: projectNames.get(row.projectId) ?? row.projectId,
    issuedByName: userNames.get(row.issuedById) ?? row.issuedById,
    returns: returnsByIssue.get(row._id) ?? [],
  }));
}

export async function listAllMaterialIssues() {
  const rows = await MaterialIssue.find().sort({ issuedAt: -1 }).lean();
  return (await withNames(rows)).map(mapIssue);
}

/**
 * Issues with material still outstanding — issued, but not yet marked consumed
 * (or returned). These are the ones waiting for the Site Engineer / Project
 * Manager's "Consumed", oldest first.
 */
export async function listOutstandingMaterialIssues() {
  const rows = await MaterialIssue.find({
    $expr: {
      $gt: [
        { $subtract: [{ $subtract: ["$issuedQuantity", "$consumedQuantity"] }, "$returnedQuantity"] },
        1e-6,
      ],
    },
  })
    .sort({ issuedAt: 1 })
    .lean();
  return (await withNames(rows)).map(mapIssue);
}

export async function getMaterialIssue(issueId) {
  const row = await MaterialIssue.findById(issueId).lean();
  if (!row) return null;
  const [withName] = await withNames([row]);
  return mapIssue(withName);
}

/** Raw row (no name joins) for internal use by the Consumption/Returns repositories. */
export async function getMaterialIssueRow(issueId) {
  return MaterialIssue.findById(issueId).lean();
}

export function outstandingQuantity(row) {
  return (
    Number(row.issuedQuantity) -
    Number(row.consumedQuantity) -
    Number(row.returnedQuantity)
  );
}

/**
 * Applies a delta to a material issue's running consumed/returned totals and
 * recomputes its status. Used by the Consumption and Returns repositories so
 * `material_issues` stays the single source of truth for how much of an
 * issue remains outstanding.
 */
export async function applyIssueDelta(
  issueId,
  { consumedDelta = 0, returnedDelta = 0 },
) {
  const row = await getMaterialIssueRow(issueId);
  if (!row) return null;
  const consumedQuantity = Number(row.consumedQuantity) + consumedDelta;
  const returnedQuantity = Number(row.returnedQuantity) + returnedDelta;
  const status = deriveStatus(
    Number(row.issuedQuantity),
    consumedQuantity,
    returnedQuantity,
  );
  await MaterialIssue.updateOne(
    { _id: issueId },
    { consumedQuantity, returnedQuantity, status },
  );
  return { ...row, consumedQuantity, returnedQuantity, status };
}

async function nextId() {
  const count = await MaterialIssue.countDocuments();
  return `ISS-${String(count + 1).padStart(5, "0")}`;
}

export class UnknownProjectError extends Error {
  constructor(projectId) {
    super(`Unknown project: ${projectId}`);
    this.name = "UnknownProjectError";
  }
}
export class UnknownMaterialError extends Error {
  constructor(materialCode) {
    super(`Unknown material code: ${materialCode}`);
    this.name = "UnknownMaterialError";
  }
}

/**
 * Issues material from site stock to a work team. Deducts the issued
 * quantity from the project's available stock immediately — consumption
 * and returns, recorded later against this issue, never touch site stock
 * again (see `consumption.js`/`returns.js`).
 *
 * May draw on stock that's been posted but not yet formally confirmed by
 * the Store Manager (`pendingReceiptQuantity`): the Store Manager creating
 * the issue is itself the acknowledgement that the goods are on hand, so
 * waiting on a separate confirm-receipt click first isn't required. Just
 * enough of the pending amount is confirmed to cover the shortfall before
 * the issue is deducted; the rest, if any, stays pending for later.
 */
export async function createMaterialIssue({
  projectId,
  materialCode,
  issuedQuantity,
  recipientName,
  purpose,
  workLocation,
  issuedById,
}) {
  const project = await Project.findById(projectId, { _id: 1 }).lean();
  if (!project) {
    throw new UnknownProjectError(projectId);
  }

  const material = await Material.findOne(
    { code: materialCode },
    { name: 1, unit: 1, categoryId: 1 },
  ).lean();
  if (!material) {
    throw new UnknownMaterialError(materialCode);
  }
  const category = await MaterialCategory.findById(material.categoryId, { name: 1 }).lean();
  const categoryLabel = category?.name ?? "Uncategorised";

  const id = await nextId();
  const issuedAt = new Date();

  const balance = await SiteStockBalance.findOne(
    { projectId, materialCode },
    { availableQuantity: 1 },
  ).lean();
  const shortfall = issuedQuantity - Number(balance?.availableQuantity ?? 0);
  if (shortfall > 1e-6) {
    await confirmPendingReceipt({
      projectId,
      materialCode,
      materialName: material.name,
      category: categoryLabel,
      unit: material.unit,
      quantity: shortfall,
      referenceId: id,
    });
  }

  // Throws InsufficientStockError if available + pending still isn't enough.
  await adjustSiteStock({
    projectId,
    materialCode,
    materialName: material.name,
    category: categoryLabel,
    unit: material.unit,
    delta: -issuedQuantity,
    movementType: "issue",
    referenceId: id,
  });

  await MaterialIssue.create({
    _id: id,
    projectId,
    materialCode,
    materialName: material.name,
    unit: material.unit,
    issuedQuantity,
    consumedQuantity: 0,
    returnedQuantity: 0,
    recipientName,
    department: material.categoryId,
    purpose,
    workLocation,
    issuedById,
    issuedAt,
    status: "issued",
  });

  return getMaterialIssue(id);
}

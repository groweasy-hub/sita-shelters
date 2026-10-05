import {
  ConsumptionRecord,
  Material,
  MaterialCategory,
  MaterialIssue,
  Project,
  User,
} from "../db/models/index.js";
import { adjustSiteStock } from "./inventory.js";
import {
  applyIssueDelta,
  createMaterialIssue,
  deriveStatus,
  getMaterialIssueRow,
  linkedReturnsByIssue,
  outstandingQuantity,
} from "./material-issues.js";

export { InsufficientStockError, UnknownMaterialError, UnknownProjectError } from "./material-issues.js";

function mapEntry(row) {
  return {
    id: row._id,
    materialIssueId: row.materialIssueId,
    projectId: row.projectId,
    projectName: row.projectName,
    materialCode: row.materialCode,
    materialName: row.materialName,
    categoryId: row.categoryId,
    category: row.category,
    unit: row.unit,
    quantityConsumed: Number(row.quantityConsumed),
    activity: row.activity,
    location: row.location,
    recordedById: row.recordedById,
    recordedByName: row.recordedByName ?? row.recordedById,
    consumedAt: row.consumedAt.toISOString(),
    issue: row.issue ?? null,
    returns: row.returns ?? [],
  };
}

/**
 * `consumption_records` only stores `categoryId` (the material's top-level
 * category, used for filtering); the human-readable subcategory label shown
 * in the table is resolved here from the material master each read, the
 * same way the mock adapter derived it from `getSubcategoryName`.
 *
 * Each entry also carries its parent issue's running totals and the returns
 * logged against that issue (with any replacement quantity), so the
 * Consumption page can show what came back — or was replaced — alongside
 * what was used.
 */
async function withDisplayFields(rows) {
  const projectIds = [...new Set(rows.map((row) => row.projectId))];
  const userIds = [...new Set(rows.map((row) => row.recordedById))];
  const materialCodes = [...new Set(rows.map((row) => row.materialCode))];
  const issueIds = [...new Set(rows.map((row) => row.materialIssueId))];
  const [projectRows, userRows, materialRows, issueRows, returnsByIssue] = await Promise.all([
    projectIds.length
      ? Project.find({ _id: { $in: projectIds } }, { name: 1 }).lean()
      : Promise.resolve([]),
    userIds.length
      ? User.find({ _id: { $in: userIds } }, { name: 1 }).lean()
      : Promise.resolve([]),
    materialCodes.length
      ? Material.find({ code: { $in: materialCodes } }, { code: 1, subcategoryId: 1 }).lean()
      : Promise.resolve([]),
    issueIds.length
      ? MaterialIssue.find(
          { _id: { $in: issueIds } },
          { issuedQuantity: 1, consumedQuantity: 1, returnedQuantity: 1, status: 1 },
        ).lean()
      : Promise.resolve([]),
    linkedReturnsByIssue(issueIds),
  ]);
  const issuesById = new Map(issueRows.map((row) => [row._id, row]));
  const projectNames = new Map(projectRows.map((row) => [row._id, row.name]));
  const userNames = new Map(userRows.map((row) => [row._id, row.name]));
  const subcategoryByCode = new Map(materialRows.map((row) => [row.code, row.subcategoryId]));
  const subcategoryIds = [...new Set(materialRows.map((row) => row.subcategoryId))];
  const categoryRows = subcategoryIds.length
    ? await MaterialCategory.find({ _id: { $in: subcategoryIds } }, { name: 1 }).lean()
    : [];
  const categoryNames = new Map(categoryRows.map((row) => [row._id, row.name]));

  return rows.map((row) => {
    const subcategoryId = subcategoryByCode.get(row.materialCode);
    const issue = issuesById.get(row.materialIssueId);
    return {
      ...row,
      projectName: projectNames.get(row.projectId) ?? row.projectId,
      recordedByName: userNames.get(row.recordedById) ?? row.recordedById,
      category: categoryNames.get(subcategoryId) ?? row.categoryId,
      issue: issue
        ? {
            issuedQuantity: Number(issue.issuedQuantity),
            consumedQuantity: Number(issue.consumedQuantity),
            returnedQuantity: Number(issue.returnedQuantity),
            outstandingQuantity: outstandingQuantity(issue),
            status: issue.status,
          }
        : null,
      returns: returnsByIssue.get(row.materialIssueId) ?? [],
    };
  });
}

export async function listAllConsumptionRecords() {
  const rows = await ConsumptionRecord.find().sort({ consumedAt: -1 }).lean();
  return (await withDisplayFields(rows)).map(mapEntry);
}

async function nextId() {
  const count = await ConsumptionRecord.countDocuments();
  return `CON-${String(count + 1).padStart(5, "0")}`;
}

export class UnknownMaterialIssueError extends Error {
  constructor(issueId) {
    super(`Unknown material issue: ${issueId}`);
    this.name = "UnknownMaterialIssueError";
  }
}
export class ExcessQuantityError extends Error {
  constructor(message) {
    super(message);
    this.name = "ExcessQuantityError";
  }
}

/**
 * Records how much of an already-issued quantity a work team used. Never
 * touches site stock — the material already left the store at issue time
 * (see `material-issues.js`); this is bookkeeping against that issue.
 */
export async function createConsumptionRecord({
  materialIssueId,
  quantityConsumed,
  activity,
  location,
  recordedById,
}) {
  const issue = await getMaterialIssueRow(materialIssueId);
  if (!issue) {
    throw new UnknownMaterialIssueError(materialIssueId);
  }
  if (quantityConsumed > outstandingQuantity(issue) + 1e-6) {
    throw new ExcessQuantityError(
      "Quantity consumed cannot exceed the issue's outstanding quantity",
    );
  }

  const id = await nextId();
  await ConsumptionRecord.create({
    _id: id,
    materialIssueId,
    projectId: issue.projectId,
    materialCode: issue.materialCode,
    materialName: issue.materialName,
    categoryId: issue.department,
    unit: issue.unit,
    quantityConsumed,
    activity,
    location,
    recordedById,
    consumedAt: new Date(),
  });

  await applyIssueDelta(materialIssueId, { consumedDelta: quantityConsumed });

  const row = await ConsumptionRecord.findById(id).lean();
  const [withDisplay] = await withDisplayFields([row]);
  return mapEntry(withDisplay);
}

/**
 * Records stock used straight from a site's store, without a prior issue.
 * The stock leaves the store now, so it is booked as a material issue to the
 * person recording it (purpose = the activity) and immediately consumed in
 * full — which keeps the issue, ledger and consumption records consistent and
 * traceable, exactly as if the two steps had been done back to back.
 *
 * Throws InsufficientStockError when the site doesn't hold that much.
 */
export async function recordDirectUsage({
  projectId,
  materialCode,
  quantityConsumed,
  activity,
  location,
  recordedById,
  recordedByName,
}) {
  const issue = await createMaterialIssue({
    projectId,
    materialCode,
    issuedQuantity: quantityConsumed,
    recipientName: recordedByName,
    purpose: activity,
    workLocation: location,
    issuedById: recordedById,
  });
  try {
    return await createConsumptionRecord({
      materialIssueId: issue.id,
      quantityConsumed,
      activity,
      location,
      recordedById,
    });
  } catch (error) {
    // Put the stock back and drop the half-made issue rather than leave it stuck outstanding.
    await adjustSiteStock({
      projectId,
      materialCode,
      materialName: issue.materialName,
      category: "Uncategorised",
      unit: issue.unit,
      delta: quantityConsumed,
      movementType: "return",
      referenceId: issue.id,
    });
    await MaterialIssue.deleteOne({ _id: issue.id });
    throw error;
  }
}

export class IssueNotOutstandingError extends Error {
  constructor(message) {
    super(message);
    this.name = "IssueNotOutstandingError";
  }
}

/**
 * The Site Engineer's / Project Manager's "Consumed" click on an issued
 * material. The consumption request goes to both, and whoever confirms first
 * updates the issue for everyone: by default the whole outstanding quantity
 * (or a smaller quantity, leaving the rest awaiting confirmation). The
 * activity and location are the ones the store manager gave when issuing.
 *
 * The quantity is claimed against the issue in one atomic update, so two
 * people clicking at the same moment can't consume more than was issued.
 */
export async function confirmIssueConsumption({ materialIssueId, quantity, recordedById }) {
  const issue = await getMaterialIssueRow(materialIssueId);
  if (!issue) {
    throw new UnknownMaterialIssueError(materialIssueId);
  }
  const outstanding = outstandingQuantity(issue);
  if (!(outstanding > 1e-6)) {
    throw new IssueNotOutstandingError("This issue has already been marked as consumed");
  }
  const consumed = quantity ?? outstanding;
  if (!(consumed > 0)) {
    throw new ExcessQuantityError("Quantity must be greater than zero");
  }
  if (consumed > outstanding + 1e-6) {
    throw new ExcessQuantityError(
      `Only ${outstanding} ${issue.unit} of this issue is still outstanding`,
    );
  }

  const claimed = await MaterialIssue.findOneAndUpdate(
    {
      _id: materialIssueId,
      $expr: {
        $lte: [
          { $add: ["$consumedQuantity", "$returnedQuantity", consumed] },
          { $add: ["$issuedQuantity", 1e-6] },
        ],
      },
    },
    { $inc: { consumedQuantity: consumed } },
  ).lean();
  if (!claimed) {
    throw new IssueNotOutstandingError(
      "Someone else has just updated this issue — reload to see what is left",
    );
  }

  const id = await nextId();
  try {
    await ConsumptionRecord.create({
      _id: id,
      materialIssueId,
      projectId: issue.projectId,
      materialCode: issue.materialCode,
      materialName: issue.materialName,
      categoryId: issue.department,
      unit: issue.unit,
      quantityConsumed: consumed,
      activity: issue.purpose,
      location: issue.workLocation,
      recordedById,
      consumedAt: new Date(),
    });
  } catch (error) {
    await MaterialIssue.updateOne({ _id: materialIssueId }, { $inc: { consumedQuantity: -consumed } });
    throw error;
  }
  await MaterialIssue.updateOne(
    { _id: materialIssueId },
    {
      status: deriveStatus(
        Number(issue.issuedQuantity),
        Number(issue.consumedQuantity) + consumed,
        Number(issue.returnedQuantity),
      ),
    },
  );

  const row = await ConsumptionRecord.findById(id).lean();
  const [withDisplay] = await withDisplayFields([row]);
  return mapEntry(withDisplay);
}

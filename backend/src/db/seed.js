import { hashPassword } from "../auth/password.js";
import { backfillEmployeeDetails } from "../repositories/users.js";
import { connectDB, disconnectDB } from "./connection.js";
import {
  ConsumptionRecord,
  Material,
  MaterialCategory,
  MaterialIssue,
  ProjectAssignment,
  Project,
  Return,
  Uom,
  User,
  Vendor,
} from "./models/index.js";
import { CONSUMPTION_SEEDS } from "./seed-data/consumption.js";
import { MATERIAL_CATEGORY_TREE } from "./seed-data/material-categories.js";
import { MATERIAL_ISSUE_SEEDS } from "./seed-data/material-issues.js";
import { MATERIALS } from "./seed-data/materials.js";
import { PROJECTS } from "./seed-data/projects.js";
import { RETURN_SEEDS } from "./seed-data/returns.js";
import { UOMS } from "./seed-data/uoms.js";
import { BOOTSTRAP_SUPER_ADMIN_ID, USERS } from "./seed-data/users.js";
import { PILOT_LOGIN_USER_IDS } from "./seed-data/pilot-logins.js";
import { VENDORS } from "./seed-data/vendors.js";

/** Inserts each doc only if its `_id` doesn't already exist — same "leave existing rows alone" semantics as Postgres's `onConflictDoNothing`. */
async function seedInsertMany(Model, docs) {
  if (docs.length === 0) return;
  await Model.bulkWrite(
    docs.map((doc) => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $setOnInsert: doc },
        upsert: true,
      },
    })),
    { ordered: false },
  );
}

async function seedUsers() {
  await seedInsertMany(
    User,
    USERS.map((user) => ({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: "active",
    })),
  );
}

async function seedProjects() {
  await seedInsertMany(
    Project,
    PROJECTS.map((project) => ({
      _id: project.id,
      code: project.code,
      name: project.name,
      status: project.status,
      projectManagerId: project.projectManagerId,
      startDate: project.startDate,
      estimatedCompletionDate: project.estimatedCompletionDate,
      progressPercent: project.progressPercent,
      description: project.description,
      addressLine1: project.address.line1,
      addressLine2: project.address.line2 ?? null,
      landmark: project.address.landmark ?? null,
      city: project.address.city,
      state: project.address.state,
      postalCode: project.address.postalCode,
      country: project.address.country,
    })),
  );
}

async function seedProjectAssignments() {
  const rows = USERS.flatMap((user) =>
    (user.projectIds ?? []).map((projectId) => ({
      // Deterministic so re-seeding never creates a duplicate assignment
      // for the same user+project pair.
      _id: `${user.id}::${projectId}`,
      userId: user.id,
      projectId,
      accessLevel: "operational",
    })),
  );
  await seedInsertMany(ProjectAssignment, rows);
}

async function seedMaterialCategories() {
  const rows = MATERIAL_CATEGORY_TREE.flatMap((category) => [
    { _id: category.id, parentId: null, name: category.name },
    ...category.subcategories.map((subcategory) => ({
      _id: subcategory.id,
      parentId: category.id,
      name: subcategory.name,
    })),
  ]);
  await seedInsertMany(MaterialCategory, rows);
}

async function seedUoms() {
  await seedInsertMany(
    Uom,
    UOMS.map((uom) => ({ _id: uom.id, code: uom.code, name: uom.name })),
  );
}

async function seedMaterials() {
  await seedInsertMany(
    Material,
    MATERIALS.map((material) => ({
      _id: material.id,
      code: material.code,
      name: material.name,
      categoryId: material.category,
      subcategoryId: material.subcategory,
      unit: material.unit,
      specification: material.specification ?? null,
      reorderLevel: material.reorderLevel,
      lastPurchasePrice: material.lastPurchasePrice,
      status: material.status ?? "active",
      approvedVendorIds: material.approvedVendorIds ?? [],
    })),
  );
}

async function seedVendors() {
  await seedInsertMany(
    Vendor,
    VENDORS.map((vendor) => ({
      _id: vendor.id,
      code: vendor.code,
      name: vendor.name,
      type: vendor.type,
      gstNumber: vendor.gstNumber,
      address: vendor.address,
      rating: vendor.rating,
      deliveryPerformance: vendor.deliveryPerformance,
      qualityAcceptanceRate: vendor.qualityAcceptanceRate,
      rejectionRate: vendor.rejectionRate,
      priceCompetitiveness: vendor.priceCompetitiveness,
      status: vendor.status,
      contacts: vendor.contacts ?? [],
      materialCategories: vendor.materialCategories ?? [],
    })),
  );
}

function addDays(isoDate, days) {
  const date = new Date(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}
const materialByCode = new Map(
  MATERIALS.map((material) => [material.code, material]),
);
const issueSeedById = new Map(
  MATERIAL_ISSUE_SEEDS.map((seed) => [seed.id, seed]),
);

function deriveIssueStatus(issuedQuantity, consumedQuantity, returnedQuantity) {
  if (consumedQuantity === 0 && returnedQuantity === 0) return "issued";
  if (consumedQuantity >= issuedQuantity) return "consumed";
  if (
    consumedQuantity + returnedQuantity >= issuedQuantity &&
    returnedQuantity > 0
  )
    return "returned";
  return "partially-consumed";
}

async function seedMaterialIssues() {
  await seedInsertMany(
    MaterialIssue,
    MATERIAL_ISSUE_SEEDS.map((seed) => {
      const material = materialByCode.get(seed.materialCode);
      return {
        _id: seed.id,
        projectId: seed.projectId,
        materialCode: seed.materialCode,
        materialName: material?.name ?? seed.materialCode,
        unit: material?.unit ?? "",
        issuedQuantity: seed.issuedQuantity,
        consumedQuantity: seed.consumedQuantity,
        returnedQuantity: seed.returnedQuantity,
        recipientName: seed.recipientName,
        department: material?.category ?? "civil",
        purpose: seed.purpose,
        workLocation: seed.workLocation,
        issuedById: seed.issuedById,
        issuedAt: new Date(seed.issuedAt),
        status: deriveIssueStatus(
          seed.issuedQuantity,
          seed.consumedQuantity,
          seed.returnedQuantity,
        ),
      };
    }),
  );
}

async function seedConsumptionRecords() {
  await seedInsertMany(
    ConsumptionRecord,
    CONSUMPTION_SEEDS.map((seed) => {
      const issue = issueSeedById.get(seed.materialIssueId);
      const material = issue ? materialByCode.get(issue.materialCode) : null;
      return {
        _id: seed.id,
        materialIssueId: seed.materialIssueId,
        projectId: issue?.projectId ?? "",
        materialCode: issue?.materialCode ?? "",
        materialName: material?.name ?? issue?.materialCode ?? "",
        categoryId: material?.category ?? "civil",
        unit: material?.unit ?? "",
        quantityConsumed: seed.quantityConsumed,
        activity: seed.activity,
        location: seed.location,
        recordedById: seed.recordedById,
        consumedAt: addDays(
          issue?.issuedAt ?? "2026-01-01T00:00:00.000Z",
          seed.consumedAtOffsetDays,
        ),
      };
    }),
  );
}

async function seedReturns() {
  await seedInsertMany(
    Return,
    RETURN_SEEDS.map((seed) => {
      const issue = issueSeedById.get(seed.materialIssueId);
      const material = issue ? materialByCode.get(issue.materialCode) : null;
      return {
        _id: seed.id,
        materialIssueId: seed.materialIssueId,
        projectId: issue?.projectId ?? "",
        materialCode: issue?.materialCode ?? "",
        materialName: material?.name ?? issue?.materialCode ?? "",
        unit: material?.unit ?? "",
        returningQuantity: seed.returningQuantity,
        reason: seed.reason,
        returnedById: seed.returnedById,
        returnedAt: addDays(
          issue?.issuedAt ?? "2026-01-01T00:00:00.000Z",
          seed.returnedAtOffsetDays,
        ),
        inspectionStatus: seed.inspection.status,
        inspectionGoodQuantity: seed.inspection.goodQuantity,
        inspectionDamagedQuantity: seed.inspection.damagedQuantity,
        inspectionById: seed.inspection.inspectedById,
        inspectionAt:
          seed.inspection.inspectedAtOffsetDays === null
            ? null
            : addDays(
                issue?.issuedAt ?? "2026-01-01T00:00:00.000Z",
                seed.inspection.inspectedAtOffsetDays,
              ),
        inspectionRemarks: seed.inspection.remarks,
      };
    }),
  );
}

async function seedBootstrapSuperAdmin() {
  const row = await User.findById(BOOTSTRAP_SUPER_ADMIN_ID, {
    passwordHash: 1,
  }).lean();
  if (!row || row.passwordHash) {
    return;
  }
  const bootstrapPassword = process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD;
  if (!bootstrapPassword) {
    console.warn(
      "[seed] Bootstrap super-admin has no password. Set BOOTSTRAP_SUPER_ADMIN_PASSWORD and rerun the seed.",
    );
    return;
  }
  const passwordHash = await hashPassword(bootstrapPassword);
  await User.updateOne({ _id: row._id }, { passwordHash });

  const bootstrapEmail = USERS.find(
    (u) => u.id === BOOTSTRAP_SUPER_ADMIN_ID,
  )?.email;
  console.log(`[seed] Bootstrap super-admin ready for ${bootstrapEmail}.`);
}

async function seedPilotLogins() {
  const password = process.env.PILOT_LOGIN_PASSWORD;
  if (!password) {
    console.warn(
      "[seed] PILOT_LOGIN_PASSWORD not set — skipping fixed pilot demo credentials (see backend/.env.example).",
    );
    return;
  }
  const passwordHash = await hashPassword(password);
  await User.updateMany(
    { _id: { $in: PILOT_LOGIN_USER_IDS } },
    { passwordHash },
  );
  console.log(
    `[seed] Pilot demo credentials set for ${PILOT_LOGIN_USER_IDS.length} accounts — see backend/.env for the email/password list.`,
  );
}

export async function runSeed() {
  await seedUsers();
  await backfillEmployeeDetails({ apply: true });
  await seedProjects();
  await seedProjectAssignments();
  await seedMaterialCategories();
  await seedUoms();
  await seedMaterials();
  await seedVendors();
  await seedMaterialIssues();
  await seedConsumptionRecords();
  await seedReturns();
  await seedPilotLogins();
  await seedBootstrapSuperAdmin();
}

const isMain = process.argv[1]?.endsWith("seed.js");
if (isMain) {
  connectDB()
    .then(runSeed)
    .then(() => {
      console.log("[seed] Done");
      return disconnectDB();
    })
    .catch((error) => {
      console.error("[seed] Failed", error);
      process.exitCode = 1;
      return disconnectDB();
    });
}

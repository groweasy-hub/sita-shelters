import {
  Grn,
  Indent,
  Material,
  ProcurementRequest,
  Project,
  ProjectAssignment,
  PurchaseOrder,
  QcInspection,
  SupplierQuotation,
  User,
} from "../db/models/index.js";
import { findOrCreateMaterialFromIndent } from "./materials.js";

function toContact(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile ?? null,
    role: user.role,
  };
}
function dedupeContacts(contacts) {
  return [...new Map(contacts.map((contact) => [contact.id, contact])).values()];
}

/**
 * Everyone (project-manager, however many project-heads) tied to a project,
 * by name and contact details — the pool `resolveContacts` filters by role
 * for each pipeline stage below. Project Manager is a single named person
 * (`Project.projectManagerId`); every other project-scoped role is only
 * tracked as project-assignment membership, so there may be several people,
 * or none, holding it on a given project.
 */
async function projectScopedContacts(projectId) {
  const [project, assignments] = await Promise.all([
    Project.findById(projectId, { projectManagerId: 1 }).lean(),
    ProjectAssignment.find({ projectId }, { userId: 1 }).lean(),
  ]);
  const candidateIds = new Set(assignments.map((row) => row.userId));
  if (project?.projectManagerId) {
    candidateIds.add(project.projectManagerId);
  }
  if (candidateIds.size === 0) {
    return [];
  }
  const users = await User.find(
    { _id: { $in: [...candidateIds] } },
    { name: 1, email: 1, mobile: 1, role: 1 },
  ).lean();
  return users.map(toContact);
}
function resolveContacts(contacts, roles) {
  return contacts.filter((contact) => roles.includes(contact.role));
}
/** Portfolio-wide roles (e.g. HQ Procurement Head) aren't tied to one project — every holder is a valid contact. */
async function globalRoleContacts(roles) {
  const users = await User.find(
    { role: { $in: roles } },
    { name: 1, email: 1, mobile: 1, role: 1 },
  ).lean();
  return users.map(toContact);
}

function mapIndent(row) {
  return {
    id: row._id,
    projectId: row.projectId,
    projectName: row.projectName,
    requestedById: row.requestedById,
    requestedByName: row.requestedByName ?? row.requestedById,
    requestedByRole: row.requestedByRole ?? null,
    priority: row.priority,
    status: row.status,
    requiredDate: row.requiredDate,
    purpose: row.purpose,
    workLocation: row.workLocation,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    hasProcurementRequest: row.hasProcurementRequest,
    lines: row.lines.map((line) => ({
      materialCode: line.materialCode,
      materialName: line.materialName,
      unit: line.unit,
      requestedQuantity: Number(line.requestedQuantity),
      approvedQuantity: line.approvedQuantity === null ? null : Number(line.approvedQuantity),
    })),
  };
}

/** Adds the display names the UI shows in place of raw project/user ids. */
async function withDisplayNames(rows) {
  const projectIds = [...new Set(rows.map((row) => row.projectId))];
  const userIds = [...new Set(rows.map((row) => row.requestedById))];
  const [projectRows, userRows] = await Promise.all([
    projectIds.length
      ? Project.find({ _id: { $in: projectIds } }, { name: 1 }).lean()
      : [],
    userIds.length
      ? User.find({ _id: { $in: userIds } }, { name: 1, role: 1 }).lean()
      : [],
  ]);
  const projectNames = new Map(projectRows.map((row) => [row._id, row.name]));
  const users = new Map(userRows.map((row) => [row._id, row]));
  return rows.map((row) => ({
    ...row,
    projectName: projectNames.get(row.projectId) ?? row.projectId,
    requestedByName: users.get(row.requestedById)?.name ?? row.requestedById,
    requestedByRole: users.get(row.requestedById)?.role ?? null,
  }));
}

export async function listAllIndents() {
  const rows = await Indent.find().sort({ createdAt: -1 }).lean();
  return (await withDisplayNames(rows)).map(mapIndent);
}

/**
 * Where this indent's overall pipeline is actually stuck right now, and who
 * can move it — not just the indent-approval step, but every stage after
 * it too (procurement raising the PO, PO approval/release, delivery, the
 * GRN engineer/manager/store-confirmation chain). Walks the same chain as
 * `getIndentTimeline`, stopping at the first thing that isn't done yet.
 */
async function getIndentWaitingOn(indentRow) {
  const empty = { stage: null, label: null, approvers: [] };
  if (indentRow.status === "rejected") {
    return { stage: "rejected", label: "Rejected", approvers: [] };
  }
  if (indentRow.status === "draft") {
    return { stage: "draft", label: "Not yet submitted", approvers: [] };
  }
  if (indentRow.status === "completed") {
    return {
      stage: "completed",
      label: "Completed — material confirmed into store",
      approvers: [],
    };
  }
  if (indentRow.status === "submitted" || indentRow.status === "under-review") {
    const contacts = await projectScopedContacts(indentRow.projectId);
    return {
      stage: "indent-approval",
      label: "Waiting for indent approval",
      approvers: resolveContacts(contacts, ["project-manager", "project-head"]),
    };
  }

  // From here status is "approved" or "partially-fulfilled" — sent to
  // procurement. Find the first unfinished thing downstream of that.
  const purchaseOrders = await PurchaseOrder.find({ sourceIndentId: indentRow._id }).lean();
  const activeOrders = purchaseOrders.filter(
    (order) => order.status !== "cancelled" && order.status !== "rejected",
  );

  if (activeOrders.length === 0) {
    const contacts = await projectScopedContacts(indentRow.projectId);
    const procurementContacts = await globalRoleContacts(["procurement-manager"]);
    return {
      stage: "awaiting-purchase-order",
      label: "Waiting for vendor quotations & purchase order creation",
      approvers: dedupeContacts([
        ...resolveContacts(contacts, ["project-manager", "project-head"]),
        ...procurementContacts,
      ]),
    };
  }

  const orderNeedingApproval = activeOrders.find(
    (order) => order.status === "pending-approval" || order.status === "approved",
  );
  if (orderNeedingApproval) {
    return {
      stage:
        orderNeedingApproval.status === "pending-approval"
          ? "po-pending-approval"
          : "po-pending-release",
      label:
        orderNeedingApproval.status === "pending-approval"
          ? `Waiting for purchase order approval (${orderNeedingApproval._id})`
          : `Waiting for purchase order to be released (${orderNeedingApproval._id})`,
      approvers: await globalRoleContacts(["procurement-manager"]),
    };
  }

  const purchaseOrderIds = activeOrders.map((order) => order._id);
  const grns = purchaseOrderIds.length
    ? await Grn.find({ purchaseOrderId: { $in: purchaseOrderIds } }).lean()
    : [];
  const openGrn = grns.find(
    (grn) => grn.stage && !["received", "rejected", "closed"].includes(grn.stage),
  );
  if (openGrn) {
    const contacts = await projectScopedContacts(indentRow.projectId);
    if (openGrn.stage === "pending-engineer-approval") {
      return {
        stage: "grn-pending-engineer-approval",
        label: `Waiting for Site Engineer approval (${openGrn._id})`,
        approvers: resolveContacts(contacts, ["site-engineer"]),
      };
    }
    if (openGrn.stage === "pending-manager-approval") {
      return {
        stage: "grn-pending-manager-approval",
        label: `Waiting for Project Manager approval — posts stock (${openGrn._id})`,
        approvers: resolveContacts(contacts, ["project-manager", "project-head"]),
      };
    }
    if (openGrn.stage === "pending-store-confirmation") {
      return {
        stage: "grn-pending-store-confirmation",
        label: `Waiting for Store Manager to confirm receipt (${openGrn._id})`,
        approvers: resolveContacts(contacts, ["store-manager"]),
      };
    }
  }

  const deliverableOrders = activeOrders.filter(
    (order) => order.status === "released" || order.status === "partially-delivered",
  );
  if (deliverableOrders.length > 0) {
    const contacts = await projectScopedContacts(indentRow.projectId);
    return {
      stage: "awaiting-delivery",
      label: `Waiting for delivery — record inward entry once material arrives (${deliverableOrders
        .map((order) => order._id)
        .join(", ")})`,
      approvers: resolveContacts(contacts, ["store-manager", "site-engineer", "project-manager"]),
    };
  }

  return empty;
}

export async function getIndent(indentId) {
  const row = await Indent.findById(indentId).lean();
  if (!row) {
    return null;
  }
  const indent = mapIndent((await withDisplayNames([row]))[0]);
  const waiting = await getIndentWaitingOn(row);
  indent.waitingOn = waiting.approvers;
  indent.waitingOnStage = waiting.stage;
  indent.waitingOnLabel = waiting.label;
  return indent;
}

const PO_ACTION_LABELS = {
  submitted: "Purchase order submitted for approval",
  approved: "Purchase order approved",
  rejected: "Purchase order rejected",
  "sent-back": "Purchase order sent back for revision",
  released: "Purchase order released to the vendor",
};
const GRN_ACTION_LABELS = {
  "grn-created": "GRN raised after quality check",
  "site-engineer-approved": "GRN approved by the Site Engineer",
  "project-manager-approved": "Stock posted — approved by the Project Manager",
  "store-confirmed": "Material added to store — confirmed by the Store Manager",
  rejected: "GRN rejected",
  "sent-back": "GRN sent back for revision",
};

/**
 * Every movement this indent has been through, end to end: raised ->
 * approved -> sent to procurement -> quotations -> purchase order ->
 * vendor delivery -> QC -> GRN approval chain -> stock confirmed into
 * store. Walks the chain hop by hop since nothing in this codebase already
 * aggregates it (each stage keeps its own siloed history).
 */
export async function getIndentTimeline(indentId) {
  const indentRow = await Indent.findById(indentId).lean();
  if (!indentRow) {
    return [];
  }

  const events = [];
  const push = (event) => {
    if (event.at) events.push(event);
  };

  push({
    at: indentRow.createdAt,
    label: "Indent raised",
    detail: "Submitted for approval",
    actorId: indentRow.requestedById,
  });
  if (indentRow.status === "rejected") {
    push({ at: indentRow.updatedAt, label: "Indent rejected", actorId: null });
  }
  if (indentRow.approvedAt) {
    push({
      at: indentRow.approvedAt,
      label: "Indent approved",
      detail: "Sent to procurement",
      actorId: indentRow.approvedById,
    });
  }

  const requests = await ProcurementRequest.find({ sourceIndentId: indentId }).lean();
  for (const request of requests) {
    push({
      at: request.createdAt,
      label: "Procurement request raised",
      detail: request._id,
      actorId: null,
    });
  }
  const requestIds = requests.map((request) => request._id);

  const quotations = requestIds.length
    ? await SupplierQuotation.find({ purchaseRequestId: { $in: requestIds } }).lean()
    : [];
  for (const quote of quotations) {
    push({
      at: quote.createdAt,
      label: "Quotation recorded",
      detail: quote.quotationNumber,
      vendorId: quote.vendorId,
      actorId: null,
    });
    if (quote.status === "selected") {
      push({
        at: quote.updatedAt,
        label: "Quotation selected as winning supplier",
        detail: quote.quotationNumber,
        vendorId: quote.vendorId,
        actorId: null,
      });
    }
  }

  const purchaseOrders = await PurchaseOrder.find({ sourceIndentId: indentId }).lean();
  for (const order of purchaseOrders) {
    push({
      at: order.createdAt,
      label: "Purchase order created",
      detail: order._id,
      vendorId: order.vendorId,
      actorId: null,
    });
    for (const approval of order.approvals ?? []) {
      push({
        at: approval.at,
        label: PO_ACTION_LABELS[approval.action] ?? `Purchase order ${approval.action}`,
        detail: [order._id, approval.remarks].filter(Boolean).join(" — "),
        actorName: approval.approver,
        actorRole: approval.role,
      });
    }
  }
  const purchaseOrderIds = purchaseOrders.map((order) => order._id);

  const grns = purchaseOrderIds.length
    ? await Grn.find({ purchaseOrderId: { $in: purchaseOrderIds } }).lean()
    : [];
  for (const grn of grns) {
    push({
      at: grn.createdAt,
      label: "Inward entry recorded — material in transit",
      detail: [grn._id, `vehicle ${grn.vehicleNumber}`, grn.transporterName]
        .filter(Boolean)
        .join(" — "),
      actorId: grn.recordedById,
    });
    for (const approval of grn.approvals ?? []) {
      if (approval.action === "grn-created") continue; // System-recorded, and QC below already covers this moment.
      push({
        at: approval.at,
        label: GRN_ACTION_LABELS[approval.action] ?? `GRN ${approval.action}`,
        detail: [grn._id, approval.remarks].filter(Boolean).join(" — "),
        actorId: approval.approverId,
        actorRole: approval.role,
      });
    }
  }
  const grnIds = grns.map((grn) => grn._id);

  const inspections = grnIds.length
    ? await QcInspection.find({
        inwardId: { $in: grnIds },
        inspectedAt: { $ne: null },
      }).lean()
    : [];
  for (const inspection of inspections) {
    push({
      at: inspection.inspectedAt,
      label: "Quality check completed",
      detail: `${inspection.materialName} — accepted ${inspection.acceptedQuantity}, rejected ${inspection.rejectedQuantity}`,
      actorId: inspection.inspectorId,
    });
  }

  const actorIds = [
    indentRow.requestedById,
    indentRow.approvedById,
    ...events.map((event) => event.actorId),
  ].filter(Boolean);
  const users = actorIds.length
    ? await User.find({ _id: { $in: [...new Set(actorIds)] } }, { name: 1, role: 1 }).lean()
    : [];
  const usersById = new Map(users.map((user) => [user._id, user]));

  return events
    .map((event) => ({
      at: new Date(event.at).toISOString(),
      label: event.label,
      detail: event.detail || null,
      actorName: event.actorName ?? usersById.get(event.actorId)?.name ?? null,
      actorRole: event.actorRole ?? usersById.get(event.actorId)?.role ?? null,
      vendorId: event.vendorId ?? null,
    }))
    .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
}

async function nextIndentId() {
  const count = await Indent.countDocuments();
  return `IND-${String(count + 1).padStart(5, "0")}`;
}

export class UnknownMaterialError extends Error {
  constructor(materialCode) {
    super(`Unknown material code: ${materialCode}`);
    this.name = "UnknownMaterialError";
    this.materialCode = materialCode;
  }
}

export async function createIndent({
  projectId,
  requestedById,
  priority,
  requiredDate,
  purpose,
  workLocation,
  lines,
}) {
  // Lines typed in as new items are added to the catalogue first (one at a
  // time, so the same new item on two lines is only created once), then every
  // line is resolved against the catalogue the same way.
  const newMaterialCodeByLine = new Map();
  for (const [index, line] of lines.entries()) {
    if (line.newMaterial) {
      // eslint-disable-next-line no-await-in-loop
      const material = await findOrCreateMaterialFromIndent(line.newMaterial);
      newMaterialCodeByLine.set(index, material.code);
    }
  }
  const codeFor = (line, index) => newMaterialCodeByLine.get(index) ?? line.materialCode;

  const materialRows = await Material.find(
    { code: { $in: lines.map(codeFor) } },
    { code: 1, name: 1, unit: 1 },
  ).lean();
  const materialByCode = new Map(materialRows.map((row) => [row.code, row]));
  const resolvedLines = lines.map((line, index) => {
    const material = materialByCode.get(codeFor(line, index));
    if (!material) {
      throw new UnknownMaterialError(codeFor(line, index));
    }
    return {
      materialCode: material.code,
      materialName: material.name,
      unit: material.unit,
      requestedQuantity: line.requestedQuantity,
      approvedQuantity: null,
    };
  });

  const id = await nextIndentId();
  await Indent.create({
    _id: id,
    indentNumber: id,
    projectId,
    requestedById,
    priority,
    status: "submitted",
    requiredDate,
    purpose,
    workLocation,
    lines: resolvedLines,
  });
  return getIndent(id);
}

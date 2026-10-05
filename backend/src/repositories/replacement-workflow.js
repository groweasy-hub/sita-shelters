import { QcInspection, Replacement, Return } from "../db/models/index.js";
import { addPendingReceipt, confirmPendingReceipt } from "./inventory.js";
import {
  approvalEntry,
  categoryName,
  GrnStageError,
  revert,
  transition,
} from "./grn-workflow.js";
import { getReplacement } from "./replacements.js";

/**
 * Approval path for a replacement delivery, the same as a GRN's:
 *
 *   delivery recorded → Site Engineer approves → Project Manager approves (the
 *   final check; posts the stock, held as awaiting confirmation) → Store
 *   Manager confirms receipt (stock becomes available, ledger reference = the
 *   RPL id).
 *
 * A rejected delivery frees its quantity on the parent so it can be recorded
 * again. Every step is a compare-and-set on `stage`, so it happens once and in
 * order.
 */

const PARENT_MODELS = { qc: QcInspection, return: Return };

export async function approveReplacementAsSiteEngineer(replacementId, { userId, remarks }) {
  const entry = await approvalEntry(userId, "site-engineer-approved", remarks);
  const result = await transition(
    replacementId,
    "pending-engineer-approval",
    "pending-manager-approval",
    entry,
    Replacement,
  );
  return result.status === "not-found" ? null : getReplacement(replacementId);
}

export async function approveReplacementAsProjectManager(replacementId, { userId, remarks }) {
  const entry = await approvalEntry(userId, "project-manager-approved", remarks);
  const result = await transition(
    replacementId,
    "pending-manager-approval",
    "pending-store-confirmation",
    entry,
    Replacement,
  );
  if (result.status === "not-found") return null;
  // Already posted by an earlier call (e.g. a duplicate click) — don't post twice.
  if (result.status === "already-done") return getReplacement(replacementId);
  const claimed = result.record;
  try {
    await addPendingReceipt({
      projectId: claimed.projectId,
      materialCode: claimed.materialCode,
      materialName: claimed.materialName,
      category: await categoryName(claimed.materialCode),
      unit: claimed.unit,
      quantity: Number(claimed.quantity),
    });
  } catch (error) {
    await revert(replacementId, "pending-manager-approval", Replacement);
    throw error;
  }
  return getReplacement(replacementId);
}

export async function confirmReplacementReceipt(replacementId, { userId, remarks }) {
  const entry = await approvalEntry(userId, "store-confirmed", remarks);
  const result = await transition(
    replacementId,
    "pending-store-confirmation",
    "received",
    entry,
    Replacement,
  );
  if (result.status === "not-found") return null;
  // Already confirmed by an earlier call (e.g. a duplicate click) — don't post twice.
  if (result.status === "already-done") return getReplacement(replacementId);
  const claimed = result.record;
  try {
    await confirmPendingReceipt({
      projectId: claimed.projectId,
      materialCode: claimed.materialCode,
      materialName: claimed.materialName,
      category: await categoryName(claimed.materialCode),
      unit: claimed.unit,
      quantity: Number(claimed.quantity),
      referenceId: replacementId,
      movementType: "replacement",
    });
  } catch (error) {
    await revert(replacementId, "pending-store-confirmation", Replacement);
    throw error;
  }
  return getReplacement(replacementId);
}

/** An approver turns the delivery down. Nothing has been posted yet; its quantity is freed on the parent. */
export async function rejectReplacement(replacementId, { userId, remarks }) {
  const existing = await Replacement.findById(replacementId, { stage: 1 }).lean();
  if (!existing) return null;
  const from = existing.stage;
  if (from !== "pending-engineer-approval" && from !== "pending-manager-approval") {
    throw new GrnStageError("Only a delivery waiting for approval can be rejected");
  }
  const entry = await approvalEntry(userId, "rejected", remarks);
  const result = await transition(replacementId, from, "rejected", entry, Replacement);
  if (result.status === "not-found") return null;
  // Already rejected by an earlier call — the parent's quantity was already freed.
  if (result.status === "already-done") return getReplacement(replacementId);
  const claimed = result.record;
  await PARENT_MODELS[claimed.sourceType].updateOne(
    { _id: claimed.sourceId },
    { $inc: { replacedQuantity: -Number(claimed.quantity) } },
  );
  return getReplacement(replacementId);
}

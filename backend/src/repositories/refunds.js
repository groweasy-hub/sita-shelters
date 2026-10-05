export class RefundNotAllowedError extends Error {
  constructor(message) {
    super(message);
    this.name = "RefundNotAllowedError";
  }
}

/**
 * Whether the money for a "refund" settlement has actually come back. The
 * settlement records what is owed (quantity × unit price); this records that
 * it was received. `row` may carry `refundCompletedByName` from the caller's
 * name join.
 */
export function mapRefund(row) {
  return {
    completed: Boolean(row.refundCompletedAt),
    completedAt: row.refundCompletedAt ? row.refundCompletedAt.toISOString() : null,
    completedById: row.refundCompletedById ?? null,
    completedByName: row.refundCompletedByName ?? row.refundCompletedById ?? null,
    reference: row.refundReference ?? "",
    remarks: row.refundRemarks ?? "",
  };
}

/**
 * Marks a refund settlement as received. Claimed atomically so it can only be
 * completed once. `Model` is the QC or Return model and `existing` its lean
 * document.
 */
export async function completeRefund({ Model, existing, completedById, reference, remarks }) {
  if (existing.resolutionType !== "refund") {
    throw new RefundNotAllowedError("Only a refund settlement can be marked as refunded");
  }
  const claimed = await Model.findOneAndUpdate(
    { _id: existing._id, resolutionType: "refund", refundCompletedAt: null },
    {
      refundCompletedAt: new Date(),
      refundCompletedById: completedById,
      refundReference: reference,
      refundRemarks: remarks,
    },
  ).lean();
  if (!claimed) {
    throw new RefundNotAllowedError("This refund has already been marked as completed");
  }
}

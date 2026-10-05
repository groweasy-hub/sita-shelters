import { z } from "zod";

/** One delivery of replacement material against a QC rejection or a damaged return. */
export const replacementStageSchema = z.enum([
  "pending-engineer-approval",
  "pending-manager-approval",
  "pending-store-confirmation",
  "received",
  "rejected",
]);
export const replacementReceiptSchema = z.object({
  id: z.string().trim().min(1).max(128),
  projectId: z.string().max(128).default(""),
  // Same path as a GRN; only a "received" delivery has reached available stock.
  stage: replacementStageSchema.default("received"),
  approvals: z
    .array(
      z.object({
        action: z.string(),
        approverId: z.string().default(""),
        approver: z.string().default(""),
        role: z.string().default(""),
        remarks: z.string().default(""),
        at: z.string().datetime({ offset: true }),
      }),
    )
    .default([]),
  quantity: z.number().finite().nonnegative(),
  unitPrice: z.number().finite().nonnegative().default(0),
  value: z.number().finite().nonnegative().default(0),
  remarks: z.string().trim().max(500).default(""),
  receivedById: z.string().trim().min(1).max(128),
  receivedByName: z.string().trim().max(255).default(""),
  receivedAt: z.string().datetime({ offset: true }),
});
export const replacementReceiveInputSchema = z.object({
  quantity: z.coerce
    .number({ message: "Enter a valid quantity" })
    .finite()
    .positive("Quantity must be greater than zero"),
  remarks: z.string().trim().max(500).default(""),
});

const EPSILON = 1e-6;

/** awaiting-replacement → partially-replaced → replaced, for a "replace" settlement. */
export function replacementProgress(receivedQuantity, expectedQuantity) {
  if (receivedQuantity >= expectedQuantity - EPSILON) return "replaced";
  return receivedQuantity > EPSILON ? "partially-replaced" : "awaiting-replacement";
}

/** Units of a "replace" settlement still to be delivered (never negative). */
export function replacementRemaining(resolution) {
  return Math.max(0, resolution.quantity - resolution.replacedQuantity);
}

/** Units of a settlement's deliveries that were approved and confirmed into available stock. */
export function replacementReceivedInStock(resolution) {
  return (resolution.replacements ?? [])
    .filter((receipt) => receipt.stage === "received")
    .reduce((total, receipt) => total + receipt.quantity, 0);
}

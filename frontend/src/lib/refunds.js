import { z } from "zod";

/** Whether the money for a "refund" settlement has actually come back. */
export const refundStatusSchema = z
  .object({
    completed: z.boolean(),
    completedAt: z.string().datetime({ offset: true }).nullable().default(null),
    completedById: z.string().trim().max(128).nullable().default(null),
    completedByName: z.string().trim().max(255).nullable().default(null),
    reference: z.string().trim().max(120).default(""),
    remarks: z.string().trim().max(500).default(""),
  })
  .nullable()
  .default(null);
export const refundCompleteInputSchema = z.object({
  reference: z.string().trim().max(120).default(""),
  remarks: z.string().trim().max(500).default(""),
});

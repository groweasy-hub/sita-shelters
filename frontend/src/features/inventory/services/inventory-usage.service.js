import { apiClient } from "@/lib/api-client";
import { HttpError } from "@/services/http-client";
import { stockUsageInputSchema } from "../schemas/inventory.schema";

/**
 * Records stock used straight from a site's store. The backend books it as an
 * issue that is consumed in full, so stock drops, the ledger gets an entry and
 * a consumption record appears — no separate issue step.
 */
export async function recordStockUsage(input) {
  const normalized = stockUsageInputSchema.parse(input);
  try {
    return await apiClient.post("/api/consumption/direct", { body: normalized });
  } catch (error) {
    // Surface the server's own reason (e.g. the site doesn't hold that much).
    const reason = error instanceof HttpError ? error.body?.issues?.[0]?.message : null;
    throw reason ? new Error(reason, { cause: error }) : error;
  }
}

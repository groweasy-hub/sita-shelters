import { apiClient } from "@/lib/api-client";
import { HttpError } from "@/services/http-client";
import { materialIssuesSchema } from "../schemas/material-issues.schema";

/**
 * "Consumed" from the Site Engineer or Project Manager on an issued material.
 * Omit `quantity` to consume everything still outstanding. Whoever confirms
 * first updates the issue for both of them; the second gets a clear
 * "already consumed" answer.
 */
export async function confirmIssueConsumption({ materialIssueId, quantity }) {
  try {
    return await apiClient.post("/api/consumption/confirm", {
      body: quantity === undefined ? { materialIssueId } : { materialIssueId, quantity },
    });
  } catch (error) {
    // Surface the server's own reason (e.g. "already been marked as consumed").
    const reason = error instanceof HttpError ? error.body?.issues?.[0]?.message : null;
    throw reason ? new Error(reason, { cause: error }) : error;
  }
}

/**
 * Issued material still waiting for "Consumed", limited by the server to the
 * caller's sites. Every viewer of Consumption can see it; only the Site
 * Engineer / Project Manager can act on it.
 */
export async function listPendingConsumption() {
  return materialIssuesSchema.parse(await apiClient.get("/api/consumption/pending"));
}

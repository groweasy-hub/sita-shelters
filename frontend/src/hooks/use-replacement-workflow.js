"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { HttpError } from "@/services/http-client";

/**
 * A step on a replacement delivery (RPL-…): "approve-engineer",
 * "approve-manager", "confirm-receipt" or "reject". The Project Manager's
 * approval posts the stock and the store manager's confirmation makes it
 * available, so inventory and every view of the delivery are refreshed.
 * (String keys: the features that show deliveries import this hook.)
 */
export function useReplacementWorkflowStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ replacementId, step, remarks }) => {
      try {
        return await apiClient.post(
          `/api/replacements/${encodeURIComponent(replacementId)}/${step}`,
          { body: { remarks: String(remarks ?? "").trim() } },
        );
      } catch (error) {
        // Surface the server's own reason (e.g. "not waiting for that step").
        const reason = error instanceof HttpError ? error.body?.issues?.[0]?.message : null;
        throw reason ? new Error(reason, { cause: error }) : error;
      }
    },
    onSuccess: () => {
      for (const key of ["returns", "quality-control", "inventory", "consumption"]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
  });
}

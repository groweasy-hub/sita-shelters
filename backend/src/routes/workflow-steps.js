import { z } from "zod";

import { requirePermission } from "../middleware/require-permission.js";
import { canAccessProject, hasPermission } from "../permissions.js";
import { GrnStageError } from "../repositories/grn-workflow.js";

/**
 * The approval steps shared by GRNs and replacement deliveries:
 *
 *   approve-engineer   Site Engineer      (inward:engineer-approve)
 *   approve-manager    Project Manager    (inward:manager-approve) — posts the stock
 *   confirm-receipt    Store Manager      (inward:confirm-receipt) — makes it usable
 *   reject             the approver at their own step, with a reason
 *
 * Each step checks the caller is assigned to the record's project, then runs
 * the repository step, which enforces the stage order.
 */

const remarksSchema = z.object({ remarks: z.string().trim().max(500).default("") });
const rejectSchema = z.object({ remarks: z.string().trim().min(1, "Give a reason").max(500) });

const STEP_PERMISSIONS = {
  "approve-engineer": "inward:engineer-approve",
  "approve-manager": "inward:manager-approve",
  "confirm-receipt": "inward:confirm-receipt",
  reject: { any: ["inward:engineer-approve", "inward:manager-approve"] },
};

function validationIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

/** A rejection is the call of whoever the record is currently waiting on. */
function mayReject(user, record) {
  return (
    (record.stage === "pending-engineer-approval" &&
      hasPermission(user.role, "inward:engineer-approve")) ||
    (record.stage === "pending-manager-approval" &&
      hasPermission(user.role, "inward:manager-approve"))
  );
}

export function registerWorkflowSteps(router, { idParam, load, steps }) {
  for (const [path, run] of Object.entries(steps)) {
    router.post(`/:${idParam}/${path}`, requirePermission(STEP_PERMISSIONS[path]), async (req, res) => {
      const result = (path === "reject" ? rejectSchema : remarksSchema).safeParse(req.body ?? {});
      if (!result.success) {
        return res.status(400).json({
          error: "Details are invalid",
          issues: validationIssues(result.error),
        });
      }
      try {
        const existing = await load(req.params[idParam]);
        if (!existing) {
          return res.status(404).json({ error: "Record not found" });
        }
        if (!canAccessProject(req.user, existing.projectId)) {
          return res.status(403).json({
            error: "Details are invalid",
            issues: [{ field: idParam, message: "You are not assigned to this project" }],
          });
        }
        if (path === "reject" && !mayReject(req.user, existing)) {
          return res.status(403).json({
            error: "Details are invalid",
            issues: [{ field: idParam, message: "Your role can't take this step right now" }],
          });
        }
        res.json(await run(req.params[idParam], { ...result.data, userId: req.user.id }));
      } catch (error) {
        if (error instanceof GrnStageError) {
          return res.status(409).json({
            error: "Details are invalid",
            issues: [{ field: idParam, message: error.message }],
          });
        }
        console.error(`Workflow step ${path} API error`, error);
        res.status(500).json({ error: "The step could not be recorded" });
      }
    });
  }
}

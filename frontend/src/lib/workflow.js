import { hasPermission } from "@/config/permissions";

/**
 * Who can take the next step of the approval path shared by GRNs and
 * replacement deliveries (Site Engineer → Project Manager, who posts the
 * stock → Store Manager confirms). Presentation only — the backend enforces it.
 */
export const WORKFLOW_STEP_PERMISSIONS = {
  "pending-engineer-approval": "inward:engineer-approve",
  "pending-manager-approval": "inward:manager-approve",
  "pending-store-confirmation": "inward:confirm-receipt",
};

/** Whether `user` may act on a record at `stage` for `projectId` (and scope). */
export function canTakeWorkflowStep(user, stage, projectId, scopeProjectIds) {
  const permission = WORKFLOW_STEP_PERMISSIONS[stage];
  return Boolean(
    user &&
      permission &&
      hasPermission(user.role, permission) &&
      (!scopeProjectIds || scopeProjectIds.includes(projectId)),
  );
}

import { Router } from "express";

import {
  approveReplacementAsProjectManager,
  approveReplacementAsSiteEngineer,
  confirmReplacementReceipt,
  rejectReplacement,
} from "../repositories/replacement-workflow.js";
import { getReplacement } from "../repositories/replacements.js";
import { registerWorkflowSteps } from "./workflow-steps.js";

// Approval steps for a replacement delivery (RPL-…), the same path as a GRN.
// Deliveries are recorded from the QC / return record they settle; see
// `POST /api/quality-control/:id/replacements` and `/api/returns/:id/replacements`.
export const replacementsRouter = Router();

registerWorkflowSteps(replacementsRouter, {
  idParam: "replacementId",
  load: getReplacement,
  steps: {
    "approve-engineer": approveReplacementAsSiteEngineer,
    "approve-manager": approveReplacementAsProjectManager,
    "confirm-receipt": confirmReplacementReceipt,
    reject: rejectReplacement,
  },
});

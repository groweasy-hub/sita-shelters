"use client";

import {
  BadgeCheck,
  CircleX,
  ClipboardCheck,
  PackageCheck,
  Send,
  Undo2,
  Warehouse,
} from "lucide-react";

import { formatDateTime } from "@/lib/formatters";
import { EmptyState } from "@/components/feedback/empty-state";
import { Timeline, TimelineItem } from "./timeline";

const actionIcons = {
  submitted: Send,
  approved: BadgeCheck,
  rejected: CircleX,
  "sent-back": Undo2,
  released: PackageCheck,
  "grn-created": ClipboardCheck,
  "site-engineer-approved": BadgeCheck,
  "project-manager-approved": PackageCheck,
  "store-confirmed": Warehouse,
};
const actionLabels = {
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
  "sent-back": "Sent back",
  released: "Released",
  "grn-created": "GRN created",
  "site-engineer-approved": "Site Engineer approved",
  "project-manager-approved": "Project Manager approved — stock posted",
  "store-confirmed": "Store Manager confirmed receipt",
};

/**
 * Renders an ordered `approvals[]` history (see `approvalEntrySchema`) as a
 * `Timeline`. Reused by purchase-order approval/release and, later, GRN
 * approval screens — both share the same `{ approver, role, action,
 * remarks, at }` shape.
 */
export function ApprovalTimeline({ approvals = [] }) {
  if (!approvals.length) {
    return (
      <EmptyState
        compact
        description="No approval activity has been recorded yet."
        title="No approval history"
      />
    );
  }
  return (
    <Timeline>
      {approvals.map((entry, index) => (
        <TimelineItem
          icon={actionIcons[entry.action]}
          key={`${entry.at}-${index}`}
          meta={`${entry.approver} · ${entry.role} · ${formatDateTime(entry.at)}${
            entry.remarks ? ` — ${entry.remarks}` : ""
          }`}
          title={actionLabels[entry.action] ?? entry.action}
        />
      ))}
    </Timeline>
  );
}

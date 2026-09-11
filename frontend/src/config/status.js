export const statusToneClasses = {
  neutral: "neutral",
  info: "info",
  success: "success",
  warning: "warning",
  danger: "danger",
  accent: "accent",
};
export const statusConfig = {
  draft: { label: "Draft", tone: "neutral", icon: "draft" },
  submitted: { label: "Submitted", tone: "info", icon: "submitted" },
  "under-review": {
    label: "Under Review",
    tone: "warning",
    icon: "review",
  },
  approved: { label: "Approved", tone: "success", icon: "approved" },
  rejected: { label: "Rejected", tone: "danger", icon: "rejected" },
  "partially-fulfilled": {
    label: "Partially Fulfilled",
    tone: "accent",
    icon: "partial",
  },
  completed: { label: "Completed", tone: "success", icon: "completed" },
  "pending-approval": {
    label: "Pending Approval",
    tone: "warning",
    icon: "pending",
  },
  sent: { label: "Sent", tone: "info", icon: "sent" },
  "partially-supplied": {
    label: "Partially Supplied",
    tone: "accent",
    icon: "partial",
  },
  cancelled: { label: "Cancelled", tone: "danger", icon: "cancelled" },
  requested: { label: "Requested", tone: "info", icon: "requested" },
  "ready-for-dispatch": {
    label: "Ready for Dispatch",
    tone: "warning",
    icon: "dispatch-ready",
  },
  dispatched: { label: "Dispatched", tone: "info", icon: "dispatched" },
  "in-transit": { label: "In Transit", tone: "info", icon: "in-transit" },
  received: { label: "Received", tone: "success", icon: "received" },
  available: { label: "Available", tone: "success", icon: "available" },
  reserved: { label: "Reserved", tone: "accent", icon: "reserved" },
  "low-stock": {
    label: "Low Stock",
    tone: "warning",
    icon: "low-stock",
  },
  damaged: { label: "Damaged", tone: "danger", icon: "damaged" },
  "under-inspection": {
    label: "Under Inspection",
    tone: "warning",
    icon: "inspection",
  },
  planning: { label: "Planning", tone: "info", icon: "draft" },
  active: { label: "Active", tone: "success", icon: "available" },
  "on-hold": { label: "On Hold", tone: "warning", icon: "pending" },
  closed: { label: "Closed", tone: "neutral", icon: "completed" },
  assigned: { label: "Assigned", tone: "accent", icon: "reserved" },
  "in-use": { label: "In Use", tone: "info", icon: "in-transit" },
  "under-maintenance": {
    label: "Under Maintenance",
    tone: "warning",
    icon: "inspection",
  },
  unavailable: { label: "Unavailable", tone: "danger", icon: "damaged" },
  good: { label: "Good", tone: "success", icon: "available" },
  "pending-inspection": {
    label: "Pending Inspection",
    tone: "warning",
    icon: "pending",
  },
  consumed: { label: "Consumed", tone: "neutral", icon: "completed" },
  "partially-consumed": {
    label: "Partially Consumed",
    tone: "accent",
    icon: "partial",
  },
  returned: { label: "Returned", tone: "info", icon: "requested" },
  issued: { label: "Issued", tone: "accent", icon: "dispatched" },
  open: { label: "Open", tone: "info", icon: "submitted" },
  "in-progress": { label: "In Progress", tone: "warning", icon: "pending" },
  resolved: { label: "Resolved", tone: "success", icon: "completed" },
  accepted: { label: "Accepted", tone: "success", icon: "approved" },
  selected: { label: "Selected", tone: "success", icon: "approved" },
  verified: { label: "Verified", tone: "success", icon: "approved" },
  initiated: { label: "Initiated", tone: "info", icon: "requested" },
  "partially-issued": {
    label: "Partially Issued",
    tone: "accent",
    icon: "partial",
  },
  invited: { label: "Invited", tone: "info", icon: "sent" },
  "pending-qc": { label: "Pending QC", tone: "warning", icon: "pending" },
};
export const unknownStatusConfig = {
  label: "Unknown",
  tone: "neutral",
  icon: "unknown",
};
const indentWorkflow = {
  statuses: [
    "draft",
    "submitted",
    "under-review",
    "approved",
    "rejected",
    "partially-fulfilled",
    "completed",
  ],
  transitions: {
    draft: ["submitted"],
    submitted: ["under-review", "draft"],
    "under-review": ["approved", "rejected", "draft"],
    approved: ["partially-fulfilled", "completed"],
    rejected: ["draft"],
    "partially-fulfilled": ["completed"],
    completed: [],
  },
};
const purchaseOrderWorkflow = {
  statuses: [
    "draft",
    "pending-approval",
    "approved",
    "sent",
    "partially-supplied",
    "completed",
    "cancelled",
  ],
  transitions: {
    draft: ["pending-approval", "cancelled"],
    "pending-approval": ["approved", "draft", "cancelled"],
    approved: ["sent", "cancelled"],
    sent: ["partially-supplied", "completed", "cancelled"],
    "partially-supplied": ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  },
};
const transferWorkflow = {
  statuses: [
    "draft",
    "requested",
    "approved",
    "ready-for-dispatch",
    "dispatched",
    "in-transit",
    "received",
    "rejected",
  ],
  transitions: {
    draft: ["requested"],
    requested: ["approved", "rejected", "draft"],
    approved: ["ready-for-dispatch", "rejected"],
    "ready-for-dispatch": ["dispatched"],
    dispatched: ["in-transit", "received"],
    "in-transit": ["received"],
    received: [],
    rejected: ["draft"],
  },
};
const inventoryWorkflow = {
  statuses: [
    "available",
    "reserved",
    "low-stock",
    "damaged",
    "under-inspection",
    "in-transit",
  ],
  transitions: {
    available: [
      "reserved",
      "low-stock",
      "damaged",
      "under-inspection",
      "in-transit",
    ],
    reserved: ["available", "low-stock", "damaged", "in-transit"],
    "low-stock": ["available", "reserved", "damaged", "in-transit"],
    damaged: ["under-inspection"],
    "under-inspection": ["available", "damaged"],
    "in-transit": ["available", "damaged", "under-inspection"],
  },
};
export const workflowConfig = {
  indent: indentWorkflow,
  purchaseOrder: purchaseOrderWorkflow,
  transfer: transferWorkflow,
  inventory: inventoryWorkflow,
};
function normalizeStatus(status) {
  return status
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}
function humanizeStatus(status) {
  const normalized = normalizeStatus(status);
  if (!normalized) {
    return unknownStatusConfig.label;
  }
  return normalized
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
export function isKnownStatus(status) {
  return Object.prototype.hasOwnProperty.call(statusConfig, status);
}
export function getStatusConfig(status) {
  if (!status) {
    return unknownStatusConfig;
  }
  const normalized = normalizeStatus(status);
  if (isKnownStatus(normalized)) {
    return statusConfig[normalized];
  }
  return {
    ...unknownStatusConfig,
    label: humanizeStatus(status),
  };
}
function canTransition(workflow, from, to) {
  if (!workflow.statuses.includes(from)) {
    return false;
  }
  const typedFrom = from;
  return workflow.transitions[typedFrom].includes(to);
}
export function isWorkflowTransitionAllowed(workflow, from, to) {
  switch (workflow) {
    case "indent":
      return canTransition(indentWorkflow, from, to);
    case "purchaseOrder":
      return canTransition(purchaseOrderWorkflow, from, to);
    case "transfer":
      return canTransition(transferWorkflow, from, to);
    case "inventory":
      return canTransition(inventoryWorkflow, from, to);
  }
}

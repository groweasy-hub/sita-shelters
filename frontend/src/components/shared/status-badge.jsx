"use client";

import {
  BadgeCheck,
  Ban,
  CircleCheckBig,
  CircleDotDashed,
  CircleHelp,
  CircleX,
  ClipboardList,
  Clock3,
  FilePenLine,
  LockKeyhole,
  Package,
  PackageCheck,
  PackageX,
  Route,
  ScanSearch,
  SearchCheck,
  Send,
  TriangleAlert,
  Truck,
} from "lucide-react";
import styled, { css } from "styled-components";

import { getStatusConfig } from "@/config/status";

const statusIcons = {
  draft: FilePenLine,
  submitted: Send,
  review: SearchCheck,
  approved: BadgeCheck,
  rejected: CircleX,
  partial: CircleDotDashed,
  completed: CircleCheckBig,
  pending: Clock3,
  sent: Send,
  cancelled: Ban,
  requested: ClipboardList,
  "dispatch-ready": PackageCheck,
  dispatched: Truck,
  "in-transit": Route,
  received: PackageCheck,
  available: Package,
  reserved: LockKeyhole,
  "low-stock": TriangleAlert,
  damaged: PackageX,
  inspection: ScanSearch,
  unknown: CircleHelp,
};
const toneColor = ({ $tone, theme }) => {
  if ($tone === "success") return theme.colors.success;
  if ($tone === "warning") return theme.colors.warning;
  if ($tone === "danger") return theme.colors.danger;
  if ($tone === "info") return theme.colors.info;
  if ($tone === "accent") return theme.colors.accentForeground;
  return theme.colors.mutedForeground;
};
const Status = styled.span`
  display: inline-flex;
  width: fit-content;
  min-height: 1.35rem;
  align-items: center;
  gap: 0.375rem;
  padding: 0.125rem 0.5rem;
  border: 1px solid ${toneColor};
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${toneColor};
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1rem;
  white-space: nowrap;
  ${({ $tone, theme }) =>
    $tone === "neutral"
      ? css`
          background: ${theme.colors.muted};
        `
      : css`
          background: ${toneColor({ $tone, theme })}14;
        `}
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`;

export function StatusBadge({ label, showIcon = true, status, ...props }) {
  const definition = getStatusConfig(status);
  const Icon = statusIcons[definition.icon];
  return (
    <Status
      $tone={definition.tone}
      data-status={status ?? "unknown"}
      {...props}
    >
      {showIcon ? <Icon aria-hidden="true" strokeWidth={1.75} /> : null}
      {label ?? definition.label}
    </Status>
  );
}

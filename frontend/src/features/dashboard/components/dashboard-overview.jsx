"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  Boxes,
  Building2,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Clock3,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Truck,
} from "lucide-react";
import styled, { keyframes } from "styled-components";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { ROLE_ACCESS_SCOPE, ROLE_LABELS, hasPermission } from "@/config/permissions";
import { useAllInventoryItems } from "@/features/inventory";
import { useAllIndents } from "@/features/indents";
import {
  calculatePurchaseOrderValue,
  useAllPurchaseOrders,
} from "@/features/procurement";
import { useAllInwardRecords } from "@/features/inward";
import { useCurrentUser } from "@/features/profile";
import { QUICK_ACTIONS } from "../constants/quick-actions";
import { useAllQualityControlInspections } from "@/features/quality-control";
import { useAllStockTransfers } from "@/features/stock-transfers";
import { useProjects } from "@/features/projects";
import { MaterialIntelligencePanel } from "@/features/materials";
import { formatCompactNumber, formatCurrency, formatPercent } from "@/lib/formatters";
import { usePreferencesStore } from "@/stores/preferences-store";

/** `null` return means unscoped — the user's role sees the whole portfolio. */
function useDashboardScope() {
  const user = useCurrentUser();
  const defaultProjectId = usePreferencesStore((state) => state.dashboard.defaultProjectId);
  return useMemo(() => {
    if (!user) {
      return { user: null, scopeProjectIds: null };
    }
    const isProjectScoped = ROLE_ACCESS_SCOPE[user.role] === "project";
    if (isProjectScoped) {
      return { user, scopeProjectIds: user.projectIds };
    }
    return {
      user,
      scopeProjectIds: defaultProjectId ? [defaultProjectId] : null,
    };
  }, [user, defaultProjectId]);
}
function inScope(scopeProjectIds, projectId) {
  return !scopeProjectIds || scopeProjectIds.includes(projectId);
}
const DATE_RANGE_MS = {
  "last-7-days": 7 * 24 * 60 * 60 * 1000,
  "last-30-days": 30 * 24 * 60 * 60 * 1000,
  "this-quarter": 92 * 24 * 60 * 60 * 1000,
  "this-year": 366 * 24 * 60 * 60 * 1000,
};
/** Prefers items updated within the selected window, falling back to the full list if that would leave nothing to show. */
function withinPreferredWindow(items, dateRange, getDate) {
  const windowMs = DATE_RANGE_MS[dateRange];
  if (!windowMs) {
    return items;
  }
  const cutoff = Date.now() - windowMs;
  const filtered = items.filter((item) => {
    const value = getDate(item);
    const time = value ? new Date(value).getTime() : NaN;
    return !Number.isNaN(time) && time >= cutoff;
  });
  return filtered.length ? filtered : items;
}

const pulse = keyframes`0%, 100% { transform: scale(1); opacity: 0.35; } 50% { transform: scale(2); opacity: 0; }`;
const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const PageHeader = styled.header`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  @media (min-width: 640px) {
    flex-direction: row;
    align-items: flex-end;
  }
`;
const EyebrowRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;
const AccentLine = styled.span`
  width: 1.5rem;
  height: 1px;
  background: ${({ theme }) => theme.colors.primary};
`;
const Eyebrow = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.accentForeground};
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;
const PageTitle = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.25rem);
  font-weight: 650;
  letter-spacing: -0.045em;
  line-height: 1.05;
`;
const Intro = styled.p`
  margin: 0.5rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
`;
const Freshness = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  @media (min-width: 640px) {
    align-self: auto;
  }
`;
const LiveDot = styled.span`
  position: relative;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.success};
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: inherit;
    animation: ${pulse} 1.6s ease-out infinite;
  }
`;
const SectionHeading = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
`;
const SectionTitle = styled.h2`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 650;
`;
const SectionSubtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const SectionBlock = styled.section`
  display: grid;
  gap: 0.75rem;
`;
const Metrics = styled.div`
  display: grid;
  gap: 1px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.border};
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
`;
const Metric = styled(Link)`
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1.25rem;
  background: ${({ theme }) => theme.colors.card};
  color: inherit;
  text-decoration: none;
  transition: background 150ms ease;
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }
  @media (min-width: 640px) {
    padding-inline: 1.5rem;
  }
`;
const MetricIcon = styled.span`
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ $tone, theme }) => theme.colors[$tone]};
  background: ${({ $tone, theme }) => theme.colors[$tone]}18;
  svg {
    width: 1.125rem;
    height: 1.125rem;
  }
`;
const MetricBody = styled.div`
  min-width: 0;
  flex: 1;
`;
const MetricLabel = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  font-weight: 550;
`;
const MetricValue = styled.p`
  margin: 0.375rem 0 0;
  font-size: 1.375rem;
  font-weight: 650;
  letter-spacing: -0.03em;
`;
const MetricNote = styled.p`
  margin: 0.375rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  line-height: 1.15rem;
`;
const MainGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  @media (min-width: 1280px) {
    grid-template-columns: minmax(0, 1.45fr) minmax(21rem, 0.72fr);
  }
`;
const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  @media (min-width: 640px) {
    padding-inline: 1.5rem;
  }
`;
const PanelTitle = styled.h2`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 650;
`;
const PanelSubtitle = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const Project = styled(Link)`
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: inherit;
  text-decoration: none;
  &:last-child {
    border-bottom: 0;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceMuted}66;
  }
  @media (min-width: 640px) {
    grid-template-columns: minmax(11rem, 1fr) minmax(10rem, 0.8fr) 7rem 5rem;
    align-items: center;
    padding-inline: 1.5rem;
  }
`;
const ProjectIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
`;
const SiteIcon = styled.span`
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.muted};
`;
const ProjectName = styled.h3`
  margin: 0;
  overflow: hidden;
  font-size: 0.875rem;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const ProjectLocation = styled.p`
  margin: 0.125rem 0 0;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const ProgressLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  span:first-child {
    color: ${({ theme }) => theme.colors.mutedForeground};
  }
  span:last-child {
    font-weight: 600;
  }
`;
const Track = styled.div`
  height: 0.375rem;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.muted};
`;
const Fill = styled.div`
  width: ${({ $progress }) => $progress}%;
  height: 100%;
  border-radius: inherit;
  background: ${({ theme }) => theme.colors.success};
`;
const MicroLabel = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;
const Stock = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  font-weight: 650;
`;
const Flags = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ $hasFlags, theme }) => ($hasFlags ? theme.colors.foreground : theme.colors.mutedForeground)};
  font-size: 0.75rem;
  svg {
    color: ${({ $hasFlags, theme }) => ($hasFlags ? theme.colors.warning : theme.colors.success)};
  }
  @media (min-width: 640px) {
    justify-content: flex-end;
  }
`;
const PanelFooter = styled.div`
  padding: 0.75rem 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceMuted}66;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  @media (min-width: 640px) {
    padding-inline: 1.5rem;
  }
`;
const QueueItem = styled(Link)`
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: inherit;
  text-decoration: none;
  &:last-child {
    border-bottom: 0;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceMuted}66;
  }
`;
const QueueIcon = styled.span`
  display: grid;
  width: 2.125rem;
  height: 2.125rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ $tone, theme }) => theme.colors[$tone]};
  background: ${({ $tone, theme }) => theme.colors[$tone]}18;
  svg {
    width: 1rem;
    height: 1rem;
  }
`;
const QueueBody = styled.div`
  min-width: 0;
  flex: 1;
`;
const QueueTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
`;
const QueueId = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.68rem;
`;
const QueueTitle = styled.h3`
  margin: 0.5rem 0 0;
  overflow: hidden;
  font-size: 0.875rem;
  font-weight: 650;
  line-height: 1.25rem;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const QueueMeta = styled.p`
  margin: 0.25rem 0 0;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const Signals = styled.section`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
`;
const SignalCard = styled(Link)`
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  color: inherit;
  text-decoration: none;
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;
const SignalIcon = styled.span`
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ $tone, theme }) => theme.colors[$tone]};
  background: ${({ $tone, theme }) => theme.colors[$tone]}18;
`;
const SignalLabel = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-weight: 550;
`;
const SignalValue = styled.p`
  margin: 0.25rem 0 0;
  font-size: 1.125rem;
  font-weight: 650;
`;
const SignalCopy = styled.p`
  margin: 0.5rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  line-height: 1.25rem;
`;

function Signal({ href, icon: Icon, tone, label, value, description }) {
  return (
    <SignalCard href={href}>
      <SignalIcon $tone={tone}>
        <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
      </SignalIcon>
      <div>
        <SignalLabel>{label}</SignalLabel>
        <SignalValue>{value}</SignalValue>
        <SignalCopy>{description}</SignalCopy>
      </div>
    </SignalCard>
  );
}

const ActionsSection = styled.section`
  display: grid;
  gap: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  padding: 1.25rem;
  @media (min-width: 640px) {
    padding: 1.5rem;
  }
`;
const ActionsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;
const ActionsTitle = styled.h2`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 650;
`;
const ActionsSubtitle = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const ActionsGrid = styled.div`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
`;
const ActionCard = styled(Link)`
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: inherit;
  text-decoration: none;
  transition: border-color 150ms ease, background 150ms ease;
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.surfaceMuted}66;
  }
`;
const ActionIcon = styled.span`
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accentForeground};
  svg {
    width: 1.0625rem;
    height: 1.0625rem;
  }
`;
const ActionLabel = styled.p`
  margin: 0;
  font-size: 0.84375rem;
  font-weight: 650;
`;
const ActionDescription = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  line-height: 1.15rem;
`;

const OPEN_PO_STATUSES = new Set(["approved", "sent", "partially-supplied"]);
const PENDING_INDENT_STATUSES = new Set(["submitted", "under-review"]);
const QC_PENDING_STATUSES = new Set(["pending-inspection", "under-inspection"]);

export function DashboardOverview() {
  const { user, scopeProjectIds } = useDashboardScope();
  const widgetVisibility = usePreferencesStore((state) => state.dashboard.widgetVisibility);
  const defaultDateRange = usePreferencesStore((state) => state.dashboard.defaultDateRange);
  const { data: allProjects = [] } = useProjects();
  const { data: allInventoryItems = [] } = useAllInventoryItems();
  const { data: allIndents = [] } = useAllIndents();
  const { data: allPurchaseOrders = [] } = useAllPurchaseOrders();
  const { data: allInwardRecords = [] } = useAllInwardRecords();
  const { data: allQcInspections = [] } = useAllQualityControlInspections();
  const { data: allTransfers = [] } = useAllStockTransfers();

  const projects = useMemo(
    () => allProjects.filter((project) => inScope(scopeProjectIds, project.id)),
    [allProjects, scopeProjectIds],
  );
  const inventoryItems = useMemo(
    () => allInventoryItems.filter((item) => inScope(scopeProjectIds, item.projectId)),
    [allInventoryItems, scopeProjectIds],
  );
  const indents = useMemo(
    () => allIndents.filter((indent) => inScope(scopeProjectIds, indent.projectId)),
    [allIndents, scopeProjectIds],
  );
  const purchaseOrders = useMemo(
    () => allPurchaseOrders.filter((order) => inScope(scopeProjectIds, order.projectId)),
    [allPurchaseOrders, scopeProjectIds],
  );
  const inwardRecords = useMemo(
    () => allInwardRecords.filter((record) => inScope(scopeProjectIds, record.projectId)),
    [allInwardRecords, scopeProjectIds],
  );
  const qcInspections = useMemo(
    () =>
      allQcInspections.filter((inspection) => inScope(scopeProjectIds, inspection.projectId)),
    [allQcInspections, scopeProjectIds],
  );
  const transfers = useMemo(
    () =>
      allTransfers.filter(
        (transfer) =>
          inScope(scopeProjectIds, transfer.sourceProjectId) ||
          inScope(scopeProjectIds, transfer.destinationProjectId),
      ),
    [allTransfers, scopeProjectIds],
  );

  const isPortfolioWide = scopeProjectIds === null;
  const portfolioStockValue = useMemo(
    () => projects.reduce((sum, project) => sum + project.inventoryValue, 0),
    [projects],
  );
  const activeProjectCount = projects.filter((p) => p.status === "active").length;
  const openOrders = useMemo(
    () => purchaseOrders.filter((order) => OPEN_PO_STATUSES.has(order.status)),
    [purchaseOrders],
  );
  const openOrdersValue = useMemo(
    () => openOrders.reduce((sum, order) => sum + calculatePurchaseOrderValue(order), 0),
    [openOrders],
  );
  const pendingIndentsCount = indents.filter((indent) =>
    PENDING_INDENT_STATUSES.has(indent.status),
  ).length;
  const pendingPoApprovalCount = purchaseOrders.filter(
    (order) => order.status === "pending-approval",
  ).length;
  const totalPendingApprovals = pendingIndentsCount + pendingPoApprovalCount;
  const availableCount = inventoryItems.filter((item) => item.status === "available").length;
  const materialAvailability = inventoryItems.length
    ? (availableCount / inventoryItems.length) * 100
    : 0;
  const lowStockItems = inventoryItems.filter(
    (item) => item.status === "low-stock" || item.availableQuantity < item.reorderLevel,
  );
  const lowStockMaterialNames = [
    ...new Set(lowStockItems.map((item) => item.materialName)),
  ].slice(0, 2);
  const pendingQcCount = qcInspections.filter((inspection) =>
    QC_PENDING_STATUSES.has(inspection.status),
  ).length;
  const qcTotals = qcInspections.reduce(
    (totals, inspection) => ({
      accepted: totals.accepted + inspection.acceptedQuantity,
      rejected: totals.rejected + inspection.rejectedQuantity,
    }),
    { accepted: 0, rejected: 0 },
  );
  const qcPassRate =
    qcTotals.accepted + qcTotals.rejected > 0
      ? (qcTotals.accepted / (qcTotals.accepted + qcTotals.rejected)) * 100
      : 100;
  const pendingInwardCount = inwardRecords.filter(
    (record) => record.status === "pending-qc" || record.status === "under-inspection",
  ).length;

  const availabilityTone =
    materialAvailability >= 85 ? "success" : materialAvailability >= 60 ? "warning" : "danger";

  const metrics = [
    {
      label: isPortfolioWide ? "Portfolio stock value" : "Site stock value",
      value: formatCurrency(portfolioStockValue, { maximumFractionDigits: 0 }),
      note: isPortfolioWide
        ? `${activeProjectCount} active projects`
        : `${projects.length} project${projects.length === 1 ? "" : "s"}`,
      icon: Boxes,
      tone: "info",
      href: "/inventory",
    },
    {
      widgetId: "open-purchase-orders",
      label: "Open purchase orders",
      value: formatCompactNumber(openOrders.length),
      note: `${formatCurrency(openOrdersValue, { maximumFractionDigits: 0 })} committed`,
      icon: ShoppingCart,
      tone: "info",
      href: "/procurement/purchase-orders",
    },
    {
      widgetId: "pending-approvals",
      label: "Pending approvals",
      value: formatCompactNumber(totalPendingApprovals),
      note: `${pendingIndentsCount} indents · ${pendingPoApprovalCount} orders`,
      icon: Clock3,
      tone: totalPendingApprovals > 0 ? "warning" : "success",
      href: "/indents",
    },
    {
      label: "Material availability",
      value: formatPercent(materialAvailability, { valueIsPercent: true }),
      note: `${lowStockItems.length} SKUs below reorder level`,
      icon: PackageCheck,
      tone: availabilityTone,
      href: "/inventory/low-stock",
    },
  ].filter((metric) => !metric.widgetId || widgetVisibility[metric.widgetId]);

  const showProjectProgress = widgetVisibility["project-progress"];
  const showLowStockAlerts = widgetVisibility["low-stock-alerts"];
  const showMaterialIntelligence = widgetVisibility["material-intelligence-digest"];

  const attentionProjects = useMemo(() => {
    return [...projects]
      .sort((first, second) => second.lowStockAlerts - first.lowStockAlerts)
      .slice(0, 3);
  }, [projects]);

  const workflowQueue = useMemo(() => {
    const indentItems = widgetVisibility["pending-approvals"]
      ? indents
          .filter((indent) => PENDING_INDENT_STATUSES.has(indent.status))
          .map((indent) => ({
            id: indent.id,
            href: `/indents/${indent.id}`,
            label: `${indent.lines[0]?.materialName ?? "Material requirement"}${
              indent.lines.length > 1 ? ` +${indent.lines.length - 1} more` : ""
            }`,
            meta: `${indent.projectName} · ${indent.lines[0]?.requestedQuantity ?? ""} ${
              indent.lines[0]?.unit ?? ""
            }`,
            state: "Awaiting approval",
            variant: "warning",
            tone: "warning",
            icon: ClipboardList,
            sortKey: indent.updatedAt,
          }))
      : [];
    const qcItems = qcInspections
      .filter((inspection) => QC_PENDING_STATUSES.has(inspection.status))
      .map((inspection) => ({
        id: inspection.id,
        href: `/quality-control/${inspection.id}`,
        label: inspection.materialName,
        meta: `${inspection.projectName} · ${inspection.id}`,
        state: "Under inspection",
        variant: "info",
        tone: "info",
        icon: ShieldCheck,
        sortKey: inspection.inspectedAt ?? "",
      }));
    const transferItems = widgetVisibility["transfers-in-transit"]
      ? transfers
          .filter((transfer) => transfer.status === "in-transit")
          .map((transfer) => ({
            id: transfer.id,
            href: `/stock-transfers/${transfer.id}`,
            label: transfer.materialName,
            meta: `${transfer.sourceProjectName} → ${transfer.destinationProjectName} · ${transfer.quantity} ${transfer.unit}`,
            state: "In transit",
            variant: "secondary",
            tone: "info",
            icon: ArrowLeftRight,
            sortKey: transfer.dispatchedAt ?? "",
          }))
      : [];
    const combined = [...indentItems, ...qcItems, ...transferItems].sort((first, second) =>
      second.sortKey > first.sortKey ? 1 : -1,
    );
    return withinPreferredWindow(combined, defaultDateRange, (item) => item.sortKey).slice(0, 5);
  }, [indents, qcInspections, transfers, widgetVisibility, defaultDateRange]);

  const firstName = user?.name?.split(" ")[0];
  const roleLabel = user ? ROLE_LABELS[user.role] : null;
  const availableActions = useMemo(
    () =>
      user
        ? QUICK_ACTIONS.filter((action) => hasPermission(user.role, action.permission))
        : [],
    [user],
  );

  return (
    <Root>
      <PageHeader>
        <div>
          <EyebrowRow>
            <AccentLine />
            <Eyebrow>
              {isPortfolioWide ? "Portfolio control room" : roleLabel ?? "Site control room"}
            </Eyebrow>
          </EyebrowRow>
          <PageTitle>{firstName ? `Good morning, ${firstName}.` : "Good morning."}</PageTitle>
          <Intro>
            {isPortfolioWide
              ? `A live view of construction operations across ${projects.length} projects, ${activeProjectCount} of them active.`
              : projects.length === 1
                ? `A live view of ${projects[0].name} — ${projects[0].location}.`
                : `A live view across your ${projects.length} assigned projects.`}
          </Intro>
        </div>
        <Freshness>
          <LiveDot />
          Live from inventory, procurement and quality control
        </Freshness>
      </PageHeader>
      <SectionBlock aria-labelledby="portfolio-metrics">
        <SectionHeading>
          <SectionTitle id="portfolio-metrics">Key numbers</SectionTitle>
          <SectionSubtitle>Where things stand right now</SectionSubtitle>
        </SectionHeading>
        <Metrics>
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Metric href={metric.href} key={metric.label}>
                <MetricIcon $tone={metric.tone}>
                  <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                </MetricIcon>
                <MetricBody>
                  <MetricLabel>{metric.label}</MetricLabel>
                  <MetricValue>{metric.value}</MetricValue>
                  <MetricNote>{metric.note}</MetricNote>
                </MetricBody>
              </Metric>
            );
          })}
        </Metrics>
      </SectionBlock>
      {availableActions.length ? (
        <ActionsSection aria-labelledby="quick-actions-heading">
          <ActionsHeader>
            <div>
              <ActionsTitle id="quick-actions-heading">Your quick actions</ActionsTitle>
              <ActionsSubtitle>
                Shortcuts to what {roleLabel ?? "your role"} can do from here.
              </ActionsSubtitle>
            </div>
          </ActionsHeader>
          <ActionsGrid>
            {availableActions.map((action) => (
              <ActionCard href={action.href} key={action.label}>
                <ActionIcon>
                  <action.icon aria-hidden="true" size={17} strokeWidth={1.7} />
                </ActionIcon>
                <div>
                  <ActionLabel>{action.label}</ActionLabel>
                  <ActionDescription>{action.description}</ActionDescription>
                </div>
              </ActionCard>
            ))}
          </ActionsGrid>
        </ActionsSection>
      ) : null}
      <MainGrid style={showProjectProgress ? undefined : { gridTemplateColumns: "1fr" }}>
        {showProjectProgress ? (
          <Panel aria-labelledby="project-health-heading">
            <PanelHeader>
              <div>
                <PanelTitle id="project-health-heading">
                  Project health
                </PanelTitle>
                <PanelSubtitle>
                  Projects needing the most material attention
                </PanelSubtitle>
              </div>
              <Badge variant="outline">{activeProjectCount} active</Badge>
            </PanelHeader>
            {attentionProjects.map((project) => (
              <Project href={`/projects/${project.id}`} key={project.id}>
                <ProjectIdentity>
                  <SiteIcon>
                    <Building2 aria-hidden="true" size={17} strokeWidth={1.7} />
                  </SiteIcon>
                  <div>
                    <ProjectName>{project.name}</ProjectName>
                    <ProjectLocation>{project.location}</ProjectLocation>
                  </div>
                </ProjectIdentity>
                <div>
                  <ProgressLabel>
                    <span>Completion</span>
                    <span>{project.progressPercent}%</span>
                  </ProgressLabel>
                  <Track>
                    <Fill $progress={project.progressPercent} />
                  </Track>
                </div>
                <div>
                  <MicroLabel>Stock value</MicroLabel>
                  <Stock>
                    {formatCurrency(project.inventoryValue, {
                      maximumFractionDigits: 0,
                    })}
                  </Stock>
                </div>
                <Flags $hasFlags={project.lowStockAlerts > 0}>
                  {project.lowStockAlerts > 0 ? (
                    <CircleAlert aria-hidden="true" size={14} />
                  ) : (
                    <CheckCircle2 aria-hidden="true" size={14} />
                  )}
                  {project.lowStockAlerts} flag{project.lowStockAlerts === 1 ? "" : "s"}
                </Flags>
              </Project>
            ))}
            <PanelFooter>
              {Math.max(projects.length - attentionProjects.length, 0)} additional
              projects remain within planned thresholds.
            </PanelFooter>
          </Panel>
        ) : null}
        <Panel aria-labelledby="workflow-heading">
          <PanelHeader>
            <div>
              <PanelTitle id="workflow-heading">Workflow queue</PanelTitle>
              <PanelSubtitle>Priority hand-offs</PanelSubtitle>
            </div>
            <TrendingUp aria-hidden="true" size={17} />
          </PanelHeader>
          {workflowQueue.length ? (
            workflowQueue.map((item) => {
              const ItemIcon = item.icon;
              return (
                <QueueItem href={item.href} key={item.id}>
                  <QueueIcon $tone={item.tone}>
                    <ItemIcon aria-hidden="true" size={16} />
                  </QueueIcon>
                  <QueueBody>
                    <QueueTop>
                      <QueueId>{item.id}</QueueId>
                      <Badge variant={item.variant}>{item.state}</Badge>
                    </QueueTop>
                    <QueueTitle>{item.label}</QueueTitle>
                    <QueueMeta>{item.meta}</QueueMeta>
                  </QueueBody>
                </QueueItem>
              );
            })
          ) : (
            <EmptyState
              compact
              description="Nothing is waiting on you right now."
              title="Queue is clear"
            />
          )}
        </Panel>
      </MainGrid>
      <SectionBlock aria-labelledby="signals-heading">
        <SectionHeading>
          <SectionTitle id="signals-heading">Operational signals</SectionTitle>
          <SectionSubtitle>What needs a closer look</SectionSubtitle>
        </SectionHeading>
        <Signals>
          {showLowStockAlerts ? (
            <Signal
              description={
                lowStockMaterialNames.length
                  ? `${lowStockMaterialNames.join(", ")} need replenishment planning.`
                  : "All materials are within planned thresholds."
              }
              href="/inventory/low-stock"
              icon={CircleAlert}
              label="Low-stock materials"
              tone="warning"
              value={`${lowStockItems.length} SKUs`}
            />
          ) : null}
          <Signal
            description={`${inwardRecords.length} goods-inward records on file, ${pendingInwardCount} awaiting inspection.`}
            href="/inward"
            icon={Truck}
            label="Awaiting QC inspection"
            tone="info"
            value={`${pendingQcCount} inspections`}
          />
          <Signal
            description="Accepted quantity share across every recorded inspection."
            href="/quality-control"
            icon={CheckCircle2}
            label="QC pass rate"
            tone="success"
            value={formatPercent(qcPassRate, { valueIsPercent: true })}
          />
        </Signals>
      </SectionBlock>
      {showMaterialIntelligence ? <MaterialIntelligencePanel /> : null}
    </Root>
  );
}

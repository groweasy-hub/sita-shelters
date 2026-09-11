"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ClipboardList,
  IndianRupee,
  ShoppingCart,
} from "lucide-react";
import styled from "styled-components";

import {
  DataTable,
  KpiCard,
  KpiGrid,
  PageHeader,
  StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryScreen, useAllInventoryItems } from "@/features/inventory";
import {
  consumptionColumns,
  useAllConsumptionEntries,
} from "@/features/consumption";
import { indentColumns, useAllIndents } from "@/features/indents";
import { inwardColumns, useAllInwardRecords } from "@/features/inward";
import {
  purchaseOrderColumns,
  useAllPurchaseOrders,
} from "@/features/procurement";
import {
  ConsumptionReportTab,
  DamageReportTab,
  InventoryReportTab,
  ProcurementReportTab,
  TransferReportTab,
} from "@/features/reports";
import { resourcesColumns, useAllResources } from "@/features/resources";
import {
  stockTransfersColumns,
  useAllStockTransfers,
} from "@/features/stock-transfers";
import { formatCurrency, formatDate, formatQuantity } from "@/lib/formatters";
import { getMaterialByCode } from "@/lib/mock-data/materials";
import { getUserName } from "@/lib/mock-data/users";
import { useProject } from "../hooks/use-projects";

function ProjectScopedTable({
  ariaLabel,
  columns,
  data,
  emptyDescription,
  emptyTitle,
  href,
  linkLabel,
}) {
  if (!data.length) {
    return (
      <Panel>
        <EmptyState
          action={
            href ? (
              <Button asChild size="sm" variant="outline">
                <Link href={href}>{linkLabel}</Link>
              </Button>
            ) : undefined
          }
          description={emptyDescription}
          title={emptyTitle}
        />
      </Panel>
    );
  }
  return (
    <DataTable
      ariaLabel={ariaLabel}
      columns={columns}
      data={data}
      search={false}
      toolbarActions={
        href ? (
          <Button asChild size="sm" variant="outline">
            <Link href={href}>{linkLabel}</Link>
          </Button>
        ) : undefined
      }
    />
  );
}

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
  }
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`;
const Grid = styled.div`
  display: grid;
  gap: 1.5rem;
  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  }
`;
const Overview = styled.div`
  display: grid;
  gap: 1.5rem;
`;
const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const PanelHeader = styled.header`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.875rem;
  font-weight: 650;
`;
const DefinitionGrid = styled.dl`
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  margin: 0;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  dt {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: ${({ theme }) => theme.colors.mutedForeground};
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    svg {
      width: 0.75rem;
      height: 0.75rem;
    }
  }
  dd {
    margin: 0.25rem 0 0;
    font-size: 0.9375rem;
    font-weight: 600;
  }
`;
const SiteAddress = styled.address`
  display: grid;
  gap: 0.25rem;
  padding: 1.25rem;
  font-size: 0.9375rem;
  font-style: normal;
  font-weight: 550;
  line-height: 1.5;
`;
const Landmark = styled.span`
  margin-top: 0.25rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  font-weight: 500;
`;
const TopMaterialRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8125rem;
  &:last-child {
    border-bottom: 0;
  }
`;

const TAB_ITEMS = [
  { value: "overview", label: "Overview" },
  { value: "inventory", label: "Inventory" },
  { value: "indents", label: "Indents" },
  { value: "procurement", label: "Procurement" },
  { value: "inward", label: "Inward" },
  { value: "consumption", label: "Consumption" },
  { value: "transfers", label: "Transfers" },
  { value: "resources", label: "Resources" },
  { value: "reports", label: "Reports" },
];

export function ProjectDetailScreen({ projectId }) {
  const router = useRouter();
  const { data: project, isLoading } = useProject(projectId);
  const { data: inventoryItems = [] } = useAllInventoryItems();
  const { data: consumptionEntries = [] } = useAllConsumptionEntries();
  const { data: stockTransfers = [] } = useAllStockTransfers();
  const { data: resources = [] } = useAllResources();
  const { data: indents = [] } = useAllIndents();
  const { data: purchaseOrders = [] } = useAllPurchaseOrders();
  const { data: inwardRecords = [] } = useAllInwardRecords();
  if (isLoading) {
    return <LoadingState label="Loading project" variant="page" />;
  }
  if (!project) {
    return (
      <EmptyState
        action={
          <Button onClick={() => router.push("/projects")} variant="outline">
            Back to projects
          </Button>
        }
        description="This project may have been archived or removed."
        title="Project not found"
      />
    );
  }
  const projectStock = inventoryItems.filter(
    (item) => item.projectId === project.id,
  );
  const topMaterials = [...projectStock]
    .sort((first, second) => {
      const firstValue =
        first.availableQuantity *
        (getMaterialByCode(first.materialCode)?.lastPurchasePrice ?? 0);
      const secondValue =
        second.availableQuantity *
        (getMaterialByCode(second.materialCode)?.lastPurchasePrice ?? 0);
      return secondValue - firstValue;
    })
    .slice(0, 6);
  return (
    <Root>
      <div>
        <BackLink href="/projects">
          <ArrowLeft aria-hidden="true" />
          Back to projects
        </BackLink>
      </div>
      <PageHeader
        description={project.description}
        eyebrow={`${project.code} · ${project.location}`}
        meta={<StatusBadge status={project.status} />}
        title={project.name}
      />
      <KpiGrid>
        <KpiCard
          icon={IndianRupee}
          label="Inventory value"
          value={formatCurrency(project.inventoryValue, {
            maximumFractionDigits: 0,
          })}
        />
        <KpiCard
          icon={ClipboardList}
          label="Active indents"
          value={project.activeIndents}
        />
        <KpiCard
          icon={ShoppingCart}
          label="Pending procurement"
          value={project.pendingProcurement}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Low stock alerts"
          tone="warning"
          value={project.lowStockAlerts}
        />
      </KpiGrid>
      <Tabs defaultValue="overview">
        <TabsList>
          {TAB_ITEMS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview">
          <Overview>
            <Grid>
              <Panel>
                <PanelHeader>Project details</PanelHeader>
                <DefinitionGrid>
                  <div>
                    <dt>Project code</dt>
                    <dd>{project.code}</dd>
                  </div>
                  <div>
                    <dt>Project manager</dt>
                    <dd>{getUserName(project.projectManagerId)}</dd>
                  </div>
                  <div>
                    <dt>
                      <Calendar aria-hidden="true" />
                      Start date
                    </dt>
                    <dd>{formatDate(project.startDate)}</dd>
                  </div>
                  <div>
                    <dt>
                      <Calendar aria-hidden="true" />
                      Estimated completion
                    </dt>
                    <dd>{formatDate(project.estimatedCompletionDate)}</dd>
                  </div>
                  <div>
                    <dt>Completion</dt>
                    <dd>{project.progressPercent}%</dd>
                  </div>
                  <div>
                    <dt>Materials tracked</dt>
                    <dd>{projectStock.length}</dd>
                  </div>
                </DefinitionGrid>
              </Panel>
              <Panel>
                <PanelHeader>Site address</PanelHeader>
                <SiteAddress aria-label="Complete site address">
                  <span>{project.address.line1}</span>
                  {project.address.line2 ? (
                    <span>{project.address.line2}</span>
                  ) : null}
                  <span>
                    {project.address.city}, {project.address.state}{" "}
                    {project.address.postalCode}
                  </span>
                  <span>{project.address.country}</span>
                  {project.address.landmark ? (
                    <Landmark>Landmark: {project.address.landmark}</Landmark>
                  ) : null}
                </SiteAddress>
              </Panel>
            </Grid>
            <Panel>
              <PanelHeader>Highest-value stock</PanelHeader>
              {topMaterials.length ? (
                topMaterials.map((item) => (
                  <TopMaterialRow key={item.id}>
                    <Link
                      href={`/materials/${getMaterialByCode(item.materialCode)?.id ?? ""}`}
                    >
                      {item.materialName}
                    </Link>
                    <span>
                      {formatQuantity(item.availableQuantity, item.unit)}
                    </span>
                  </TopMaterialRow>
                ))
              ) : (
                <EmptyState
                  compact
                  description="No stock recorded for this project yet."
                  title="No stock"
                />
              )}
            </Panel>
          </Overview>
        </TabsContent>
        <TabsContent value="inventory">
          <InventoryScreen
            description={`Stock physically held at ${project.name}.`}
            eyebrow="Project stock"
            forcedProjectId={project.id}
            title="Project Inventory"
          />
        </TabsContent>
        <TabsContent value="indents">
          <ProjectScopedTable
            ariaLabel="Project indents"
            columns={indentColumns}
            data={indents.filter((indent) => indent.projectId === project.id)}
            emptyDescription="No material requirement has been raised for this project yet."
            emptyTitle="No indents yet"
            href="/indents"
            linkLabel="View all indents"
          />
        </TabsContent>
        <TabsContent value="procurement">
          <ProjectScopedTable
            ariaLabel="Project purchase orders"
            columns={purchaseOrderColumns}
            data={purchaseOrders.filter((po) => po.projectId === project.id)}
            emptyDescription="No purchase order has been raised for this project yet."
            emptyTitle="No procurement activity yet"
            href="/procurement/purchase-orders"
            linkLabel="View all procurement"
          />
        </TabsContent>
        <TabsContent value="inward">
          <ProjectScopedTable
            ariaLabel="Project goods inward"
            columns={inwardColumns}
            data={inwardRecords.filter(
              (record) => record.projectId === project.id,
            )}
            emptyDescription="No goods have been received at this project's site yet."
            emptyTitle="No inward records yet"
            href="/inward"
            linkLabel="View all goods inward"
          />
        </TabsContent>
        <TabsContent value="consumption">
          <ProjectScopedTable
            ariaLabel="Project consumption"
            columns={consumptionColumns}
            data={consumptionEntries.filter(
              (entry) => entry.projectId === project.id,
            )}
            emptyDescription="No consumption has been recorded for this project yet."
            emptyTitle="No consumption recorded yet"
            href="/consumption"
            linkLabel="View all consumption"
          />
        </TabsContent>
        <TabsContent value="transfers">
          <ProjectScopedTable
            ariaLabel="Project transfers"
            columns={stockTransfersColumns}
            data={stockTransfers.filter(
              (transfer) =>
                transfer.sourceProjectId === project.id ||
                transfer.destinationProjectId === project.id,
            )}
            emptyDescription="No inter-project transfers involve this project yet."
            emptyTitle="No transfers yet"
            href="/stock-transfers"
            linkLabel="View all transfers"
          />
        </TabsContent>
        <TabsContent value="resources">
          <ProjectScopedTable
            ariaLabel="Project resources"
            columns={resourcesColumns}
            data={resources.filter(
              (resource) => resource.currentProjectId === project.id,
            )}
            emptyDescription="No machinery, equipment or vehicles are currently assigned to this project."
            emptyTitle="No resources assigned yet"
            href="/resources"
            linkLabel="View all resources"
          />
        </TabsContent>
        <TabsContent value="reports">
          <Tabs defaultValue="report-inventory">
            <TabsList>
              <TabsTrigger value="report-inventory">Inventory</TabsTrigger>
              <TabsTrigger value="report-consumption">Consumption</TabsTrigger>
              <TabsTrigger value="report-procurement">Procurement</TabsTrigger>
              <TabsTrigger value="report-transfers">Transfers</TabsTrigger>
              <TabsTrigger value="report-damage">Damage &amp; wastage</TabsTrigger>
            </TabsList>
            <TabsContent value="report-inventory">
              <InventoryReportTab projectId={project.id} />
            </TabsContent>
            <TabsContent value="report-consumption">
              <ConsumptionReportTab projectId={project.id} />
            </TabsContent>
            <TabsContent value="report-procurement">
              <ProcurementReportTab projectId={project.id} />
            </TabsContent>
            <TabsContent value="report-transfers">
              <TransferReportTab projectId={project.id} />
            </TabsContent>
            <TabsContent value="report-damage">
              <DamageReportTab projectId={project.id} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </Root>
  );
}

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  MapPin,
  Wrench,
} from "lucide-react";
import styled from "styled-components";

import { KpiCard, KpiGrid, PageHeader, StatusBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getProjectName } from "@/lib/mock-data/projects";
import { getUserName } from "@/lib/mock-data/users";
import {
  getMaintenanceTypeLabel,
  getResourceCategoryLabel,
} from "../constants/resources.constants";
import { useResource } from "../hooks/use-resources";
import { useResourceAssignments } from "../hooks/use-resource-assignments";
import { useResourceMaintenance } from "../hooks/use-resource-maintenance";

const Root = styled.div`
  display: grid;
  max-width: 84rem;
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
    color: ${({ theme }) => theme.colors.mutedForeground};
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  dd {
    margin: 0.25rem 0 0;
    font-size: 0.9375rem;
    font-weight: 600;
  }
`;
const RowHead = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 7rem 7rem minmax(0, 1fr);
  gap: 1rem;
  padding: 0.625rem 1.25rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.7rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const AssignmentRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 7rem 7rem minmax(0, 1fr);
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8125rem;
  &:last-child {
    border-bottom: 0;
  }
`;
const MaintenanceRowHead = styled.div`
  display: grid;
  grid-template-columns: 6.5rem 8rem minmax(0, 1fr) 6rem minmax(0, 10rem) 6.5rem;
  gap: 1rem;
  padding: 0.625rem 1.25rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.7rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const MaintenanceRow = styled(MaintenanceRowHead)`
  padding: 0.75rem 1.25rem;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.8125rem;
  font-weight: 400;
  text-transform: none;
  letter-spacing: normal;
  &:last-child {
    border-bottom: 0;
  }
`;
const Num = styled.span`
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

function daysSince(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
}

export function ResourceDetailScreen({ resourceId }) {
  const router = useRouter();
  const { data: resource } = useResource(resourceId);
  const { data: allAssignments = [] } = useResourceAssignments();
  const { data: allMaintenance = [] } = useResourceMaintenance();
  const assignments = useMemo(
    () =>
      allAssignments.filter(
        (assignment) => assignment.resourceId === resourceId,
      ),
    [allAssignments, resourceId],
  );
  const maintenanceRecords = useMemo(
    () => allMaintenance.filter((record) => record.resourceId === resourceId),
    [allMaintenance, resourceId],
  );
  if (!resource) {
    return (
      <EmptyState
        action={
          <Button onClick={() => router.push("/resources")} variant="outline">
            Back to resources
          </Button>
        }
        description="This resource may have been retired or removed from the register."
        title="Resource not found"
      />
    );
  }
  const daysInAssignment = resource.assignedSince
    ? daysSince(resource.assignedSince)
    : null;
  return (
    <Root>
      <div>
        <BackLink href="/resources">
          <ArrowLeft aria-hidden="true" />
          Back to resources
        </BackLink>
      </div>
      <PageHeader
        description={resource.specification}
        eyebrow={getResourceCategoryLabel(resource.category)}
        meta={
          <>
            <Badge variant="outline">{resource.id}</Badge>
            <StatusBadge status={resource.status} />
          </>
        }
        title={resource.name}
      />
      <KpiGrid>
        <KpiCard
          icon={MapPin}
          label="Current project"
          value={
            resource.currentProjectId
              ? getProjectName(resource.currentProjectId)
              : "At yard"
          }
        />
        <KpiCard
          icon={CalendarClock}
          label="Days in current assignment"
          value={daysInAssignment === null ? "—" : daysInAssignment}
        />
        <KpiCard
          icon={ClipboardList}
          label="Maintenance events"
          value={maintenanceRecords.length}
        />
        <KpiCard
          icon={Wrench}
          label="Next maintenance due"
          value={formatDate(resource.nextMaintenanceDueDate)}
        />
      </KpiGrid>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignment history</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance history</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Panel>
            <PanelHeader>Asset details</PanelHeader>
            <DefinitionGrid>
              <div>
                <dt>Asset ID</dt>
                <dd>{resource.id}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{getResourceCategoryLabel(resource.category)}</dd>
              </div>
              <div>
                <dt>Specification</dt>
                <dd>{resource.specification}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusBadge status={resource.status} />
                </dd>
              </div>
              <div>
                <dt>Daily rental cost</dt>
                <dd>{formatCurrency(resource.dailyRentalCost)}</dd>
              </div>
              <div>
                <dt>Assigned since</dt>
                <dd>
                  {resource.assignedSince
                    ? formatDate(resource.assignedSince)
                    : "Not currently assigned"}
                </dd>
              </div>
              <div>
                <dt>Last maintenance</dt>
                <dd>{formatDate(resource.lastMaintenanceDate)}</dd>
              </div>
              <div>
                <dt>Next maintenance due</dt>
                <dd>{formatDate(resource.nextMaintenanceDueDate)}</dd>
              </div>
            </DefinitionGrid>
          </Panel>
        </TabsContent>
        <TabsContent value="assignments">
          <Panel>
            <PanelHeader>Project assignments</PanelHeader>
            {assignments.length ? (
              <div>
                <RowHead>
                  <span>Project</span>
                  <span>From</span>
                  <span>To</span>
                  <span>Assigned by</span>
                </RowHead>
                {assignments.map((assignment) => (
                  <AssignmentRow key={assignment.id}>
                    <Link href={`/projects/${assignment.projectId}`}>
                      {getProjectName(assignment.projectId)}
                    </Link>
                    <span>{formatDate(assignment.assignedFrom)}</span>
                    <span>
                      {assignment.assignedTo ? (
                        formatDate(assignment.assignedTo)
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </span>
                    <span>{getUserName(assignment.assignedById)}</span>
                  </AssignmentRow>
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                description="This resource has no recorded project assignments yet."
                title="No assignment history"
              />
            )}
          </Panel>
        </TabsContent>
        <TabsContent value="maintenance">
          <Panel>
            <PanelHeader>Maintenance records</PanelHeader>
            {maintenanceRecords.length ? (
              <div>
                <MaintenanceRowHead>
                  <span>Date</span>
                  <span>Type</span>
                  <span>Description</span>
                  <Num>Cost</Num>
                  <span>Performed by</span>
                  <span>Status</span>
                </MaintenanceRowHead>
                {maintenanceRecords.map((record) => (
                  <MaintenanceRow key={record.id}>
                    <span>{formatDate(record.date)}</span>
                    <span>{getMaintenanceTypeLabel(record.type)}</span>
                    <span>{record.description}</span>
                    <Num>{formatCurrency(record.cost)}</Num>
                    <span>{record.performedBy}</span>
                    <span>
                      <StatusBadge status={record.status} />
                    </span>
                  </MaintenanceRow>
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                description="No maintenance has been recorded for this resource yet."
                title="No maintenance history"
              />
            )}
          </Panel>
        </TabsContent>
      </Tabs>
    </Root>
  );
}

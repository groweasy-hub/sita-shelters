"use client";

import { useMemo, useState } from "react";
import { CircleCheckBig, Route } from "lucide-react";
import styled from "styled-components";

import { DataTable, PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ALL_PROJECTS_VALUE, PROJECT_OPTIONS } from "@/config/constants";
import { formatCompactNumber } from "@/lib/formatters";
import { getProjectName } from "@/lib/mock-data/projects";
import { getUserName } from "@/lib/mock-data/users";
import { RESOURCE_CATEGORY_OPTIONS } from "../constants/resources.constants";
import { useAllResources } from "../hooks/use-resources";
import { useResourceAssignments } from "../hooks/use-resource-assignments";
import { resourceAssignmentsColumns } from "./resource-assignments-columns";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const TableEmptyState = styled.div`
  padding: 1rem;
  text-align: center;
`;
const ALL_VALUE = "all";

export function ResourceAssignmentsScreen() {
  const { data: assignments = [] } = useResourceAssignments();
  const { data: resources = [] } = useAllResources();
  const [projectId, setProjectId] = useState(null);
  const [category, setCategory] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const resourcesById = useMemo(() => {
    const map = new Map();
    resources.forEach((resource) => map.set(resource.id, resource));
    return map;
  }, [resources]);
  const rows = useMemo(() => {
    return assignments
      .map((assignment) => {
        const resource = resourcesById.get(assignment.resourceId);
        return {
          ...assignment,
          resourceName: resource?.name ?? assignment.resourceId,
          resourceCategory: resource?.category ?? null,
          projectName: getProjectName(assignment.projectId),
          assignedByName: getUserName(assignment.assignedById),
        };
      })
      .filter(
        (row) =>
          (!projectId || row.projectId === projectId) &&
          (!category || row.resourceCategory === category) &&
          (!activeOnly || row.assignedTo === null),
      );
  }, [assignments, resourcesById, projectId, category, activeOnly]);
  const activeCount = rows.filter((row) => row.assignedTo === null).length;
  return (
    <Root>
      <PageHeader
        description="Every deployment of a resource to a project — current and historical — across the register."
        eyebrow="Resource planning"
        meta={
          <Badge variant="outline">
            {formatCompactNumber(assignments.length)} assignment records
          </Badge>
        }
        title="Resource Assignments"
      />
      <DataTable
        ariaLabel="Resource assignments"
        columns={resourceAssignmentsColumns}
        data={rows}
        emptyState={
          <TableEmptyState>
            <Route aria-hidden="true" size={20} />
            <p>No assignment records match the current filters.</p>
          </TableEmptyState>
        }
        filters={
          <>
            <Select
              onValueChange={(value) =>
                setProjectId(value === ALL_PROJECTS_VALUE ? null : value)
              }
              value={projectId ?? ALL_PROJECTS_VALUE}
            >
              <SelectTrigger aria-label="Filter by project" size="sm">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_PROJECTS_VALUE}>All Projects</SelectItem>
                {PROJECT_OPTIONS.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) =>
                setCategory(value === ALL_VALUE ? "" : value)
              }
              value={category || ALL_VALUE}
            >
              <SelectTrigger aria-label="Filter by resource category" size="sm">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All categories</SelectItem>
                {RESOURCE_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              aria-pressed={activeOnly}
              onClick={() => setActiveOnly((value) => !value)}
              size="sm"
              variant={activeOnly ? "default" : "outline"}
            >
              <CircleCheckBig aria-hidden="true" />
              Active only ({activeCount})
            </Button>
          </>
        }
        initialState={{ sorting: [{ id: "assignedFrom", desc: true }] }}
        onResetFilters={() => {
          setProjectId(null);
          setCategory("");
          setActiveOnly(false);
        }}
        search={{ placeholder: "Search resource, project or asset ID" }}
      />
    </Root>
  );
}

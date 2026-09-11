"use client";

import { Building2, Globe2 } from "lucide-react";
import styled from "styled-components";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_PROJECTS_VALUE, PROJECT_OPTIONS } from "@/config/constants";
import { useProjectContextStore } from "@/stores/project-context-store";

const Trigger = styled(SelectTrigger)`
  width: 10.5rem;
  background: ${({ theme }) => theme.colors.card};
  @media (min-width: 640px) {
    width: 12.5rem;
  }
`;
const LeadingIcon = styled.span`
  display: inline-flex;
  margin-right: 0.25rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
`;

export function ProjectSwitcher() {
  const selectedProjectId = useProjectContextStore(
    (state) => state.selectedProjectId,
  );
  const setSelectedProject = useProjectContextStore(
    (state) => state.setSelectedProject,
  );
  return (
    <Select
      onValueChange={(value) =>
        setSelectedProject(value === ALL_PROJECTS_VALUE ? null : value)
      }
      value={selectedProjectId ?? ALL_PROJECTS_VALUE}
    >
      <Trigger aria-label="Select active project" size="sm">
        <LeadingIcon>
          {selectedProjectId ? (
            <Building2 aria-hidden="true" size={14} />
          ) : (
            <Globe2 aria-hidden="true" size={14} />
          )}
        </LeadingIcon>
        <SelectValue placeholder="All projects" />
      </Trigger>
      <SelectContent align="end">
        <SelectItem value={ALL_PROJECTS_VALUE}>All Projects</SelectItem>
        {PROJECT_OPTIONS.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

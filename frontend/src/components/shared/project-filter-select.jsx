"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_PROJECTS_VALUE } from "@/config/constants";
import { useProjectDirectory } from "@/hooks";

/**
 * The project filter used on every operational list screen (Indents,
 * Inventory, Inward, QC, Material Issues, Consumption, Returns). Reads a
 * project-scoped role's `useProjectScope()` result: renders nothing when the
 * role is locked to a single project (nothing to pick), narrows the option
 * list to just their assigned projects when they have a few, and behaves
 * exactly as a plain "All Projects" filter for workspace-wide roles.
 */
export function ProjectFilterSelect({
  ariaLabel = "Filter by project",
  isLocked,
  onChange,
  scopeProjectIds,
  value,
}) {
  const { data: allProjects = [] } = useProjectDirectory();
  if (isLocked) {
    return null;
  }
  const options = scopeProjectIds
    ? allProjects.filter((project) => scopeProjectIds.includes(project.id))
    : allProjects;
  return (
    <Select
      onValueChange={(next) => onChange(next === ALL_PROJECTS_VALUE ? null : next)}
      value={value ?? ALL_PROJECTS_VALUE}
    >
      <SelectTrigger aria-label={ariaLabel} size="sm">
        <SelectValue placeholder="All projects" />
      </SelectTrigger>
      <SelectContent>
        {scopeProjectIds ? null : (
          <SelectItem value={ALL_PROJECTS_VALUE}>All Projects</SelectItem>
        )}
        {options.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

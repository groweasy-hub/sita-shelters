"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsQueryKeys } from "../constants/projects.constants";
import { projectsService } from "../services/projects.service";

export function useProjects(options = {}) {
  return useQuery({
    enabled: options.enabled ?? true,
    queryKey: projectsQueryKeys.lists(),
    queryFn: () => projectsService.list(),
    initialData: () => projectsService.listSnapshot(),
    // Metrics are derived from indents/procurement/stock, so re-check on every mount.
    staleTime: 0,
  });
}
export function useProject(projectId) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: projectsQueryKeys.detail(projectId),
    queryFn: () => projectsService.get(projectId),
    enabled: Boolean(projectId),
    initialData: () => {
      const projectFromList = queryClient
        .getQueryData(projectsQueryKeys.lists())
        ?.find((project) => project.id === projectId);
      return projectFromList ?? projectsService.getSnapshot(projectId);
    },
    // Metrics are derived from indents/procurement/stock, so re-check on every mount.
    staleTime: 0,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => projectsService.create(payload),
    onSuccess: (project) => {
      queryClient.setQueryData(projectsQueryKeys.lists(), (projects = []) => [
        project,
        ...projects.filter((candidate) => candidate.id !== project.id),
      ]);
      queryClient.setQueryData(projectsQueryKeys.detail(project.id), project);
      queryClient.invalidateQueries({ queryKey: ["project-directory"] });
    },
  });
}

export function useUpdateProjectProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, ...payload }) =>
      projectsService.updateProgress(projectId, payload),
    onSuccess: (project) => {
      if (!project) return;
      queryClient.setQueryData(projectsQueryKeys.lists(), (projects = []) =>
        projects.map((candidate) =>
          candidate.id === project.id ? project : candidate,
        ),
      );
      queryClient.setQueryData(projectsQueryKeys.detail(project.id), project);
      queryClient.invalidateQueries({ queryKey: ["project-directory"] });
    },
  });
}

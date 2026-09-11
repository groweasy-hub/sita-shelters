"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsQueryKeys } from "../constants/projects.constants";
import { projectsService } from "../services/projects.service";

export function useProjects() {
  return useQuery({
    queryKey: projectsQueryKeys.lists(),
    queryFn: () => projectsService.list(),
    initialData: () => projectsService.listSnapshot(),
    staleTime: Infinity,
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
    staleTime: Infinity,
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
    },
  });
}

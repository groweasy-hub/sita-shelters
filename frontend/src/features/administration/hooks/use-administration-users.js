"use client";
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { projectsQueryKeys } from "@/features/projects";
import { administrationQueryKeys } from "../constants/administration.constants";
import { adminUserListParamsSchema } from "../schemas/administration.schema";
import { administrationUsersService } from "../services/administration.service";

export function administrationUsersListQueryOptions(params = {}) {
  const normalizedParams = adminUserListParamsSchema.parse(params);
  return queryOptions({
    queryKey: administrationQueryKeys.usersList(normalizedParams),
    queryFn: ({ signal }) =>
      administrationUsersService.list(normalizedParams, { signal }),
    placeholderData: keepPreviousData,
  });
}
export function useAdministrationUsers(params = {}) {
  return useQuery(administrationUsersListQueryOptions(params));
}
export function useAdministrationUser(userId) {
  return useQuery({
    queryKey: administrationQueryKeys.usersDetail(userId),
    queryFn: () => administrationUsersService.get(userId),
    enabled: Boolean(userId),
  });
}
export function useAllAdministrationUsers() {
  return useQuery({
    queryKey: administrationQueryKeys.usersAll(),
    queryFn: () => administrationUsersService.listAll(),
    staleTime: Infinity,
  });
}
export function useCreateAdministrationUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => administrationUsersService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: administrationQueryKeys.users() });
      // A new project-manager can update the projects they're assigned to.
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
  });
}
export function useUploadUserAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, file }) =>
      administrationUsersService.uploadAvatar(userId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: administrationQueryKeys.users() });
    },
  });
}
export function useRemoveUserAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => administrationUsersService.removeAvatar(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: administrationQueryKeys.users() });
    },
  });
}

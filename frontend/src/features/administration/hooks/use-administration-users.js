"use client";
import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { administrationQueryKeys } from "../constants/administration.constants";
import { adminUserListParamsSchema } from "../schemas/administration.schema";
import { administrationUsersService } from "../services/administration.service";

export function administrationUsersListQueryOptions(params = {}) {
  const normalizedParams = adminUserListParamsSchema.parse(params);
  return queryOptions({
    queryKey: administrationQueryKeys.usersList(normalizedParams),
    queryFn: ({ signal }) =>
      administrationUsersService.list(normalizedParams, { signal }),
    initialData: () => administrationUsersService.list(normalizedParams),
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
    initialData: () => administrationUsersService.get(userId),
  });
}
export function useAllAdministrationUsers() {
  return useQuery({
    queryKey: administrationQueryKeys.usersAll(),
    queryFn: () => administrationUsersService.listAll(),
    initialData: () => administrationUsersService.listAll(),
    staleTime: Infinity,
  });
}

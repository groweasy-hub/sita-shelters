import { USERS } from "@/lib/mock-data/users";
import { ADMIN_USER_ACCOUNT_DETAILS } from "../constants/administration.constants";
import {
  adminUserListParamsSchema,
  adminUserListResultSchema,
  adminUserSchema,
  adminUsersSchema,
} from "../schemas/administration.schema";

/**
 * Layer presentation-only account fields onto the canonical `USERS` list
 * without mutating the shared mock-data module.
 */
function buildAdministrationUsers() {
  return USERS.map((user) => ({
    ...user,
    ...ADMIN_USER_ACCOUNT_DETAILS[user.id],
  }));
}
const mockAdministrationUsers = adminUsersSchema.parse(
  buildAdministrationUsers(),
);
function matchesSearch(user, search) {
  if (!search) return true;
  const haystack = [user.name, user.email].join(" ").toLocaleLowerCase();
  return haystack.includes(search.toLocaleLowerCase());
}
function compareAdministrationUsers(first, second, field) {
  const firstValue = first[field];
  const secondValue = second[field];
  if (firstValue === null && secondValue === null) return 0;
  if (firstValue === null) return -1;
  if (secondValue === null) return 1;
  return String(firstValue).localeCompare(String(secondValue), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}
export const mockAdministrationUsersAdapter = {
  list(params, options) {
    options?.signal?.throwIfAborted();
    const filtered = mockAdministrationUsers.filter(
      (user) =>
        (!params.role || user.role === params.role) &&
        (!params.status || user.status === params.status) &&
        matchesSearch(user, params.search),
    );
    const direction = params.sortDirection === "asc" ? 1 : -1;
    const sorted = [...filtered].sort(
      (first, second) =>
        compareAdministrationUsers(first, second, params.sortBy) * direction,
    );
    const start = (params.page - 1) * params.pageSize;
    return {
      items: sorted.slice(start, start + params.pageSize),
      total: sorted.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  },
  get(userId) {
    return mockAdministrationUsers.find((user) => user.id === userId) ?? null;
  },
  listAll() {
    return mockAdministrationUsers;
  },
};
export function createAdministrationUsersService(adapter) {
  return {
    list(params = {}, options = {}) {
      const normalizedParams = adminUserListParamsSchema.parse(params);
      const result = adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return adminUserListResultSchema.parse(result);
    },
    get(userId) {
      const user = adapter.get(userId);
      return user ? adminUserSchema.parse(user) : null;
    },
    listAll() {
      return adapter.listAll();
    },
  };
}
export const administrationUsersService = createAdministrationUsersService(
  mockAdministrationUsersAdapter,
);

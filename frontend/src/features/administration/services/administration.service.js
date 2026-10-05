import { apiClient } from "@/lib/api-client";
import { HttpError } from "@/services/http-client";
import { USERS } from "@/lib/mock-data/users";
import { ADMIN_USER_ACCOUNT_DETAILS } from "../constants/administration.constants";
import {
  adminUserListParamsSchema,
  adminUserListResultSchema,
  adminUserSchema,
  adminUsersSchema,
  createAdminUserInputSchema,
  createAdminUserResultSchema,
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
function paginate(items, params) {
  const filtered = items.filter(
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
}
export const mockAdministrationUsersAdapter = {
  list(params, options) {
    options?.signal?.throwIfAborted();
    return paginate(mockAdministrationUsers, params);
  },
  get(userId) {
    return mockAdministrationUsers.find((user) => user.id === userId) ?? null;
  },
  listAll() {
    return mockAdministrationUsers;
  },
};

/**
 * Browser-safe adapter for the durable user directory API. Filtering,
 * sorting and pagination run client-side over the full roster (same logic
 * as `mockAdministrationUsersAdapter`) since the roster is small; there is
 * one endpoint (`/api/administration/users`) backing `list`, `get` and
 * `listAll`.
 */
export const apiAdministrationUsersAdapter = {
  async list(params, options) {
    options?.signal?.throwIfAborted();
    const items = await apiClient.get("/api/administration/users", {
      signal: options?.signal,
    });
    return paginate(items, params);
  },
  async get(userId) {
    const items = await apiClient.get("/api/administration/users");
    return items.find((user) => user.id === userId) ?? null;
  },
  listAll() {
    return apiClient.get("/api/administration/users");
  },
  async create(input) {
    try {
      return await apiClient.post("/api/administration/users", { body: input });
    } catch (error) {
      if (error instanceof HttpError) {
        // Surface the server's own reason (e.g. "A user with email … already
        // exists") rather than a bare "Request failed with status 409".
        const reason =
          error.body?.issues?.[0]?.message ??
          (typeof error.body?.error === "string" ? error.body.error : null);
        if (reason) {
          throw new Error(reason, { cause: error });
        }
      }
      throw error;
    }
  },
  uploadAvatar(userId, file) {
    const body = new FormData();
    body.append("image", file);
    return apiClient.post(
      `/api/administration/users/${encodeURIComponent(userId)}/avatar`,
      { body },
    );
  },
  removeAvatar(userId) {
    return apiClient.delete(
      `/api/administration/users/${encodeURIComponent(userId)}/avatar`,
    );
  },
};

export function createAdministrationUsersService(adapter) {
  return {
    async list(params = {}, options = {}) {
      const normalizedParams = adminUserListParamsSchema.parse(params);
      const result = await adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return adminUserListResultSchema.parse(result);
    },
    async get(userId) {
      const user = await adapter.get(userId);
      return user ? adminUserSchema.parse(user) : null;
    },
    async listAll() {
      return adapter.listAll();
    },
    async create(input) {
      const normalized = createAdminUserInputSchema.parse(input);
      const result = await adapter.create(normalized);
      return createAdminUserResultSchema.parse(result);
    },
    async uploadAvatar(userId, file) {
      const user = await adapter.uploadAvatar(userId, file);
      return adminUserSchema.parse(user);
    },
    async removeAvatar(userId) {
      const user = await adapter.removeAvatar(userId);
      return adminUserSchema.parse(user);
    },
  };
}
export const administrationUsersService = createAdministrationUsersService(
  apiAdministrationUsersAdapter,
);

import { HttpError } from "@/services/http-client";
import { apiClient } from "@/lib/api-client";

export function login({ email, password }) {
  return apiClient.post("/api/auth/login", { body: { email, password } });
}

export function requestPasswordReset({ email }) {
  return apiClient.post("/api/auth/forgot-password", { body: { email } });
}

export function resetPassword({ token, password }) {
  return apiClient.post("/api/auth/reset-password", {
    body: { token, password },
  });
}

export async function logout() {
  await apiClient.post("/api/auth/logout");
}

/** Resolves to `null` when signed out rather than throwing — that's the normal state, not an error. */
export async function fetchCurrentSession() {
  try {
    return await apiClient.get("/api/auth/me");
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

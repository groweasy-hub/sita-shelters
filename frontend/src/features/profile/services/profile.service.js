import { ROLE_ACCESS_SCOPE, ROLE_LABELS } from "@/config/permissions";
import { apiClient } from "@/lib/api-client";
import { getEmployeeDetails } from "@/lib/mock-data/employee-directory";
import { getProjectAssignments } from "@/lib/mock-data/project-assignments";
import { getUserById, getUserName } from "@/lib/mock-data/users";
import { HttpError } from "@/services/http-client";
import { DEFAULT_USER_ID } from "../constants/profile.constants";

export class ProfileServiceError extends Error {
  constructor(message, { cause, issues, status } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = "ProfileServiceError";
    this.status = status;
    this.issues = issues;
  }
}

function toProfileServiceError(error) {
  if (error instanceof HttpError) {
    const firstIssue = Array.isArray(error.body?.issues)
      ? error.body.issues[0]?.message
      : null;
    return new ProfileServiceError(
      firstIssue ??
        (typeof error.body?.error === "string"
          ? error.body.error
          : `The request failed (${error.status})`),
      {
        issues: Array.isArray(error.body?.issues) ? error.body.issues : undefined,
        status: error.status,
      },
    );
  }
  return new ProfileServiceError("Unable to reach the server. Please try again.", {
    cause: error,
  });
}

async function call(request) {
  try {
    return await request();
  } catch (error) {
    throw toProfileServiceError(error);
  }
}

/**
 * Layers presentation-only HR fields (employee directory, reporting
 * manager) onto the real signed-in user resolved by `useAuth()` — id,
 * name, email, role, mobile, projectIds, status and lastLoginAt are real,
 * backed by the standalone backend; only the HR-style extras below remain
 * mock data (no employee-directory backend exists yet).
 */
export function enrichCurrentUser(authUser) {
  if (!authUser) {
    return null;
  }
  const employee = getEmployeeDetails(authUser.id);
  // A number the user saved themselves hasn't been verified, even if the
  // directory's number for them was.
  const mobileEditedByUser = Boolean(authUser.mobile) && authUser.mobile !== employee?.mobile;
  return {
    ...employee,
    ...authUser,
    employeeId: authUser.employeeId ?? employee?.employeeId ?? null,
    department: authUser.department ?? employee?.department ?? null,
    joiningDate: authUser.joiningDate ?? employee?.joiningDate ?? null,
    designation: employee?.designation ?? ROLE_LABELS[authUser.role] ?? null,
    employmentStatus: employee?.employmentStatus ?? "Full-time",
    mobile: authUser.mobile ?? employee?.mobile ?? null,
    mobileVerified: mobileEditedByUser ? false : (employee?.mobileVerified ?? false),
    reportingManagerName:
      authUser.reportingManagerName ??
      (employee?.reportingManagerId && getUserById(employee.reportingManagerId)
        ? getUserName(employee.reportingManagerId)
        : null),
  };
}

export function getCurrentUserProjectAssignments(userId = DEFAULT_USER_ID) {
  return getProjectAssignments(userId);
}

export function getCurrentUserAccessSummary(userId = DEFAULT_USER_ID) {
  const user = getUserById(userId);
  if (!user) {
    return null;
  }
  return {
    roleLabel: ROLE_LABELS[user.role],
    accessScope: ROLE_ACCESS_SCOPE[user.role],
  };
}

/** Browser-safe adapter for the signed-in user's own account endpoints. */
export const profileService = {
  updateProfile: (input) =>
    call(() => apiClient.patch("/api/auth/profile", { body: input })),
  changePassword: (input) =>
    call(() =>
      apiClient.post("/api/auth/change-password", {
        body: {
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
        },
      }),
    ),
  listSessions: () => call(() => apiClient.get("/api/auth/sessions")),
  revokeSession: (sessionId) =>
    call(() => apiClient.delete(`/api/auth/sessions/${encodeURIComponent(sessionId)}`)),
  revokeAllSessions: () => call(() => apiClient.post("/api/auth/sessions/revoke-all")),
  listActivity: () => call(() => apiClient.get("/api/auth/activity")),
};

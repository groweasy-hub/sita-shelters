import { ROLE_ACCESS_SCOPE, ROLE_LABELS } from "@/config/permissions";
// Cross-feature import kept deliberately narrow: the Access module already
// owns per-account status/last-login mock data, and profile needs the exact
// same values for whoever is currently signed in, not a duplicate copy.
import { ADMIN_USER_ACCOUNT_DETAILS } from "@/features/administration/constants/administration.constants";
import { getActivityLog } from "@/lib/mock-data/activity-log";
import { getEmployeeDetails } from "@/lib/mock-data/employee-directory";
import { getProjectAssignments } from "@/lib/mock-data/project-assignments";
import { getUserById, getUserName } from "@/lib/mock-data/users";
import {
  ACTIVE_SESSIONS,
  DEFAULT_USER_ID,
  FALLBACK_ACCOUNT_STATUS,
} from "../constants/profile.constants";

/**
 * Placeholder API surface for a signed-in user's profile, keyed by whichever
 * account the dummy login session points at (falls back to
 * `DEFAULT_USER_ID` if called with none). Every function reads local mock
 * data synchronously; a real backend would replace the bodies here without
 * changing the call sites in `hooks/use-current-user.js`.
 */
export function getCurrentUser(userId = DEFAULT_USER_ID) {
  const user = getUserById(userId);
  if (!user) {
    return null;
  }
  const employee = getEmployeeDetails(user.id);
  return {
    ...user,
    ...employee,
    ...(ADMIN_USER_ACCOUNT_DETAILS[user.id] ?? FALLBACK_ACCOUNT_STATUS),
    reportingManagerName:
      employee?.reportingManagerId && getUserById(employee.reportingManagerId)
        ? getUserName(employee.reportingManagerId)
        : null,
  };
}

export function getCurrentUserProjectAssignments(userId = DEFAULT_USER_ID) {
  return getProjectAssignments(userId);
}

export function getCurrentUserActivity(userId = DEFAULT_USER_ID) {
  return getActivityLog(userId, "account");
}

/** Same illustrative session list for every account — devices aren't modeled per-user. */
export function getCurrentUserSessions() {
  return ACTIVE_SESSIONS;
}

export function getCurrentUserAccessSummary(userId = DEFAULT_USER_ID) {
  const user = getCurrentUser(userId);
  if (!user) {
    return null;
  }
  return {
    roleLabel: ROLE_LABELS[user.role],
    accessScope: ROLE_ACCESS_SCOPE[user.role],
  };
}

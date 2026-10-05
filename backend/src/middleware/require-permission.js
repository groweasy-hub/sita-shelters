import { resolveSessionUser } from "../auth/resolve-session.js";
import { hasAnyPermission, hasEveryPermission, hasPermission } from "../permissions.js";

/**
 * Express middleware factory. `requirement` is a permission slug, or
 * `{ any: [...] }` / `{ all: [...] }`. Attaches the resolved user to
 * `req.user` on success.
 *
 *   router.post("/", requirePermission("materials:manage"), handler);
 */
export function requirePermission(requirement) {
  return async function requirePermissionMiddleware(req, res, next) {
    let user;
    try {
      user = await resolveSessionUser(req);
    } catch (error) {
      console.error("Session resolution error", error);
      return res.status(500).json({ error: "The request could not be completed" });
    }
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const allowed =
      typeof requirement === "string"
        ? hasPermission(user.role, requirement)
        : requirement.any
          ? hasAnyPermission(user.role, requirement.any)
          : hasEveryPermission(user.role, requirement.all ?? []);

    if (!allowed) {
      return res.status(403).json({ error: "Forbidden" });
    }

    req.user = user;
    next();
  };
}

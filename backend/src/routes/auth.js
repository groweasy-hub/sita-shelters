import { serialize as serializeCookie } from "cookie";
import { Router } from "express";
import { z } from "zod";

import {
  DUMMY_PASSWORD_HASH,
  hashPassword,
  passwordValuesMatch,
  verifyPassword,
  verifyPasswordAndUpgrade,
} from "../auth/password.js";
import { sendPasswordResetEmail } from "../auth/email.js";
import {
  loginProtectionStore,
  loginRateLimit,
} from "../auth/login-protection.js";
import {
  getSessionToken,
  resolveSessionUser,
} from "../auth/resolve-session.js";
import {
  changePasswordSchema,
  displayNameSchema,
  forgotPasswordSchema,
  LOGIN_FAILURE_MESSAGE,
  loginSchema,
  logAuthValidationFailure,
  PASSWORD_RESET_REQUEST_MESSAGE,
  REGISTRATION_RESPONSE_MESSAGE,
  resetPasswordSchema,
  signupSchema,
} from "../auth/validation.js";
import { IS_PRODUCTION, SESSION_COOKIE_NAME } from "../config.js";
import {
  listAccountActivity,
  recordAccountActivity,
} from "../repositories/activity.js";
import {
  createSession,
  deleteSessionByToken,
  deleteSessionForUser,
  deleteSessionsByUser,
  listSessionsByUser,
} from "../repositories/sessions.js";
import {
  consumePasswordResetToken,
  createPasswordResetToken,
  createSelfRegisteredUser,
  getUserByEmailWithCredentials,
  getUserByIdWithCredentials,
  setPasswordHash,
  touchLastLogin,
  updateOwnProfile,
  withProfileDetails,
} from "../repositories/users.js";

export const authRouter = Router();

const SIGN_IN_ALLOWED_STATUSES = new Set(["active", "invited"]);

const profileSchema = z.object({
  name: displayNameSchema,
  mobile: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s\-()]{6,19}$/, "Enter a valid mobile number")
    .or(z.literal(""))
    .default(""),
});

/** Resolves the signed-in user, or answers 401 and returns null. */
async function requireSignedInUser(req, res) {
  const user = await resolveSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Not signed in" });
    return null;
  }
  return user;
}

function sessionCookie(value, maxAgeSeconds) {
  return serializeCookie(SESSION_COOKIE_NAME, value, {
    path: "/",
    httpOnly: true,
    // The browser talks to the Vercel same-origin /api proxy, which forwards
    // to the backend server-to-server. Lax protects the session from cross-site
    // form requests while still allowing normal top-level navigation.
    sameSite: "lax",
    secure: IS_PRODUCTION,
    maxAge: maxAgeSeconds,
  });
}

function loginFailure(res) {
  return res.status(401).json({ error: LOGIN_FAILURE_MESSAGE });
}

// Never pass an Error object through to a logger on an authentication path:
// libraries may include request-derived details in an error message or stack.
function logAuthError(event, error, metadata = {}) {
  console.error(event, {
    ...metadata,
    errorName: error instanceof Error ? error.name : "UnknownError",
  });
}

authRouter.post("/login", loginRateLimit, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    logAuthValidationFailure(req, "/login", parsed.error);
    return loginFailure(res);
  }
  const { email, password } = parsed.data;

  if (loginProtectionStore.getRestriction(email).restricted) {
    return loginFailure(res);
  }

  try {
    const user = await getUserByEmailWithCredentials(email);
    // Always run bcrypt comparison, including for unknown/inactive accounts,
    // so the response path does not disclose account existence by timing.
    const passwordResult = await verifyPasswordAndUpgrade(
      password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );
    const signedIn =
      Boolean(user) &&
      SIGN_IN_ALLOWED_STATUSES.has(user.status) &&
      passwordResult.valid;

    if (!signedIn) {
      const failure = loginProtectionStore.recordFailure(email);
      if (user) {
        await recordAccountActivity(user.id, "Failed login attempt", {
          req,
          status: "blocked",
          remarks: "Sign-in was not completed",
        });
      }
      if (user && failure.lockedNow) {
        try {
          const resetToken = await createPasswordResetToken(user.id);
          void sendPasswordResetEmail({
            userId: user.id,
            email: user.email,
            token: resetToken,
            locked: true,
          });
        } catch (error) {
          logAuthError("Could not start account-recovery email", error, {
            userId: user.id,
          });
        }
      }
      return loginFailure(res);
    }

    loginProtectionStore.clear(email);
    if (passwordResult.replacementHash) {
      await setPasswordHash(user.id, passwordResult.replacementHash);
      await recordAccountActivity(user.id, "Password security upgraded", {
        req,
      });
    }

    const { token, maxAgeSeconds } = await createSession(user.id, {
      userAgent: req.headers["user-agent"] ?? null,
      ipAddress: req.ip ?? null,
    });
    await touchLastLogin(user.id);
    await recordAccountActivity(user.id, "Logged in", { req });

    res.setHeader("Set-Cookie", sessionCookie(token, maxAgeSeconds));
    return res.json({
      ok: true,
      userId: user.id,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    logAuthError("Login API error", error);
    return loginFailure(res);
  }
});

authRouter.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    logAuthValidationFailure(req, "/signup", parsed.error);
    return res
      .status(400)
      .json({ error: "Registration request could not be completed" });
  }

  try {
    const { email, username, displayName, password } = parsed.data;
    await createSelfRegisteredUser({
      email,
      username,
      displayName,
      passwordHash: await hashPassword(password),
    });
    // Deliberately identical for a new or duplicate account.
    return res.status(202).json({ message: REGISTRATION_RESPONSE_MESSAGE });
  } catch (error) {
    logAuthError("Signup API error", error);
    return res
      .status(500)
      .json({ error: "Registration request could not be completed" });
  }
});

authRouter.post("/forgot-password", async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    logAuthValidationFailure(req, "/forgot-password", parsed.error);
    return res.json({ message: PASSWORD_RESET_REQUEST_MESSAGE });
  }

  try {
    const user = await getUserByEmailWithCredentials(parsed.data.email);
    if (user && SIGN_IN_ALLOWED_STATUSES.has(user.status)) {
      const resetToken = await createPasswordResetToken(user.id);
      void sendPasswordResetEmail({
        userId: user.id,
        email: user.email,
        token: resetToken,
      });
    }
  } catch (error) {
    logAuthError("Password reset request API error", error);
  }
  return res.json({ message: PASSWORD_RESET_REQUEST_MESSAGE });
});

authRouter.post("/reset-password", async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    logAuthValidationFailure(req, "/reset-password", parsed.error);
    return res
      .status(400)
      .json({ error: "Password reset could not be completed" });
  }

  try {
    const user = await consumePasswordResetToken(
      parsed.data.token,
      await hashPassword(parsed.data.password),
    );
    if (!user) {
      return res
        .status(400)
        .json({ error: "Password reset could not be completed" });
    }
    loginProtectionStore.clear(user.email);
    await deleteSessionsByUser(user.id);
    await recordAccountActivity(user.id, "Password reset", { req });
    return res.json({ ok: true });
  } catch (error) {
    logAuthError("Password reset API error", error);
    return res
      .status(500)
      .json({ error: "Password reset could not be completed" });
  }
});

authRouter.post("/logout", async (req, res) => {
  const token = getSessionToken(req);
  const user = await resolveSessionUser(req);
  await deleteSessionByToken(token);
  if (user) {
    await recordAccountActivity(user.id, "Logged out", { req });
  }
  res.setHeader("Set-Cookie", sessionCookie("", 0));
  res.json({ ok: true });
});

authRouter.get("/me", async (req, res) => {
  const user = await resolveSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: "Not signed in" });
  }
  res.json(await withProfileDetails(user));
});

authRouter.patch("/profile", async (req, res) => {
  try {
    const user = await requireSignedInUser(req, res);
    if (!user) return;

    const result = profileSchema.safeParse(req.body);
    if (!result.success) {
      logAuthValidationFailure(req, "/profile", result.error);
      return res.status(400).json({ error: "Profile details are invalid" });
    }

    const updated = await updateOwnProfile(user.id, result.data);
    await recordAccountActivity(user.id, "Profile updated", { req });
    res.json(await withProfileDetails(updated));
  } catch (error) {
    logAuthError("Profile update API error", error);
    res.status(500).json({ error: "The profile could not be updated" });
  }
});

authRouter.post("/change-password", async (req, res) => {
  try {
    const user = await requireSignedInUser(req, res);
    if (!user) return;

    const result = changePasswordSchema.safeParse(req.body);
    if (!result.success) {
      logAuthValidationFailure(req, "/change-password", result.error);
      return res
        .status(400)
        .json({ error: "Password change could not be completed" });
    }
    const { currentPassword, newPassword } = result.data;

    const withCredentials = await getUserByIdWithCredentials(user.id);
    const currentValid = await verifyPassword(
      currentPassword,
      withCredentials?.passwordHash,
    );
    if (!currentValid) {
      await recordAccountActivity(user.id, "Failed password change", {
        req,
        status: "blocked",
        remarks: "Password change was not completed",
      });
      return res
        .status(400)
        .json({ error: "Password change could not be completed" });
    }
    if (passwordValuesMatch(currentPassword, newPassword)) {
      return res
        .status(400)
        .json({ error: "Password change could not be completed" });
    }

    await setPasswordHash(user.id, await hashPassword(newPassword));
    // A changed password should end any session that may have known the old one.
    const signedOut = await deleteSessionsByUser(user.id, {
      exceptToken: getSessionToken(req),
    });
    await recordAccountActivity(user.id, "Password changed", {
      req,
      remarks:
        signedOut > 0
          ? `${signedOut} other ${signedOut === 1 ? "session" : "sessions"} signed out`
          : null,
    });
    res.json({ ok: true });
  } catch (error) {
    logAuthError("Change password API error", error);
    res.status(500).json({ error: "Password change could not be completed" });
  }
});

authRouter.get("/sessions", async (req, res) => {
  try {
    const user = await requireSignedInUser(req, res);
    if (!user) return;
    res.json(await listSessionsByUser(user.id, getSessionToken(req)));
  } catch (error) {
    console.error("Sessions list API error", error);
    res.status(500).json({ error: "The sessions could not be loaded" });
  }
});

authRouter.post("/sessions/revoke-all", async (req, res) => {
  try {
    const user = await requireSignedInUser(req, res);
    if (!user) return;

    const count = await deleteSessionsByUser(user.id);
    await recordAccountActivity(user.id, "Logged out of all devices", {
      req,
      remarks: `${count} ${count === 1 ? "session" : "sessions"} ended`,
    });
    // This request's own session is gone too, so clear its cookie.
    res.setHeader("Set-Cookie", sessionCookie("", 0));
    res.json({ ok: true, revoked: count });
  } catch (error) {
    console.error("Revoke all sessions API error", error);
    res.status(500).json({ error: "The sessions could not be ended" });
  }
});

authRouter.delete("/sessions/:sessionId", async (req, res) => {
  try {
    const user = await requireSignedInUser(req, res);
    if (!user) return;

    const removed = await deleteSessionForUser(user.id, req.params.sessionId);
    if (!removed) {
      return res.status(404).json({ error: "The session could not be ended" });
    }
    await recordAccountActivity(user.id, "Logged out a device", { req });
    res.json({ ok: true });
  } catch (error) {
    console.error("Revoke session API error", error);
    res.status(500).json({ error: "The session could not be ended" });
  }
});

authRouter.get("/activity", async (req, res) => {
  try {
    const user = await requireSignedInUser(req, res);
    if (!user) return;
    res.json(await listAccountActivity(user.id));
  } catch (error) {
    console.error("Activity API error", error);
    res.status(500).json({ error: "The activity history could not be loaded" });
  }
});

import { z } from "zod";

export const LOGIN_FAILURE_MESSAGE = "Incorrect email or password";
export const PASSWORD_RESET_REQUEST_MESSAGE =
  "If that email is registered, you'll receive a reset link";
export const REGISTRATION_RESPONSE_MESSAGE = "Registration request received.";

const HTML_TAG_PATTERN = /<[^>]*>/g;
const SCRIPT_ELEMENT_PATTERN = /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F]/g;

function withoutMarkup(value) {
  return value
    .replace(SCRIPT_ELEMENT_PATTERN, "")
    .replace(HTML_TAG_PATTERN, "")
    .replace(CONTROL_CHARACTER_PATTERN, "");
}

/** Normalizes the address used as an account identifier before validation. */
export function sanitizeEmail(value) {
  if (typeof value !== "string") return value;
  return withoutMarkup(value).trim().toLocaleLowerCase("en-US");
}

/** Usernames are intentionally limited to a small, safe identifier alphabet. */
export function sanitizeUsername(value) {
  if (typeof value !== "string") return value;
  return withoutMarkup(value)
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9_-]/g, "");
}

/** Removes markup and unsafe punctuation from a name before it is persisted. */
export function sanitizeDisplayName(value) {
  if (typeof value !== "string") return value;
  return withoutMarkup(value)
    .trim()
    .replace(/[^\p{L}\p{M}\p{N}\s.'-]/gu, "")
    .replace(/\s+/g, " ");
}

function hasAtMostBcryptBytes(value) {
  return Buffer.byteLength(value, "utf8") <= 72;
}

const passwordInputSchema = z
  .string()
  .min(1)
  .max(128)
  .refine(hasAtMostBcryptBytes);

export const emailSchema = z.preprocess(
  sanitizeEmail,
  z.string().min(3).max(254).email(),
);

export const usernameSchema = z.preprocess(
  sanitizeUsername,
  z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9][a-z0-9_-]*$/),
);

export const displayNameSchema = z.preprocess(
  sanitizeDisplayName,
  z
    .string()
    .min(2)
    .max(80)
    .regex(/^[\p{L}\p{M}][\p{L}\p{M}\p{N}\s.'-]*$/u),
);

// Passwords deliberately are not sanitized. Removing symbols would alter a
// secret the person chose and makes strong passwords weaker; validation keeps
// control characters and bcrypt-truncated values out instead.
export const newPasswordSchema = passwordInputSchema
  .min(12)
  .regex(/[A-Za-z]/)
  .regex(/[0-9]/);

export const loginSchema = z
  .object({ email: emailSchema, password: passwordInputSchema })
  .strict();

export const signupSchema = z
  .object({
    email: emailSchema,
    password: newPasswordSchema,
    username: usernameSchema,
    displayName: displayNameSchema,
  })
  .strict();

export const forgotPasswordSchema = z.object({ email: emailSchema }).strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    password: newPasswordSchema,
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: passwordInputSchema,
    newPassword: newPasswordSchema,
  })
  .strict();

/** Logs metadata only—never request values, passwords, reset tokens, or hashes. */
export function logAuthValidationFailure(req, route, error) {
  console.warn("Authentication validation failed", {
    route,
    ip: req.ip ?? "unknown",
    issueCodes: error.issues.map((issue) => issue.code),
  });
}

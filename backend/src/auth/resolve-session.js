import { parse as parseCookies } from "cookie";

import { SESSION_COOKIE_NAME } from "../config.js";
import { getSessionByToken } from "../repositories/sessions.js";
import { getUserById } from "../repositories/users.js";

export function getSessionToken(req) {
  const cookies = parseCookies(req.headers.cookie ?? "");
  return cookies[SESSION_COOKIE_NAME] ?? null;
}

/** Resolves the current request's session to its user, or null if signed out. */
export async function resolveSessionUser(req) {
  const token = getSessionToken(req);
  const session = await getSessionByToken(token);
  if (!session) {
    return null;
  }
  return getUserById(session.userId);
}

import { cookies } from "next/headers";

import { getUserById } from "./mock-data/users";
import { SESSION_COOKIE_NAME } from "./session-constants";

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "./session-constants";

export async function getSessionUserId() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getSessionUser() {
  const userId = await getSessionUserId();
  return userId ? getUserById(userId) : null;
}

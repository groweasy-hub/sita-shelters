import { NextResponse } from "next/server";

import { getUserByEmail } from "@/lib/mock-data/users";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/session-constants";

export const dynamic = "force-dynamic";

/**
 * Dummy/demo login only: every mock account in `src/lib/mock-data/users.js`
 * shares the single password in `NEXT_PUBLIC_DEMO_LOGIN_PASSWORD` (see
 * `.env.example`). There is no password hashing or real credential store —
 * this exists so the different role dashboards can be viewed by signing in
 * as each mock person, nothing more.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  const user = getUserByEmail(email);
  if (!user) {
    return NextResponse.json(
      { error: "No demo account found with that email" },
      { status: 401 },
    );
  }

  const expectedPassword = process.env.NEXT_PUBLIC_DEMO_LOGIN_PASSWORD;
  if (!expectedPassword || password !== expectedPassword) {
    return NextResponse.json(
      { error: "Incorrect password" },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    userId: user.id,
    name: user.name,
    role: user.role,
  });
  response.cookies.set(SESSION_COOKIE_NAME, user.id, {
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    sameSite: "lax",
  });
  return response;
}

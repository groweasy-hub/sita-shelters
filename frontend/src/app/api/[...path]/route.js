// The explicit extension works in both Next's compiler and the Node test
// runner used by this repository's test suite.
import { NextResponse } from "next/server.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const REQUEST_HEADERS_TO_REMOVE = new Set([
  ...HOP_BY_HOP_HEADERS,
  "content-length",
  "host",
  "origin",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-real-ip",
  "x-vercel-forwarded-for",
  "x-vercel-id",
]);

const RESPONSE_HEADERS_TO_REMOVE = new Set([
  ...HOP_BY_HOP_HEADERS,
  "access-control-allow-credentials",
  "access-control-allow-headers",
  "access-control-allow-methods",
  "access-control-allow-origin",
  "content-encoding",
  "content-length",
  "set-cookie",
]);

function backendBaseUrl() {
  const value =
    process.env.BACKEND_API_URL ||
    (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000");
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

function targetUrl(request, path) {
  const baseUrl = backendBaseUrl();
  if (!baseUrl) {
    return null;
  }

  // Encode every dynamic segment. This keeps a request path from changing
  // the configured Railway origin or escaping the intended /api namespace.
  const encodedPath = path
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const target = new URL(`/api/${encodedPath}`, baseUrl);
  target.search = new URL(request.url).search;
  return target;
}

function outboundHeaders(request) {
  const headers = new Headers(request.headers);
  for (const name of REQUEST_HEADERS_TO_REMOVE) {
    headers.delete(name);
  }

  // Vercel supplies this client IP and overwrites the normal X-Forwarded-For
  // header. Railway has one trusted proxy hop configured, so its login rate
  // limiter can use this address without accepting a browser-supplied value.
  const clientIp =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for");
  if (clientIp) {
    headers.set("x-forwarded-for", clientIp);
  }

  return headers;
}

function inboundHeaders(upstream) {
  const headers = new Headers();
  for (const [name, value] of upstream.headers) {
    if (!RESPONSE_HEADERS_TO_REMOVE.has(name.toLowerCase())) {
      headers.append(name, value);
    }
  }

  // A cookie returned by Railway is intentionally relayed from this
  // same-origin route. Browsers therefore store it for the Vercel app rather
  // than attempting to treat Railway as a third-party cookie origin.
  const cookies = upstream.headers.getSetCookie?.() ?? [];
  if (cookies.length > 0) {
    for (const cookie of cookies) {
      headers.append("set-cookie", cookie);
    }
  } else {
    const cookie = upstream.headers.get("set-cookie");
    if (cookie) {
      headers.append("set-cookie", cookie);
    }
  }

  return headers;
}

async function proxy(request, context) {
  const { path } = await context.params;
  const target = targetUrl(request, path);
  if (!target) {
    return NextResponse.json(
      { error: "API service is not configured" },
      { status: 503 },
    );
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers: outboundHeaders(request),
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
    });

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: inboundHeaders(upstream),
    });
  } catch {
    // Keep connection and deployment details server-side; the browser only
    // needs to know that the dependent service is temporarily unavailable.
    console.error("[api-proxy] backend request failed");
    return NextResponse.json(
      { error: "API service is temporarily unavailable" },
      { status: 503 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;

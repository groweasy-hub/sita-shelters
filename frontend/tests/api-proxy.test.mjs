import assert from "node:assert/strict";
import test from "node:test";

import { POST } from "../src/app/api/[...path]/route.js";
import { createFetchHttpClient } from "../src/services/http-client.js";

test("the HTTP client resolves the default API base to the same origin", async () => {
  let received;
  const client = createFetchHttpClient({
    baseUrl: "/",
    fetchImplementation: async (url, init) => {
      received = { url: url.toString(), init };
      return Response.json({ ok: true });
    },
  });

  await client.get("/api/auth/me", { query: { tab: "profile" } });

  assert.equal(received.url, "http://localhost:3000/api/auth/me?tab=profile");
  assert.equal(received.init.credentials, "include");
});

test("the Vercel API route preserves cookies and forwards only trusted request data", async () => {
  const previousBackendUrl = process.env.BACKEND_API_URL;
  const originalFetch = globalThis.fetch;
  let received;

  process.env.BACKEND_API_URL = "https://sita-api.onrender.com";
  globalThis.fetch = async (url, init) => {
    received = { url: url.toString(), init };
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        "content-type": "application/json",
        "set-cookie": "sita_shelters_session=session-value; Path=/; HttpOnly",
        "x-upstream": "render",
      },
    });
  };

  try {
    const response = await POST(
      new Request(
        "https://sita-shelters.vercel.app/api/auth/login?next=dashboard",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            origin: "https://sita-shelters.vercel.app",
            "x-forwarded-for": "198.51.100.18",
            "x-vercel-forwarded-for": "203.0.113.10",
          },
          body: JSON.stringify({
            email: "user@example.com",
            password: "not-a-real-password",
          }),
        },
      ),
      { params: Promise.resolve({ path: ["auth", "login"] }) },
    );

    assert.equal(
      received.url,
      "https://sita-api.onrender.com/api/auth/login?next=dashboard",
    );
    assert.equal(received.init.headers.get("origin"), null);
    assert.equal(received.init.headers.get("x-vercel-forwarded-for"), null);
    assert.equal(received.init.headers.get("x-forwarded-for"), "203.0.113.10");
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-upstream"), "render");
    assert.match(
      response.headers.get("set-cookie") ?? "",
      /sita_shelters_session=session-value/,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (previousBackendUrl === undefined) {
      delete process.env.BACKEND_API_URL;
    } else {
      process.env.BACKEND_API_URL = previousBackendUrl;
    }
  }
});

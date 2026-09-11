import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render(pathname = "/dashboard") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Sita Shelters application shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /SITA SHELTERS/i);
  assert.match(html, /Portfolio control room/i);
  assert.match(html, /Project health/i);
  assert.match(html, /Construction operations/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("server-renders reports without crossing the client boundary with functions", async () => {
  const response = await render("/reports");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Reports/);
  assert.match(html, /Decision support/);
});

test("keeps the frontend foundation free of starter artifacts, with any backend isolated in backend/", async () => {
  const [layout, packageJson, hosting, providers, theme] = await Promise.all([
    readFile(new URL("../src/app/layout.jsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../src/app/providers.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/styles/theme.js", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /Sita Shelters/);
  assert.doesNotMatch(layout, /codex-preview|Starter Project|_sites-preview/);
  assert.match(packageJson, /styled-components/);
  // Only the Projects module is backed by a real database (Cloudflare D1 via
  // Drizzle), and its source lives entirely under `backend/`, not `src/`.
  // These packages are legitimate given that, so only the genuinely unwanted
  // starter-kit dependencies are forbidden here.
  assert.doesNotMatch(
    packageJson,
    /react-loading-skeleton|next-themes|tailwindcss/,
  );
  assert.match(providers, /appTheme/);
  assert.doesNotMatch(providers, /darkTheme|next-themes|useTheme/);
  assert.match(theme, /brandRed: "#990011"/);
  assert.match(theme, /brandRedDark: "#80011f"/);
  assert.match(theme, /background: "#fcf6f5"/);
  assert.match(theme, /stone: "#9e9a8d"/);
  const hostingConfig = JSON.parse(hosting);
  assert.match(hostingConfig.project_id, /^appgprj_/);
  assert.equal(hostingConfig.d1, "DB");
  assert.equal(hostingConfig.r2, null);

  await assert.rejects(
    access(new URL("../app/_sites-preview", import.meta.url)),
  );
  // The backend's schema, repository and Drizzle config must live under
  // backend/, never scattered at the repo root or inside src/.
  await assert.rejects(access(new URL("../db/schema.ts", import.meta.url)));
  await assert.rejects(
    access(new URL("../drizzle.config.mjs", import.meta.url)),
  );
  await access(new URL("../backend/db/schema.ts", import.meta.url));
  await access(
    new URL("../backend/db/projects-repository.js", import.meta.url),
  );
  await access(new URL("../backend/drizzle.config.mjs", import.meta.url));
  await access(
    new URL("../src/app/(dashboard)/dashboard/page.jsx", import.meta.url),
  );
  await access(new URL("../src/config/navigation.js", import.meta.url));
  await access(
    new URL("../src/components/shared/data-table.jsx", import.meta.url),
  );
  await access(new URL("ARCHITECTURE.md", projectRoot));
});

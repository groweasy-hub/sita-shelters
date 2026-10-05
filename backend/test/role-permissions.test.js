import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

import {
  APP_ROLES,
  PERMISSIONS,
  ROLE_ACCESS_SCOPE,
  ROLE_PERMISSIONS,
  canAccessProject,
  hasPermission,
} from "../src/permissions.js";
import {
  APP_ROLES as frontendRoles,
  PERMISSIONS as frontendPermissions,
  ROLE_ACCESS_SCOPE as frontendRoleAccessScope,
  ROLE_PERMISSIONS as frontendRolePermissions,
} from "../../frontend/src/config/permissions.js";

test("all 19 role definitions and permission maps stay in sync with the frontend", () => {
  assert.equal(APP_ROLES.length, 19);
  assert.deepEqual(APP_ROLES, frontendRoles);
  assert.deepEqual(PERMISSIONS, frontendPermissions);
  assert.deepEqual(ROLE_PERMISSIONS, frontendRolePermissions);
  assert.deepEqual(ROLE_ACCESS_SCOPE, frontendRoleAccessScope);

  for (const role of APP_ROLES) {
    const granted = ROLE_PERMISSIONS[role];
    assert.ok(Array.isArray(granted), `${role} must have a permission list`);
    assert.equal(
      new Set(granted).size,
      granted.length,
      `${role} has duplicate permissions`,
    );

    for (const permission of PERMISSIONS) {
      assert.equal(
        hasPermission(role, permission),
        granted.includes(permission),
        `${role} must resolve ${permission} consistently`,
      );
    }

    assert.equal(hasPermission(role, "unknown:permission"), false);
  }
});

test("project-scoped roles cannot cross an assignment boundary", () => {
  for (const role of APP_ROLES) {
    const user = { role, projectIds: ["project-a"] };
    assert.equal(
      canAccessProject(user, "project-a"),
      true,
      `${role} can use assigned project`,
    );
    assert.equal(
      canAccessProject(user, "project-b"),
      ROLE_ACCESS_SCOPE[role] === "global",
      `${role} respects project scope`,
    );
  }
});

test("literal permission requirements on API routes are defined permissions", async () => {
  const routesDirectory = new URL("../src/routes/", import.meta.url);
  const routeFiles = (await readdir(routesDirectory)).filter((name) =>
    name.endsWith(".js"),
  );
  const referencedPermissions = new Set();

  for (const fileName of routeFiles) {
    const source = await readFile(new URL(fileName, routesDirectory), "utf8");
    for (const match of source.matchAll(/requirePermission\(\s*"([^"]+)"/g)) {
      referencedPermissions.add(match[1]);
    }
    for (const block of source.matchAll(/requirePermission\(\s*\{[^}]*\}/gs)) {
      for (const match of block[0].matchAll(/"([^"]+)"/g)) {
        referencedPermissions.add(match[1]);
      }
    }
  }

  assert.ok(referencedPermissions.size > 0);
  for (const permission of referencedPermissions) {
    assert.ok(
      PERMISSIONS.includes(permission),
      `unknown route permission: ${permission}`,
    );
  }
});

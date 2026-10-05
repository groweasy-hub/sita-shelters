import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";

import bcrypt from "bcryptjs";

import {
  LOGIN_RATE_LIMIT_MAX_REQUESTS,
  LoginProtectionStore,
} from "../src/auth/login-protection.js";
import {
  hashPassword,
  passwordHashMigrationKind,
  verifyPasswordAndUpgrade,
} from "../src/auth/password.js";
import {
  LOGIN_FAILURE_MESSAGE,
  loginSchema,
  PASSWORD_RESET_REQUEST_MESSAGE,
  signupSchema,
} from "../src/auth/validation.js";

test("login protection limits an IP and locks after five spaced failures", () => {
  let now = 0;
  const store = new LoginProtectionStore({ now: () => now });

  for (let index = 0; index < LOGIN_RATE_LIMIT_MAX_REQUESTS; index += 1) {
    assert.equal(store.allowIpRequest("127.0.0.1"), true);
  }
  assert.equal(store.allowIpRequest("127.0.0.1"), false);

  const delays = [];
  for (let index = 0; index < 5; index += 1) {
    const result = store.recordFailure("person@example.com");
    delays.push(result.delayMs);
    if (!result.lockedNow) now += result.delayMs;
  }
  assert.deepEqual(delays, [1_000, 2_000, 4_000, 8_000, 900_000]);
  assert.equal(store.getRestriction("person@example.com").locked, true);
});

test("auth schemas normalize safe text fields and reject invalid secrets", () => {
  const login = loginSchema.safeParse({
    email: " PRIYANKA.DAS@sitashelters-example.com ",
    password: "safe-password",
  });
  assert.equal(login.success, true);
  assert.equal(login.data.email, "priyanka.das@sitashelters-example.com");

  const signup = signupSchema.safeParse({
    email: "new.user@example.com",
    username: "New<script>x</script>_User!",
    displayName: "New <script>alert(1)</script> User",
    password: "Strong-password-123",
  });
  assert.equal(signup.success, true);
  assert.equal(signup.data.username, "new_user");
  assert.equal(signup.data.displayName, "New User");
  assert.equal(
    signupSchema.safeParse({
      email: "x",
      password: "short",
      username: "!!",
      displayName: "<script>x</script>",
    }).success,
    false,
  );
});

test("authentication error contracts use generic messages", () => {
  assert.equal(LOGIN_FAILURE_MESSAGE, "Incorrect email or password");
  assert.equal(
    PASSWORD_RESET_REQUEST_MESSAGE,
    "If that email is registered, you'll receive a reset link",
  );
});

test("bcrypt-12 storage upgrades legacy values only after a successful match", async () => {
  const password = "Strong-password-123";
  const currentHash = await hashPassword(password);
  assert.equal(passwordHashMigrationKind(currentHash), "current-bcrypt");
  assert.equal(
    (await verifyPasswordAndUpgrade(password, currentHash)).replacementHash,
    null,
  );

  const weakBcryptHash = await bcrypt.hash(password, 10);
  const weakResult = await verifyPasswordAndUpgrade(password, weakBcryptHash);
  assert.equal(weakResult.valid, true);
  assert.ok(weakResult.replacementHash);

  const md5Hash = crypto.createHash("md5").update(password).digest("hex");
  const md5Result = await verifyPasswordAndUpgrade(password, md5Hash);
  assert.equal(md5Result.valid, true);
  assert.ok(md5Result.replacementHash);

  const plaintextResult = await verifyPasswordAndUpgrade("wrong", password);
  assert.equal(plaintextResult.valid, false);
  assert.equal(plaintextResult.replacementHash, null);
});

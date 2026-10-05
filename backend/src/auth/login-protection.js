import { LOGIN_FAILURE_MESSAGE } from "./validation.js";

export const LOGIN_RATE_LIMIT_WINDOW_MS = 60_000;
export const LOGIN_RATE_LIMIT_MAX_REQUESTS = 10;
export const ACCOUNT_LOCKOUT_MS = 15 * 60_000;
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;

const MAX_PROGRESSIVE_DELAY_MS = 30_000;

function normalizeIp(ipAddress) {
  return String(ipAddress ?? "unknown").replace(/^::ffff:/, "");
}

/**
 * Process-local protection state. It deliberately exposes no reason to the
 * requester—rate limits, progressive waits, and account locks all receive
 * the same login failure response. Use Redis/Upstash when deploying more
 * than one API process.
 */
export class LoginProtectionStore {
  constructor({ now = () => Date.now() } = {}) {
    this.now = now;
    this.ipRequests = new Map();
    this.accountAttempts = new Map();
  }

  allowIpRequest(ipAddress) {
    const now = this.now();
    const key = normalizeIp(ipAddress);
    const recent = (this.ipRequests.get(key) ?? []).filter(
      (timestamp) => timestamp > now - LOGIN_RATE_LIMIT_WINDOW_MS,
    );
    if (recent.length >= LOGIN_RATE_LIMIT_MAX_REQUESTS) {
      this.ipRequests.set(key, recent);
      return false;
    }
    recent.push(now);
    this.ipRequests.set(key, recent);
    return true;
  }

  getRestriction(email) {
    const state = this.accountAttempts.get(email);
    if (!state) return { restricted: false, locked: false };

    const now = this.now();
    if (state.lockedUntil > now) {
      return { restricted: true, locked: true };
    }
    if (state.lockedUntil) {
      this.accountAttempts.delete(email);
      return { restricted: false, locked: false };
    }
    return {
      restricted: state.nextAllowedAt > now,
      locked: false,
    };
  }

  recordFailure(email) {
    const now = this.now();
    const previous = this.accountAttempts.get(email) ?? {
      failedAttempts: 0,
      lockedUntil: 0,
      nextAllowedAt: 0,
    };
    const failedAttempts = previous.failedAttempts + 1;
    if (failedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
      this.accountAttempts.set(email, {
        failedAttempts,
        lockedUntil: now + ACCOUNT_LOCKOUT_MS,
        nextAllowedAt: 0,
      });
      return { lockedNow: true, failedAttempts, delayMs: ACCOUNT_LOCKOUT_MS };
    }

    const delayMs = Math.min(
      1_000 * 2 ** (failedAttempts - 1),
      MAX_PROGRESSIVE_DELAY_MS,
    );
    this.accountAttempts.set(email, {
      failedAttempts,
      lockedUntil: 0,
      nextAllowedAt: now + delayMs,
    });
    return { lockedNow: false, failedAttempts, delayMs };
  }

  clear(email) {
    this.accountAttempts.delete(email);
  }
}

export const loginProtectionStore = new LoginProtectionStore();

export function loginRateLimit(req, res, next) {
  if (loginProtectionStore.allowIpRequest(req.ip)) {
    return next();
  }
  console.warn("Login rate limit exceeded", { ip: normalizeIp(req.ip) });
  return res.status(401).json({ error: LOGIN_FAILURE_MESSAGE });
}

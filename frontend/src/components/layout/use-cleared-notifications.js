"use client";

import { useCallback, useState } from "react";

/**
 * Notifications have no backend record to mark read/dismissed on, so
 * "clearing" is tracked client-side, per signed-in account, in
 * localStorage — clearing is local to the browser that clicked Clear, for
 * that person's account id, not a global dismissal for every viewer.
 */
function storageKey(userId) {
  return `sita-shelters.notifications-cleared.${userId}`;
}
function readCleared(userId) {
  if (typeof window === "undefined" || !userId) {
    return new Set();
  }
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}
function writeCleared(userId, ids) {
  if (typeof window === "undefined" || !userId) {
    return;
  }
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify([...ids]));
  } catch {
    // Private browsing / storage quota — clearing just won't persist.
  }
}

export function useClearedNotifications(userId) {
  const [clearedIds, setClearedIds] = useState(() => readCleared(userId));

  const clearOne = useCallback(
    (id) => {
      setClearedIds((previous) => {
        const next = new Set(previous);
        next.add(id);
        writeCleared(userId, next);
        return next;
      });
    },
    [userId],
  );
  const clearAll = useCallback(
    (ids) => {
      setClearedIds((previous) => {
        const next = new Set(previous);
        ids.forEach((id) => next.add(id));
        writeCleared(userId, next);
        return next;
      });
    },
    [userId],
  );

  return { clearedIds, clearOne, clearAll };
}

"use client";
import { useEffect, useState } from "react";
/**
 * Delays propagation of a rapidly changing value. Useful for search inputs
 * before their value becomes part of a TanStack Query key.
 */
export function useDebouncedValue(value, delayMs = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedValue(value),
      Math.max(0, delayMs),
    );
    return () => window.clearTimeout(timeout);
  }, [delayMs, value]);
  return debouncedValue;
}

"use client";
import { useEffect, useState } from "react";
/**
 * Subscribes to a browser media query while remaining safe during server
 * rendering. Prefer CSS breakpoints for presentation-only changes; use this
 * hook when behavior itself must change.
 */
export function useMediaQuery(query, { defaultValue = false } = {}) {
  const [matches, setMatches] = useState(defaultValue);
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const updateMatch = () => setMatches(mediaQuery.matches);
    updateMatch();
    mediaQuery.addEventListener("change", updateMatch);
    return () => mediaQuery.removeEventListener("change", updateMatch);
  }, [query]);
  return matches;
}

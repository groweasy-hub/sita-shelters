"use client";

import { useEffect } from "react";

import { usePreferencesStore } from "@/stores/preferences-store";
import { DENSITY_SCALES, FONT_SIZE_OPTIONS } from "../constants/preferences.constants";

const BASE_FONT_SIZE_PX = 15;

/**
 * Applies the appearance and accessibility preferences (density, font size,
 * reduced motion, high contrast) to the document root. Mounted once near the
 * app shell; renders nothing itself.
 */
export function PreferencesEffects() {
  const density = usePreferencesStore((state) => state.appearance.density);
  const { fontSize, highContrast, reducedMotion } = usePreferencesStore(
    (state) => state.accessibility,
  );

  useEffect(() => {
    const fontScale = FONT_SIZE_OPTIONS.find((option) => option.value === fontSize)?.scale ?? 1;
    const densityScale = DENSITY_SCALES[density] ?? 1;
    document.documentElement.style.fontSize = `${BASE_FONT_SIZE_PX * fontScale * densityScale}px`;
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, [fontSize, density]);

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    document.documentElement.dataset.highContrast = String(highContrast);
  }, [highContrast]);

  return null;
}

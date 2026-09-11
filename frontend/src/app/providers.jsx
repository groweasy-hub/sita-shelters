"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { ThemeProvider as StyledThemeProvider } from "styled-components";

import { createQueryClient } from "@/lib/query-client";
import { GlobalStyles } from "@/styles/global-styles";
import { appTheme, appThemeDark } from "@/styles/theme";
import { usePreferencesStore } from "@/stores/preferences-store";

export function Providers({ children }) {
  const [queryClient] = useState(createQueryClient);
  const themeMode = usePreferencesStore((state) => state.appearance.themeMode);
  const theme = themeMode === "dark" ? appThemeDark : appTheme;

  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyles />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={350}>{children}</TooltipProvider>
      </QueryClientProvider>
    </StyledThemeProvider>
  );
}

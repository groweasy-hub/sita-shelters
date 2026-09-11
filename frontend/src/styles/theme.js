const sharedTheme = {
  fonts: {
    sans: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
    mono: "var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace",
  },
  radii: {
    xs: "0.2rem",
    sm: "0.35rem",
    md: "0.5rem",
    lg: "0.7rem",
    pill: "999px",
  },
  shadows: {
    subtle: "0 2px 8px rgb(66 42 47 / 0.07)",
    overlay: "0 18px 42px rgb(66 42 47 / 0.16)",
  },
  breakpoints: {
    mobile: "768px",
    tablet: "1024px",
    laptop: "1280px",
    desktop: "1536px",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
  },
};

/**
 * Sita Shelters' single branded admin theme.
 *
 * The four requested anchors are kept verbatim:
 * - rich dark red: #990011
 * - deep wine: #80011f
 * - light warm grey: #fcf6f5
 * - warm stone grey: #9e9a8d
 *
 * Components consume the semantic roles below rather than raw palette values.
 */
export const appTheme = Object.freeze({
  ...sharedTheme,
  mode: "light",
  colors: {
    brandRed: "#990011",
    brandRedDark: "#80011f",
    brandRedSoft: "#f6e5e7",
    warmGrey: "#fcf6f5",
    stone: "#9e9a8d",
    cream: "#f3ebdd",

    background: "#fcf6f5",
    foreground: "#30282a",
    card: "#ffffff",
    cardForeground: "#30282a",
    popover: "#ffffff",
    popoverForeground: "#30282a",
    elevated: "#ffffff",
    surfaceMuted: "#f4ecea",
    surfaceHover: "#eee2e1",
    sunken: "#ebe1df",

    primary: "#990011",
    primaryHover: "#80011f",
    primaryForeground: "#ffffff",
    secondary: "#eee7e4",
    secondaryForeground: "#3c3234",
    accent: "#f3ebdd",
    accentForeground: "#80011f",

    muted: "#eee7e4",
    mutedForeground: "#685e60",
    textLight: "#817678",
    border: "#ded2d0",
    input: "#c7b9b7",
    ring: "#990011",

    success: "#3f6f55",
    successForeground: "#ffffff",
    warning: "#925c21",
    warningForeground: "#ffffff",
    danger: "#b4232d",
    dangerForeground: "#ffffff",
    info: "#496a84",
    infoForeground: "#ffffff",

    sidebar: "#80011f",
    sidebarForeground: "#fff8f7",
    sidebarMuted: "#e7c5cc",
    sidebarAccent: "#990011",
    sidebarHover: "#8d0b2b",
    sidebarBorder: "#a63a54",
    sidebarHighlight: "#f3ebdd",

    inverseForeground: "#ffffff",
    inverseMuted: "rgb(255 255 255 / 0.68)",
    inverseQuiet: "rgb(255 255 255 / 0.5)",
    inverseSubtle: "rgb(255 255 255 / 0.09)",
    inverseBorder: "rgb(255 255 255 / 0.2)",
    backdrop: "rgb(44 30 34 / 0.55)",
  },
});

/**
 * Dark variant of the same brand, for the Preferences → Appearance → Theme
 * Mode control. Every component reads semantic roles from `theme.colors`
 * rather than literal hex values, so swapping this in at the provider is
 * enough to re-skin the whole app — no component-level dark-mode branching.
 */
export const appThemeDark = Object.freeze({
  ...sharedTheme,
  mode: "dark",
  colors: {
    brandRed: "#990011",
    brandRedDark: "#80011f",
    brandRedSoft: "#3a1418",
    warmGrey: "#fcf6f5",
    stone: "#9e9a8d",
    cream: "#f3ebdd",

    background: "#1b1315",
    foreground: "#f3e8e6",
    card: "#241a1c",
    cardForeground: "#f3e8e6",
    popover: "#241a1c",
    popoverForeground: "#f3e8e6",
    elevated: "#2a1f21",
    surfaceMuted: "#2a1f21",
    surfaceHover: "#33262a",
    sunken: "#150f11",

    primary: "#dc4757",
    primaryHover: "#e75f6d",
    primaryForeground: "#1b0507",
    secondary: "#33262a",
    secondaryForeground: "#f3e8e6",
    accent: "#3a2a26",
    accentForeground: "#f0c9a0",

    muted: "#2a1f21",
    mutedForeground: "#b8a3a1",
    textLight: "#9c8886",
    border: "#3d2d30",
    input: "#4a3a3d",
    ring: "#dc4757",

    success: "#5cb787",
    successForeground: "#06251a",
    warning: "#e2a15c",
    warningForeground: "#2b1a06",
    danger: "#ea727a",
    dangerForeground: "#2b0508",
    info: "#82b0d1",
    infoForeground: "#06131c",

    sidebar: "#200a10",
    sidebarForeground: "#fbecef",
    sidebarMuted: "#caa0a8",
    sidebarAccent: "#7a1220",
    sidebarHover: "#3d0f16",
    sidebarBorder: "#43232a",
    sidebarHighlight: "#f3ebdd",

    inverseForeground: "#ffffff",
    inverseMuted: "rgb(255 255 255 / 0.68)",
    inverseQuiet: "rgb(255 255 255 / 0.5)",
    inverseSubtle: "rgb(255 255 255 / 0.09)",
    inverseBorder: "rgb(255 255 255 / 0.2)",
    backdrop: "rgb(0 0 0 / 0.65)",
  },
});

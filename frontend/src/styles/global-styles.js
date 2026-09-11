"use client";

import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    border-color: ${({ theme }) => theme.colors.border};
  }

  html {
    min-width: 320px;
    color-scheme: ${({ theme }) => theme.mode};
    scroll-behavior: smooth;
  }

  body {
    min-height: 100vh;
    margin: 0;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.foreground};
    font-family: ${({ theme }) => theme.fonts.sans};
    font-size: 0.9375rem;
    line-height: 1.5;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
  }

  button:not(:disabled),
  [role="button"]:not([aria-disabled="true"]) {
    cursor: pointer;
  }

  a {
    color: inherit;
  }

  html[data-reduced-motion="true"] *,
  html[data-reduced-motion="true"] *::before,
  html[data-reduced-motion="true"] *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }

  html[data-high-contrast="true"] {
    filter: contrast(1.12) saturate(1.08);
  }

  h1,
  h2,
  h3,
  h4,
  p {
    margin-top: 0;
  }

  h1,
  h2,
  h3,
  h4 {
    color: ${({ theme }) => theme.colors.foreground};
    font-weight: 650;
    letter-spacing: -0.025em;
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.ring};
    outline-offset: 2px;
  }

  ::selection {
    background: ${({ theme }) => theme.colors.brandRedSoft};
    color: ${({ theme }) => theme.colors.foreground};
  }

  * {
    scrollbar-color: ${({ theme }) => theme.colors.mutedForeground}66 transparent;
    scrollbar-width: thin;
  }

  *::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  *::-webkit-scrollbar-thumb {
    border: 2px solid transparent;
    border-radius: ${({ theme }) => theme.radii.pill};
    background: ${({ theme }) => theme.colors.mutedForeground}66;
    background-clip: padding-box;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

"use client";

import { css } from "styled-components";

export const focusRing = css`
  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px ${({ theme }) => theme.colors.background},
      0 0 0 4px ${({ theme }) => theme.colors.ring};
  }
`;

export const controlReset = css`
  border: 0;
  appearance: none;
  font: inherit;
`;

export const iconChildren = css`
  svg {
    width: 1rem;
    height: 1rem;
    flex: 0 0 auto;
    pointer-events: none;
  }
`;

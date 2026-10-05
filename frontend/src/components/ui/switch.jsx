"use client";

import { forwardRef } from "react";
import styled from "styled-components";

import { focusRing } from "./internal-styles";

const Track = styled.button`
  ${focusRing}
  display: inline-flex;
  width: 2.25rem;
  height: 1.25rem;
  flex: 0 0 auto;
  align-items: center;
  padding: 0.125rem;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $checked, theme }) =>
    $checked ? theme.colors.primary : theme.colors.muted};
  transition: background 150ms ease;
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;
const Thumb = styled.span`
  width: 1rem;
  height: 1rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.card};
  transform: translateX(${({ $checked }) => ($checked ? "1rem" : "0")});
  transition: transform 150ms ease;
`;

export const Switch = forwardRef(function Switch(
  { checked = false, onCheckedChange, ...props },
  ref,
) {
  return (
    <Track
      $checked={checked}
      aria-checked={checked}
      data-slot="switch"
      onClick={() => onCheckedChange?.(!checked)}
      ref={ref}
      role="switch"
      type="button"
      {...props}
    >
      <Thumb $checked={checked} />
    </Track>
  );
});

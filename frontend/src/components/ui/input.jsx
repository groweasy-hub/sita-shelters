"use client";

import { forwardRef } from "react";
import styled from "styled-components";

import { focusRing } from "./internal-styles";

const StyledInput = styled.input`
  ${focusRing}
  width: 100%;
  min-width: 0;
  height: 2.25rem;
  padding: 0.375rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.input};
  border-radius: ${({ theme }) => theme.radii.md};
  outline: none;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.875rem;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.mutedForeground};
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    background: ${({ theme }) => theme.colors.muted};
  }
  &[aria-invalid="true"] {
    border-color: ${({ theme }) => theme.colors.danger};
  }
`;

export const Input = forwardRef(function Input(props, ref) {
  return <StyledInput ref={ref} data-slot="input" {...props} />;
});

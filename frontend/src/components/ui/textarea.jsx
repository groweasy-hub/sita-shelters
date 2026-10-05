"use client";

import { forwardRef } from "react";
import styled from "styled-components";

import { focusRing } from "./internal-styles";

const StyledTextarea = styled.textarea`
  ${focusRing}
  width: 100%;
  min-width: 0;
  min-height: 5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.input};
  border-radius: ${({ theme }) => theme.radii.md};
  outline: none;
  resize: vertical;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  font-family: inherit;
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

export const Textarea = forwardRef(function Textarea(props, ref) {
  return <StyledTextarea ref={ref} data-slot="textarea" {...props} />;
});

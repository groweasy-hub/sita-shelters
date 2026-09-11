"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import styled, { css } from "styled-components";

import { controlReset, focusRing, iconChildren } from "./internal-styles";

const variantStyles = {
  default: css`
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primaryForeground};
    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  `,
  destructive: css`
    background: ${({ theme }) => theme.colors.danger};
    color: ${({ theme }) => theme.colors.dangerForeground};
    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  `,
  outline: css`
    border: 1px solid ${({ theme }) => theme.colors.input};
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.foreground};
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.accent};
      color: ${({ theme }) => theme.colors.accentForeground};
    }
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.secondaryForeground};
    &:hover:not(:disabled) {
      filter: brightness(0.97);
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.foreground};
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.accent};
      color: ${({ theme }) => theme.colors.accentForeground};
    }
  `,
  link: css`
    height: auto;
    padding: 0;
    border-radius: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.foreground};
    &:hover:not(:disabled) {
      text-decoration: underline;
    }
  `,
};

const sizeStyles = {
  default: css`
    height: 2.25rem;
    padding: 0 1rem;
  `,
  sm: css`
    height: 2rem;
    padding: 0 0.75rem;
    font-size: 0.75rem;
  `,
  lg: css`
    height: 2.5rem;
    padding: 0 1.25rem;
  `,
  icon: css`
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
  `,
  "icon-sm": css`
    width: 2rem;
    height: 2rem;
    padding: 0;
  `,
  "icon-lg": css`
    width: 2.5rem;
    height: 2.5rem;
    padding: 0;
  `,
};

const StyledButton = styled.button`
  ${controlReset}
  ${focusRing}
  ${iconChildren}
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    opacity 150ms ease;
  ${({ $variant }) => variantStyles[$variant] ?? variantStyles.default}
  ${({ $size }) => sizeStyles[$size] ?? sizeStyles.default}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export function buttonVariants(options = {}) {
  return options;
}

export const Button = forwardRef(function Button(
  { asChild = false, variant = "default", size = "default", ...props },
  ref,
) {
  return (
    <StyledButton
      as={asChild ? Slot : "button"}
      ref={ref}
      $variant={variant}
      $size={size}
      data-slot="button"
      {...props}
    />
  );
});

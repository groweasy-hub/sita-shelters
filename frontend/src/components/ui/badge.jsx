"use client";

import { Slot } from "@radix-ui/react-slot";
import styled, { css } from "styled-components";

const variants = {
  default: css`
    border-color: transparent;
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primaryForeground};
  `,
  secondary: css`
    border-color: transparent;
    background: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.secondaryForeground};
  `,
  destructive: css`
    border-color: transparent;
    background: ${({ theme }) => theme.colors.danger}18;
    color: ${({ theme }) => theme.colors.danger};
  `,
  outline: css`
    border-color: ${({ theme }) => theme.colors.border};
    background: transparent;
    color: ${({ theme }) => theme.colors.foreground};
  `,
  muted: css`
    border-color: transparent;
    background: ${({ theme }) => theme.colors.muted};
    color: ${({ theme }) => theme.colors.mutedForeground};
  `,
  success: css`
    border-color: transparent;
    background: ${({ theme }) => theme.colors.success}18;
    color: ${({ theme }) => theme.colors.success};
  `,
  warning: css`
    border-color: transparent;
    background: ${({ theme }) => theme.colors.warning}18;
    color: ${({ theme }) => theme.colors.warning};
  `,
  info: css`
    border-color: transparent;
    background: ${({ theme }) => theme.colors.info}18;
    color: ${({ theme }) => theme.colors.info};
  `,
};

const StyledBadge = styled.span`
  display: inline-flex;
  width: fit-content;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  min-height: 1.25rem;
  padding: 0.125rem 0.5rem;
  overflow: hidden;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1rem;
  white-space: nowrap;
  ${({ $variant }) => variants[$variant] ?? variants.default}

  svg {
    width: 0.75rem;
    height: 0.75rem;
  }
`;

export function badgeVariants(options = {}) {
  return options;
}

export function Badge({ asChild = false, variant = "default", ...props }) {
  return (
    <StyledBadge
      as={asChild ? Slot : "span"}
      $variant={variant}
      data-slot="badge"
      {...props}
    />
  );
}

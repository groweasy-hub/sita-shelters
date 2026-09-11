"use client";

import styled from "styled-components";

import { formatInitials } from "@/lib/formatters";

const Circle = styled.span`
  display: inline-flex;
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accentForeground};
  font-size: 0.6875rem;
  font-weight: 650;
  letter-spacing: 0.02em;
`;

export function UserAvatar({ name, size = "1.75rem", ...props }) {
  return (
    <Circle $size={size} aria-hidden="true" {...props}>
      {formatInitials(name)}
    </Circle>
  );
}

"use client";

import { LoaderCircle } from "lucide-react";
import styled, { keyframes } from "styled-components";

const spin = keyframes`to { transform: rotate(360deg); }`;
const State = styled.div`
  display: ${({ $variant }) =>
    $variant === "inline" ? "inline-flex" : "flex"};
  min-height: ${({ $variant }) =>
    $variant === "page" ? "50vh" : $variant === "section" ? "10rem" : "2rem"};
  flex-direction: ${({ $variant }) =>
    $variant === "inline" ? "row" : "column"};
  align-items: center;
  justify-content: center;
  gap: ${({ $variant }) => ($variant === "inline" ? "0.5rem" : "0.75rem")};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.875rem;
  font-weight: ${({ $variant }) => ($variant === "inline" ? 400 : 600)};
  svg {
    width: ${({ $variant }) => ($variant === "inline" ? "1rem" : "1.25rem")};
    height: ${({ $variant }) => ($variant === "inline" ? "1rem" : "1.25rem")};
    animation: ${spin} 800ms linear infinite;
  }
`;

export function LoadingState({
  label = "Loading",
  variant = "section",
  ...props
}) {
  return (
    <State
      $variant={variant}
      aria-busy="true"
      aria-live="polite"
      role="status"
      {...props}
    >
      <LoaderCircle aria-hidden="true" strokeWidth={1.75} />
      <span>{label}</span>
    </State>
  );
}

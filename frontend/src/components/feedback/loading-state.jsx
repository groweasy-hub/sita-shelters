"use client";

import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;
const spin = keyframes`to { transform: rotate(360deg); }`;
const pulseLabel = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const SIZES = {
  inline: { ring: "1.125rem", thickness: "2px" },
  section: { ring: "2rem", thickness: "2.5px" },
  page: { ring: "3.25rem", thickness: "3px" },
};

const State = styled.div`
  display: ${({ $variant }) =>
    $variant === "inline" ? "inline-flex" : "flex"};
  min-height: ${({ $variant }) =>
    $variant === "page" ? "60vh" : $variant === "section" ? "10rem" : "2rem"};
  flex-direction: ${({ $variant }) =>
    $variant === "inline" ? "row" : "column"};
  align-items: center;
  justify-content: center;
  gap: ${({ $variant }) => ($variant === "inline" ? "0.625rem" : "1.375rem")};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.875rem;
  font-weight: ${({ $variant }) => ($variant === "inline" ? 400 : 600)};
  animation: ${fadeIn} 360ms cubic-bezier(0.16, 1, 0.3, 1) both;
`;

// Two stacked rings: a static full-circle "track" plus a rotating
// three-quarter "indicator" arc on top — the standard, unambiguous spinner
// shape (Material/Ant-style), so it reads immediately as "loading", not as
// an odd sliver of color.
const RingWrap = styled.span`
  position: relative;
  flex: 0 0 auto;
  width: ${({ $variant }) => SIZES[$variant].ring};
  height: ${({ $variant }) => SIZES[$variant].ring};
`;
const Track = styled.span`
  position: absolute;
  inset: 0;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: ${({ $variant }) => SIZES[$variant].thickness} solid
    ${({ theme }) => theme.colors.border};
`;
const Indicator = styled.span`
  position: absolute;
  inset: 0;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: ${({ $variant }) => SIZES[$variant].thickness} solid transparent;
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-right-color: ${({ theme }) => theme.colors.primary};
  border-bottom-color: ${({ theme }) => theme.colors.primary}66;
  animation: ${spin} 850ms cubic-bezier(0.65, 0, 0.35, 1) infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const TextGroup = styled.div`
  display: grid;
  justify-items: ${({ $variant }) =>
    $variant === "inline" ? "start" : "center"};
  gap: 0.25rem;
`;
const Label = styled.span`
  color: ${({ $variant, theme }) =>
    $variant === "page" ? theme.colors.foreground : "inherit"};
  font-size: ${({ $variant }) => ($variant === "page" ? "1rem" : "inherit")};
  font-weight: ${({ $variant }) => ($variant === "page" ? 650 : "inherit")};
  letter-spacing: ${({ $variant }) =>
    $variant === "page" ? "0.01em" : "normal"};
  animation: ${pulseLabel} 1.8s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
const SubLabel = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-weight: 400;
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
      <RingWrap $variant={variant} aria-hidden="true">
        <Track $variant={variant} />
        <Indicator $variant={variant} />
      </RingWrap>
      <TextGroup $variant={variant}>
        <Label $variant={variant}>{label}</Label>
        {variant === "page" ? (
          <SubLabel>This will only take a moment</SubLabel>
        ) : null}
      </TextGroup>
    </State>
  );
}

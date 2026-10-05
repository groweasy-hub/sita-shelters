"use client";

import { forwardRef } from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import styled, { css } from "styled-components";

import { focusRing } from "./internal-styles";

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuPortal = DropdownPrimitive.Portal;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuGroup = DropdownPrimitive.Group;
export const DropdownMenuRadioGroup = DropdownPrimitive.RadioGroup;
export const DropdownMenuSub = DropdownPrimitive.Sub;

const StyledContent = styled(DropdownPrimitive.Content)`
  z-index: 60;
  min-width: 10rem;
  padding: 0.25rem;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  outline: none;
  background: ${({ theme }) => theme.colors.popover};
  color: ${({ theme }) => theme.colors.popoverForeground};
  box-shadow: ${({ theme }) => theme.shadows.overlay};
`;

export const DropdownMenuContent = forwardRef(function DropdownMenuContent(
  { sideOffset = 6, ...props },
  ref,
) {
  return (
    <DropdownPrimitive.Portal>
      <StyledContent ref={ref} sideOffset={sideOffset} {...props} />
    </DropdownPrimitive.Portal>
  );
});

const itemBase = css`
  ${focusRing}
  position: relative;
  display: flex;
  min-height: 2rem;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  outline: none;
  font-size: 0.875rem;
  user-select: none;
  &[data-disabled] {
    pointer-events: none;
    opacity: 0.5;
  }
  &[data-highlighted] {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentForeground};
  }
  svg {
    width: 1rem;
    height: 1rem;
    flex: 0 0 auto;
  }
`;

const StyledItem = styled(DropdownPrimitive.Item)`
  ${itemBase}
  ${({ $inset }) => $inset && "padding-left: 2rem;"}
  ${({ $variant, theme }) =>
    $variant === "destructive" &&
    css`
      color: ${theme.colors.danger};
      &[data-highlighted] {
        background: ${theme.colors.danger}18;
        color: ${theme.colors.danger};
      }
    `}
`;

export const DropdownMenuItem = forwardRef(function DropdownMenuItem(
  { inset = false, variant = "default", ...props },
  ref,
) {
  return <StyledItem ref={ref} $inset={inset} $variant={variant} {...props} />;
});

const StyledCheckboxItem = styled(DropdownPrimitive.CheckboxItem)`
  ${itemBase}
  padding-left: 2rem;
`;

const StyledRadioItem = styled(DropdownPrimitive.RadioItem)`
  ${itemBase}
  padding-left: 2rem;
`;

const Indicator = styled.span`
  position: absolute;
  left: 0.5rem;
  display: inline-flex;
  width: 1rem;
  height: 1rem;
  align-items: center;
  justify-content: center;
`;

export const DropdownMenuCheckboxItem = forwardRef(
  function DropdownMenuCheckboxItem({ children, ...props }, ref) {
    return (
      <StyledCheckboxItem ref={ref} {...props}>
        <Indicator>
          <DropdownPrimitive.ItemIndicator>
            <Check aria-hidden="true" />
          </DropdownPrimitive.ItemIndicator>
        </Indicator>
        {children}
      </StyledCheckboxItem>
    );
  },
);

export const DropdownMenuRadioItem = forwardRef(function DropdownMenuRadioItem(
  { children, ...props },
  ref,
) {
  return (
    <StyledRadioItem ref={ref} {...props}>
      <Indicator>
        <DropdownPrimitive.ItemIndicator>
          <Circle aria-hidden="true" size={8} fill="currentColor" />
        </DropdownPrimitive.ItemIndicator>
      </Indicator>
      {children}
    </StyledRadioItem>
  );
});

const StyledLabel = styled(DropdownPrimitive.Label)`
  padding: 0.375rem 0.5rem;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.75rem;
  font-weight: 650;
  ${({ $inset }) => $inset && "padding-left: 2rem;"}
`;

export const DropdownMenuLabel = forwardRef(function DropdownMenuLabel(
  { inset = false, ...props },
  ref,
) {
  return <StyledLabel ref={ref} $inset={inset} {...props} />;
});

export const DropdownMenuSeparator = styled(DropdownPrimitive.Separator)`
  height: 1px;
  margin: 0.25rem -0.25rem;
  background: ${({ theme }) => theme.colors.border};
`;

export const DropdownMenuShortcut = styled.span`
  margin-left: auto;
  padding-left: 1rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
`;

const StyledSubTrigger = styled(DropdownPrimitive.SubTrigger)`
  ${itemBase}
  ${({ $inset }) => $inset && "padding-left: 2rem;"}
`;

const SubmenuChevron = styled(ChevronRight)`
  margin-left: auto;
`;

export const DropdownMenuSubTrigger = forwardRef(
  function DropdownMenuSubTrigger({ inset = false, children, ...props }, ref) {
    return (
      <StyledSubTrigger ref={ref} $inset={inset} {...props}>
        {children}
        <SubmenuChevron aria-hidden="true" />
      </StyledSubTrigger>
    );
  },
);

export const DropdownMenuSubContent = styled(DropdownPrimitive.SubContent)`
  z-index: 60;
  min-width: 10rem;
  padding: 0.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.popover};
  box-shadow: ${({ theme }) => theme.shadows.overlay};
`;

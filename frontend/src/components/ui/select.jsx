"use client";

import { forwardRef } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import styled from "styled-components";

import { focusRing } from "./internal-styles";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

const StyledTrigger = styled(SelectPrimitive.Trigger)`
  ${focusRing}
  display: inline-flex;
  width: fit-content;
  min-width: 8rem;
  height: ${({ $size }) => ($size === "sm" ? "2rem" : "2.25rem")};
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.input};
  border-radius: ${({ theme }) => theme.radii.md};
  outline: none;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  font-size: ${({ $size }) => ($size === "sm" ? "0.75rem" : "0.875rem")};
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  svg {
    width: 1rem;
    height: 1rem;
    flex: 0 0 auto;
    color: ${({ theme }) => theme.colors.mutedForeground};
  }
`;

export const SelectTrigger = forwardRef(function SelectTrigger(
  { size = "default", children, ...props },
  ref,
) {
  return (
    <StyledTrigger ref={ref} $size={size} data-slot="select-trigger" {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown aria-hidden="true" />
      </SelectPrimitive.Icon>
    </StyledTrigger>
  );
});

const ScrollButton = styled.div`
  display: flex;
  height: 1.5rem;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.mutedForeground};
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

export const SelectScrollUpButton = forwardRef(
  function SelectScrollUpButton(props, ref) {
    return (
      <SelectPrimitive.ScrollUpButton ref={ref} asChild {...props}>
        <ScrollButton>
          <ChevronUp aria-hidden="true" />
        </ScrollButton>
      </SelectPrimitive.ScrollUpButton>
    );
  },
);

export const SelectScrollDownButton = forwardRef(
  function SelectScrollDownButton(props, ref) {
    return (
      <SelectPrimitive.ScrollDownButton ref={ref} asChild {...props}>
        <ScrollButton>
          <ChevronDown aria-hidden="true" />
        </ScrollButton>
      </SelectPrimitive.ScrollDownButton>
    );
  },
);

const StyledContent = styled(SelectPrimitive.Content)`
  position: relative;
  z-index: 60;
  max-height: var(--radix-select-content-available-height);
  min-width: var(--radix-select-trigger-width);
  overflow: hidden auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.popover};
  color: ${({ theme }) => theme.colors.popoverForeground};
  box-shadow: ${({ theme }) => theme.shadows.overlay};
`;

const Viewport = styled(SelectPrimitive.Viewport)`
  padding: 0.25rem;
`;

export const SelectContent = forwardRef(function SelectContent(
  { children, position = "popper", ...props },
  ref,
) {
  return (
    <SelectPrimitive.Portal>
      <StyledContent ref={ref} position={position} {...props}>
        <SelectScrollUpButton />
        <Viewport>{children}</Viewport>
        <SelectScrollDownButton />
      </StyledContent>
    </SelectPrimitive.Portal>
  );
});

export const SelectLabel = styled(SelectPrimitive.Label)`
  display: block;
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 650;
`;

const StyledItem = styled(SelectPrimitive.Item)`
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  min-height: 2rem;
  padding: 0.375rem 2rem 0.375rem 0.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  outline: none;
  font-size: 0.875rem;
  user-select: none;
  &[data-highlighted] {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentForeground};
  }
  &[data-disabled] {
    opacity: 0.5;
  }
`;

const ItemIndicator = styled.span`
  position: absolute;
  right: 0.5rem;
  display: inline-flex;
  width: 1rem;
  height: 1rem;
  align-items: center;
  justify-content: center;
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

export const SelectItem = forwardRef(function SelectItem(
  { children, ...props },
  ref,
) {
  return (
    <StyledItem ref={ref} {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <ItemIndicator>
        <SelectPrimitive.ItemIndicator>
          <Check aria-hidden="true" />
        </SelectPrimitive.ItemIndicator>
      </ItemIndicator>
    </StyledItem>
  );
});

export const SelectSeparator = styled(SelectPrimitive.Separator)`
  height: 1px;
  margin: 0.25rem -0.25rem;
  background: ${({ theme }) => theme.colors.border};
`;

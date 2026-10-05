"use client";

import { forwardRef } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import styled from "styled-components";

export function TooltipProvider({
  delayDuration = 300,
  skipDelayDuration = 100,
  ...props
}) {
  return (
    <TooltipPrimitive.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      {...props}
    />
  );
}

export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

const StyledContent = styled(TooltipPrimitive.Content)`
  z-index: 60;
  max-width: 18rem;
  padding: 0.375rem 0.625rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.popover};
  color: ${({ theme }) => theme.colors.popoverForeground};
  box-shadow: ${({ theme }) => theme.shadows.subtle};
  font-size: 0.75rem;
  line-height: 1rem;
`;

export const TooltipContent = forwardRef(function TooltipContent(
  { sideOffset = 6, showArrow = false, children, ...props },
  ref,
) {
  return (
    <TooltipPrimitive.Portal>
      <StyledContent ref={ref} sideOffset={sideOffset} {...props}>
        {children}
        {showArrow ? <TooltipPrimitive.Arrow /> : null}
      </StyledContent>
    </TooltipPrimitive.Portal>
  );
});

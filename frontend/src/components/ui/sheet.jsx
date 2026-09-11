"use client";

import { forwardRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import styled, { css } from "styled-components";

import { focusRing } from "./internal-styles";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetPortal = DialogPrimitive.Portal;

const StyledOverlay = styled(DialogPrimitive.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 50;
  background: ${({ theme }) => theme.colors.backdrop};
  backdrop-filter: blur(2px);
  transition: opacity 200ms ease;
  &[data-state="closed"] {
    opacity: 0;
  }
`;

export const SheetOverlay = forwardRef(function SheetOverlay(props, ref) {
  return <StyledOverlay ref={ref} data-slot="sheet-overlay" {...props} />;
});

const sides = {
  right: css`
    inset: 0 0 0 auto;
    width: min(80vw, 28rem);
    border-left: 1px solid ${({ theme }) => theme.colors.border};
    &[data-state="closed"] {
      transform: translateX(100%);
    }
  `,
  left: css`
    inset: 0 auto 0 0;
    width: min(80vw, 28rem);
    border-right: 1px solid ${({ theme }) => theme.colors.border};
    &[data-state="closed"] {
      transform: translateX(-100%);
    }
  `,
  top: css`
    inset: 0 0 auto;
    max-height: 85dvh;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    &[data-state="closed"] {
      transform: translateY(-100%);
    }
  `,
  bottom: css`
    inset: auto 0 0;
    max-height: 85dvh;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    &[data-state="closed"] {
      transform: translateY(100%);
    }
  `,
};

const StyledContent = styled(DialogPrimitive.Content)`
  position: fixed;
  z-index: 51;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: auto;
  outline: none;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  box-shadow: ${({ theme }) => theme.shadows.overlay};
  transition: transform 260ms ease;
  ${({ $side }) => sides[$side] ?? sides.right}
`;

const CloseButton = styled(DialogPrimitive.Close)`
  ${focusRing}
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.mutedForeground};
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

export function sheetVariants(options = {}) {
  return options;
}

export const SheetContent = forwardRef(function SheetContent(
  { side = "right", children, showCloseButton = true, ...props },
  ref,
) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <StyledContent
        ref={ref}
        $side={side}
        data-slot="sheet-content"
        {...props}
      >
        {children}
        {showCloseButton ? (
          <CloseButton>
            <X aria-hidden="true" />
            <span className="sr-only">Close</span>
          </CloseButton>
        ) : null}
      </StyledContent>
    </SheetPortal>
  );
});

export const SheetHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 1.25rem 1.25rem 0;
`;

export const SheetFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: auto;
  padding: 1rem 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const SheetTitle = styled(DialogPrimitive.Title)`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 650;
  line-height: 1.5rem;
`;

export const SheetDescription = styled(DialogPrimitive.Description)`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.875rem;
  line-height: 1.3rem;
`;

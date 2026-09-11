"use client";

import { forwardRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import styled from "styled-components";

import { focusRing } from "./internal-styles";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

const StyledOverlay = styled(DialogPrimitive.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 50;
  background: ${({ theme }) => theme.colors.backdrop};
  backdrop-filter: blur(2px);
  transition: opacity 180ms ease;
  &[data-state="closed"] {
    opacity: 0;
  }
  &[data-state="open"] {
    opacity: 1;
  }
`;

export const DialogOverlay = forwardRef(function DialogOverlay(props, ref) {
  return <StyledOverlay ref={ref} data-slot="dialog-overlay" {...props} />;
});

const StyledContent = styled(DialogPrimitive.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 51;
  display: grid;
  width: calc(100% - 2rem);
  max-width: 32rem;
  max-height: calc(100dvh - 2rem);
  gap: 1rem;
  padding: 1.5rem;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  outline: none;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  box-shadow: ${({ theme }) => theme.shadows.overlay};
  transform: translate(-50%, -50%);
  transition:
    opacity 180ms ease,
    transform 180ms ease;
  &[data-state="closed"] {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.98);
  }
`;

const CloseButton = styled(DialogPrimitive.Close)`
  ${focusRing}
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
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
    color: ${({ theme }) => theme.colors.accentForeground};
  }
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

export const DialogContent = forwardRef(function DialogContent(
  { children, showCloseButton = true, ...props },
  ref,
) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <StyledContent ref={ref} data-slot="dialog-content" {...props}>
        {children}
        {showCloseButton ? (
          <CloseButton>
            <X aria-hidden="true" />
            <span className="sr-only">Close</span>
          </CloseButton>
        ) : null}
      </StyledContent>
    </DialogPortal>
  );
});

export const DialogHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  text-align: left;
`;

export const DialogFooter = styled.div`
  display: flex;
  flex-direction: column-reverse;
  gap: 0.5rem;
  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: flex-end;
  }
`;

export const DialogTitle = styled(DialogPrimitive.Title)`
  margin: 0;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 1.125rem;
  font-weight: 650;
  line-height: 1.5rem;
`;

export const DialogDescription = styled(DialogPrimitive.Description)`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.875rem;
  line-height: 1.35rem;
`;

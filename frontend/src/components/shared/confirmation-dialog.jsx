"use client";

import { useState } from "react";
import { LoaderCircle, TriangleAlert } from "lucide-react";
import styled, { keyframes } from "styled-components";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const spin = keyframes`to { transform: rotate(360deg); }`;
const Warning = styled.span`
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 0.25rem;
  place-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.danger}18;
  color: ${({ theme }) => theme.colors.danger};
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;
const Body = styled.div`
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.875rem;
`;
const ErrorMessage = styled.div`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.danger}40;
  background: ${({ theme }) => theme.colors.danger}18;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.875rem;
`;
const Spinner = styled(LoaderCircle)`
  width: 1rem;
  height: 1rem;
  animation: ${spin} 800ms linear infinite;
`;

export function ConfirmationDialog({
  cancelLabel = "Cancel",
  children,
  closeOnConfirm = true,
  confirmDisabled = false,
  confirmLabel = "Confirm",
  defaultOpen = false,
  description = "Review the details before continuing.",
  destructive = false,
  errorMessage = "The action could not be completed. Please try again.",
  onConfirm,
  onConfirmError,
  onOpenChange,
  open,
  pending = false,
  title,
  trigger,
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalPending, setInternalPending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isControlled = open !== undefined;
  const resolvedOpen = isControlled ? open : internalOpen;
  const isPending = pending || internalPending;
  const updateOpen = (nextOpen) => {
    if (!isControlled) setInternalOpen(nextOpen);
    if (!nextOpen) setHasError(false);
    onOpenChange?.(nextOpen);
  };
  const handleOpenChange = (nextOpen) => {
    if (!isPending || nextOpen) updateOpen(nextOpen);
  };
  async function handleConfirm() {
    setHasError(false);
    setInternalPending(true);
    try {
      await onConfirm();
      if (closeOnConfirm) updateOpen(false);
    } catch (error) {
      setHasError(true);
      onConfirmError?.(error);
    } finally {
      setInternalPending(false);
    }
  }
  return (
    <Dialog onOpenChange={handleOpenChange} open={resolvedOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        aria-busy={isPending || undefined}
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (isPending) event.preventDefault();
        }}
      >
        <DialogHeader>
          {destructive ? (
            <Warning>
              <TriangleAlert aria-hidden="true" strokeWidth={1.75} />
            </Warning>
          ) : null}
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {children ? <Body>{children}</Body> : null}
        {hasError ? (
          <ErrorMessage aria-live="assertive" role="alert">
            {errorMessage}
          </ErrorMessage>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={isPending} type="button" variant="outline">
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button
            disabled={confirmDisabled || isPending}
            onClick={() => void handleConfirm()}
            type="button"
            variant={destructive ? "destructive" : "default"}
          >
            {isPending ? <Spinner aria-hidden="true" /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

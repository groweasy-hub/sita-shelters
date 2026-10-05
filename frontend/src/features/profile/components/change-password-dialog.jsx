"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheckBig } from "lucide-react";
import { useForm } from "react-hook-form";
import styled from "styled-components";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePassword } from "../hooks/use-current-user";
import {
  changePasswordDefaults,
  changePasswordInputSchema,
} from "../schemas/profile.schema";

const Form = styled.form`
  display: grid;
  gap: 1.25rem;
`;
const Field = styled.div`
  display: grid;
  min-width: 0;
  gap: 0.375rem;
`;
const Hint = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.75rem;
`;
const FormError = styled(ErrorText)`
  padding: 0.625rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.danger}40;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.danger}0d;
`;
const Success = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.875rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.success}40;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.success}18;
  color: ${({ theme }) => theme.colors.success};
  font-size: 0.875rem;
  svg {
    width: 1.125rem;
    height: 1.125rem;
    flex: 0 0 auto;
    margin-top: 0.0625rem;
  }
`;

function FieldError({ error }) {
  return error ? <ErrorText role="alert">{error.message}</ErrorText> : null;
}

export function ChangePasswordDialog({ trigger }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const changePassword = useChangePassword();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm({
    defaultValues: changePasswordDefaults,
    resolver: zodResolver(changePasswordInputSchema),
  });

  function handleOpenChange(nextOpen) {
    setOpen(nextOpen);
    reset(changePasswordDefaults);
    changePassword.reset();
    setDone(false);
  }

  async function onSubmit(values) {
    try {
      await changePassword.mutateAsync(values);
      reset(changePasswordDefaults);
      setDone(true);
    } catch (error) {
      const field = error?.issues?.[0]?.field;
      const message =
        error instanceof Error
          ? error.message
          : "Your password could not be changed. Please try again.";
      if (field === "currentPassword" || field === "newPassword") {
        setError(field, { message, type: "server" });
        return;
      }
      setError("root.server", { message, type: "server" });
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Choose a new password for your account. Your other signed-in
            devices will be logged out.
          </DialogDescription>
        </DialogHeader>
        {done ? (
          <>
            <Success role="status">
              <CircleCheckBig aria-hidden="true" />
              Your password has been updated. Use it the next time you sign in.
            </Success>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button">Done</Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <Form noValidate onSubmit={handleSubmit(onSubmit)}>
            <Field>
              <Label htmlFor="change-password-current">Current password</Label>
              <Input
                aria-invalid={Boolean(errors.currentPassword)}
                autoComplete="current-password"
                id="change-password-current"
                type="password"
                {...register("currentPassword")}
              />
              <FieldError error={errors.currentPassword} />
            </Field>
            <Field>
              <Label htmlFor="change-password-new">New password</Label>
              <Input
                aria-invalid={Boolean(errors.newPassword)}
                autoComplete="new-password"
                id="change-password-new"
                type="password"
                {...register("newPassword")}
              />
              {errors.newPassword ? (
                <FieldError error={errors.newPassword} />
              ) : (
                <Hint>At least 8 characters, with a letter and a number.</Hint>
              )}
            </Field>
            <Field>
              <Label htmlFor="change-password-confirm">Confirm new password</Label>
              <Input
                aria-invalid={Boolean(errors.confirmPassword)}
                autoComplete="new-password"
                id="change-password-confirm"
                type="password"
                {...register("confirmPassword")}
              />
              <FieldError error={errors.confirmPassword} />
            </Field>
            {errors.root?.server ? (
              <FormError role="alert">{errors.root.server.message}</FormError>
            ) : null}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Updating…" : "Update password"}
              </Button>
            </DialogFooter>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useUpdateProfile } from "../hooks/use-current-user";
import { profileInputSchema } from "../schemas/profile.schema";

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

function FieldError({ error }) {
  return error ? <ErrorText role="alert">{error.message}</ErrorText> : null;
}

function profileDefaults(user) {
  return { name: user.name ?? "", mobile: user.mobile ?? "" };
}

/** `trigger` is whatever button should open it — the header and the Personal tab both reuse this one form. */
export function EditProfileDialog({ trigger, user }) {
  const [open, setOpen] = useState(false);
  const updateProfile = useUpdateProfile();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm({
    defaultValues: profileDefaults(user),
    resolver: zodResolver(profileInputSchema),
  });

  function handleOpenChange(nextOpen) {
    setOpen(nextOpen);
    // Always start from what's currently saved, not a previous abandoned edit.
    reset(profileDefaults(user));
    updateProfile.reset();
  }

  async function onSubmit(values) {
    try {
      await updateProfile.mutateAsync(values);
      setOpen(false);
    } catch (error) {
      const field = error?.issues?.[0]?.field;
      const message =
        error instanceof Error
          ? error.message
          : "Your profile could not be updated. Please try again.";
      if (field === "name" || field === "mobile") {
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
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update the contact details on your account. Your role, project
            access and employment record are managed by an administrator.
          </DialogDescription>
        </DialogHeader>
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          <Field>
            <Label htmlFor="edit-profile-name">Full name</Label>
            <Input
              aria-invalid={Boolean(errors.name)}
              autoComplete="name"
              id="edit-profile-name"
              {...register("name")}
            />
            <FieldError error={errors.name} />
          </Field>
          <Field>
            <Label htmlFor="edit-profile-mobile">Mobile number</Label>
            <Input
              aria-invalid={Boolean(errors.mobile)}
              autoComplete="tel"
              id="edit-profile-mobile"
              inputMode="tel"
              placeholder="+91 98765 43210"
              {...register("mobile")}
            />
            <FieldError error={errors.mobile} />
          </Field>
          <Field>
            <Label htmlFor="edit-profile-email">Email address</Label>
            <Input disabled id="edit-profile-email" readOnly value={user.email} />
            <Hint>Email changes need re-verification and can&apos;t be edited here.</Hint>
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
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

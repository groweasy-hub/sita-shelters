"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_STATUS_OPTIONS } from "../constants/projects.constants";
import { updateProjectProgressInputSchema } from "../schemas/projects.schema";
import { useUpdateProjectProgress } from "../hooks/use-projects";

const Form = styled.form`
  display: grid;
  gap: 1.25rem;
`;
const Field = styled.div`
  display: grid;
  min-width: 0;
  gap: 0.375rem;
`;
const WideSelectTrigger = styled(SelectTrigger)`
  width: 100%;
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

export function UpdateProjectProgressDialog({ project }) {
  const [open, setOpen] = useState(false);
  const updateProgress = useUpdateProjectProgress();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm({
    defaultValues: {
      status: project.status,
      progressPercent: project.progressPercent,
    },
    resolver: zodResolver(updateProjectProgressInputSchema),
  });

  // Keep the form in sync if the project's own data refreshes underneath it.
  useEffect(() => {
    reset({ status: project.status, progressPercent: project.progressPercent });
  }, [project.status, project.progressPercent, reset]);

  function handleOpenChange(nextOpen) {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset({ status: project.status, progressPercent: project.progressPercent });
      updateProgress.reset();
    }
  }

  async function onSubmit(values) {
    try {
      await updateProgress.mutateAsync({ projectId: project.id, ...values });
      handleOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The project could not be updated. Please try again.";
      setError("root.server", { message, type: "server" });
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil aria-hidden="true" />
          Update status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update project status</DialogTitle>
          <DialogDescription>
            Set {project.name}&apos;s current delivery status and how much of
            it is complete.
          </DialogDescription>
        </DialogHeader>
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          <Field>
            <Label htmlFor="project-progress-status">Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  name={field.name}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <WideSelectTrigger
                    aria-invalid={Boolean(errors.status)}
                    id="project-progress-status"
                    onBlur={field.onBlur}
                    ref={field.ref}
                  >
                    <SelectValue />
                  </WideSelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError error={errors.status} />
          </Field>
          <Field>
            <Label htmlFor="project-progress-percent">Completion (%)</Label>
            <Input
              aria-invalid={Boolean(errors.progressPercent)}
              id="project-progress-percent"
              inputMode="numeric"
              max="100"
              min="0"
              type="number"
              {...register("progressPercent")}
            />
            <FieldError error={errors.progressPercent} />
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
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

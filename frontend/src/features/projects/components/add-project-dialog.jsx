"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Plus } from "lucide-react";
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
import { focusRing } from "@/components/ui/internal-styles";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUsersByRole } from "@/lib/mock-data/users";
import { PROJECT_STATUS_OPTIONS } from "../constants/projects.constants";
import { useCreateProject } from "../hooks/use-projects";
import {
  createProjectInputDefaults,
  createProjectInputSchema,
} from "../schemas/projects.schema";

const PROJECT_MANAGERS = getUsersByRole("project-manager");

const LargeDialogContent = styled(DialogContent)`
  max-width: 48rem;
`;
const Form = styled.form`
  display: grid;
  gap: 1.25rem;
`;
const Section = styled.section`
  display: grid;
  gap: 0.875rem;
  padding-top: 0.25rem;
`;
const SectionHeader = styled.div`
  display: grid;
  gap: 0.15rem;
`;
const SectionTitle = styled.h3`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 650;
`;
const SectionDescription = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const FieldGrid = styled.div`
  display: grid;
  gap: 0.875rem;
  @media (min-width: 600px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;
const Field = styled.div`
  display: grid;
  min-width: 0;
  gap: 0.375rem;
`;
const FullWidthField = styled(Field)`
  @media (min-width: 600px) {
    grid-column: 1 / -1;
  }
`;
const WideSelectTrigger = styled(SelectTrigger)`
  width: 100%;
`;
const Textarea = styled.textarea`
  ${focusRing}
  width: 100%;
  min-height: 5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.input};
  border-radius: ${({ theme }) => theme.radii.md};
  outline: none;
  resize: vertical;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  font: inherit;
  font-size: 0.875rem;
  line-height: 1.4;
  &::placeholder {
    color: ${({ theme }) => theme.colors.mutedForeground};
  }
  &[aria-invalid="true"] {
    border-color: ${({ theme }) => theme.colors.danger};
  }
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

export function AddProjectDialog({ onCreated }) {
  const [open, setOpen] = useState(false);
  const createProject = useCreateProject();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm({
    defaultValues: createProjectInputDefaults,
    resolver: zodResolver(createProjectInputSchema),
  });
  const startDate = useWatch({ control, name: "startDate" });

  function handleOpenChange(nextOpen) {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset(createProjectInputDefaults);
      createProject.reset();
    }
  }

  async function onSubmit(values) {
    try {
      const project = await createProject.mutateAsync(values);
      handleOpenChange(false);
      onCreated?.(project);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The project could not be added. Please try again.";
      if (message.toLocaleLowerCase().includes("project with code")) {
        setError("code", { message, type: "server" });
        setError("root.server", { message, type: "server" });
        return;
      }
      setError("root.server", { message, type: "server" });
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Add project
        </Button>
      </DialogTrigger>
      <LargeDialogContent>
        <DialogHeader>
          <DialogTitle>Add project</DialogTitle>
          <DialogDescription>
            Create a project record with its schedule, ownership and complete
            site address.
          </DialogDescription>
        </DialogHeader>
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          <Section>
            <SectionHeader>
              <SectionTitle>Project information</SectionTitle>
              <SectionDescription>
                Identify the project and set its current delivery status.
              </SectionDescription>
            </SectionHeader>
            <FieldGrid>
              <Field>
                <Label htmlFor="project-name">Project name</Label>
                <Input
                  aria-invalid={Boolean(errors.name)}
                  autoComplete="organization"
                  id="project-name"
                  placeholder="e.g. SITA Horizon"
                  {...register("name")}
                />
                <FieldError error={errors.name} />
              </Field>
              <Field>
                <Label htmlFor="project-code">Project code</Label>
                <Input
                  aria-invalid={Boolean(errors.code)}
                  autoCapitalize="characters"
                  id="project-code"
                  placeholder="e.g. SS-009"
                  {...register("code")}
                />
                <FieldError error={errors.code} />
              </Field>
              <Field>
                <Label htmlFor="project-status">Status</Label>
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
                        id="project-status"
                        onBlur={field.onBlur}
                        ref={field.ref}
                      >
                        <SelectValue placeholder="Select a status" />
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
                <Label htmlFor="project-manager">Project manager</Label>
                <Controller
                  control={control}
                  name="projectManagerId"
                  render={({ field }) => (
                    <Select
                      name={field.name}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <WideSelectTrigger
                        aria-invalid={Boolean(errors.projectManagerId)}
                        id="project-manager"
                        onBlur={field.onBlur}
                        ref={field.ref}
                      >
                        <SelectValue placeholder="Select a manager" />
                      </WideSelectTrigger>
                      <SelectContent>
                        {PROJECT_MANAGERS.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError error={errors.projectManagerId} />
              </Field>
              <Field>
                <Label htmlFor="project-start-date">Start date</Label>
                <Input
                  aria-invalid={Boolean(errors.startDate)}
                  id="project-start-date"
                  type="date"
                  {...register("startDate")}
                />
                <FieldError error={errors.startDate} />
              </Field>
              <Field>
                <Label htmlFor="project-completion-date">
                  Estimated completion
                </Label>
                <Input
                  aria-invalid={Boolean(errors.estimatedCompletionDate)}
                  id="project-completion-date"
                  min={startDate || undefined}
                  type="date"
                  {...register("estimatedCompletionDate")}
                />
                <FieldError error={errors.estimatedCompletionDate} />
              </Field>
              <Field>
                <Label htmlFor="project-progress">Completion (%)</Label>
                <Input
                  aria-invalid={Boolean(errors.progressPercent)}
                  id="project-progress"
                  inputMode="numeric"
                  max="100"
                  min="0"
                  type="number"
                  {...register("progressPercent")}
                />
                <FieldError error={errors.progressPercent} />
              </Field>
              <FullWidthField>
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  aria-invalid={Boolean(errors.description)}
                  id="project-description"
                  placeholder="Summarise the project scope and key deliverables"
                  {...register("description")}
                />
                <FieldError error={errors.description} />
              </FullWidthField>
            </FieldGrid>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>Site address</SectionTitle>
              <SectionDescription>
                Add enough detail for deliveries and site teams to find the
                project.
              </SectionDescription>
            </SectionHeader>
            <FieldGrid>
              <FullWidthField>
                <Label htmlFor="project-address-line-1">Address line 1</Label>
                <Input
                  aria-invalid={Boolean(errors.address?.line1)}
                  autoComplete="address-line1"
                  id="project-address-line-1"
                  placeholder="Plot, survey number, street or road"
                  {...register("address.line1")}
                />
                <FieldError error={errors.address?.line1} />
              </FullWidthField>
              <FullWidthField>
                <Label htmlFor="project-address-line-2">
                  Address line 2 (optional)
                </Label>
                <Input
                  aria-invalid={Boolean(errors.address?.line2)}
                  autoComplete="address-line2"
                  id="project-address-line-2"
                  placeholder="Area, neighbourhood or building"
                  {...register("address.line2")}
                />
                <FieldError error={errors.address?.line2} />
              </FullWidthField>
              <FullWidthField>
                <Label htmlFor="project-landmark">Landmark (optional)</Label>
                <Input
                  aria-invalid={Boolean(errors.address?.landmark)}
                  id="project-landmark"
                  placeholder="e.g. Near the metro station"
                  {...register("address.landmark")}
                />
                <FieldError error={errors.address?.landmark} />
              </FullWidthField>
              <Field>
                <Label htmlFor="project-city">City</Label>
                <Input
                  aria-invalid={Boolean(errors.address?.city)}
                  autoComplete="address-level2"
                  id="project-city"
                  placeholder="City"
                  {...register("address.city")}
                />
                <FieldError error={errors.address?.city} />
              </Field>
              <Field>
                <Label htmlFor="project-state">State</Label>
                <Input
                  aria-invalid={Boolean(errors.address?.state)}
                  autoComplete="address-level1"
                  id="project-state"
                  placeholder="State"
                  {...register("address.state")}
                />
                <FieldError error={errors.address?.state} />
              </Field>
              <Field>
                <Label htmlFor="project-postal-code">PIN code</Label>
                <Input
                  aria-invalid={Boolean(errors.address?.postalCode)}
                  autoComplete="postal-code"
                  id="project-postal-code"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit PIN code"
                  {...register("address.postalCode")}
                />
                <FieldError error={errors.address?.postalCode} />
              </Field>
              <Field>
                <Label htmlFor="project-country">Country</Label>
                <Input
                  aria-invalid={Boolean(errors.address?.country)}
                  autoComplete="country-name"
                  id="project-country"
                  {...register("address.country")}
                />
                <FieldError error={errors.address?.country} />
              </Field>
            </FieldGrid>
          </Section>

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
              {isSubmitting ? "Adding project…" : "Add project"}
            </Button>
          </DialogFooter>
        </Form>
      </LargeDialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Check, Copy, Plus } from "lucide-react";
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
import { ROLE_LABELS } from "@/config/permissions";
import { useProjectDirectory } from "@/hooks";
import {
  ASSIGNABLE_EMPLOYEE_ROLES,
  DEPARTMENT_OPTIONS,
} from "../constants/administration.constants";
import { createAdminUserInputSchema } from "../schemas/administration.schema";
import {
  useAllAdministrationUsers,
  useCreateAdministrationUser,
} from "../hooks/use-administration-users";

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
const ProjectGrid = styled.div`
  display: grid;
  gap: 0.5rem;
  max-height: 12rem;
  overflow-y: auto;
  padding: 0.625rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.input};
  border-radius: ${({ theme }) => theme.radii.md};
`;
const ProjectOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  cursor: pointer;
`;
const ProjectHint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const ResultPanel = styled.div`
  display: grid;
  gap: 0.75rem;
`;
const ResultRow = styled.div`
  display: grid;
  gap: 0.25rem;
`;
const ResultLabel = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;
const PasswordRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
const PasswordValue = styled.code`
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.muted};
  font-size: 0.875rem;
  word-break: break-all;
`;
const ResultNote = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;

function FieldError({ error }) {
  return error ? <ErrorText role="alert">{error.message}</ErrorText> : null;
}

const NO_MANAGER = "none";
const defaultValues = {
  name: "",
  email: "",
  role: "site-engineer",
  projectIds: [],
  department: "",
  reportingManagerId: "",
  mobile: "",
  joiningDate: "",
};

export function AddUserDialog({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const createUser = useCreateAdministrationUser();
  const { data: projectOptions = [] } = useProjectDirectory();
  const { data: employees = [] } = useAllAdministrationUsers();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm({
    defaultValues,
    resolver: zodResolver(createAdminUserInputSchema),
  });

  function handleOpenChange(nextOpen) {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset(defaultValues);
      createUser.reset();
      setResult(null);
      setCopied(false);
    }
  }

  async function onSubmit(values) {
    try {
      const created = await createUser.mutateAsync(values);
      setResult(created);
      onCreated?.(created.user);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The user could not be created. Please try again.";
      if (message.toLocaleLowerCase().includes("email")) {
        setError("email", { message, type: "server" });
        setError("root.server", { message, type: "server" });
        return;
      }
      setError("root.server", { message, type: "server" });
    }
  }

  async function copyPassword() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.temporaryPassword);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Add user
        </Button>
      </DialogTrigger>
      <DialogContent>
        {result ? (
          <>
            <DialogHeader>
              <DialogTitle>{result.user.name} was added</DialogTitle>
              <DialogDescription>
                Share this one-time password with them — it won&apos;t be shown
                again. They should change it after signing in.
              </DialogDescription>
            </DialogHeader>
            <ResultPanel>
              <ResultRow>
                <ResultLabel>Employee ID</ResultLabel>
                <span>{result.user.employeeId}</span>
              </ResultRow>
              <ResultRow>
                <ResultLabel>Email</ResultLabel>
                <span>{result.user.email}</span>
              </ResultRow>
              <ResultRow>
                <ResultLabel>Temporary password</ResultLabel>
                <PasswordRow>
                  <PasswordValue>{result.temporaryPassword}</PasswordValue>
                  <Button
                    aria-label="Copy temporary password"
                    onClick={copyPassword}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    {copied ? (
                      <Check aria-hidden="true" />
                    ) : (
                      <Copy aria-hidden="true" />
                    )}
                  </Button>
                </PasswordRow>
              </ResultRow>
              <ResultNote>
                This password is only ever shown once, right here.
              </ResultNote>
            </ResultPanel>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)} type="button">
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add user</DialogTitle>
              <DialogDescription>
                Create an employee account and assign it to the project(s) it
                should work against.
              </DialogDescription>
            </DialogHeader>
            <Form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Field>
                <Label htmlFor="user-name">Full name</Label>
                <Input
                  aria-invalid={Boolean(errors.name)}
                  id="user-name"
                  placeholder="e.g. Divya Menon"
                  {...register("name")}
                />
                <FieldError error={errors.name} />
              </Field>
              <Field>
                <Label htmlFor="user-email">Email</Label>
                <Input
                  aria-invalid={Boolean(errors.email)}
                  id="user-email"
                  placeholder="name@company.com"
                  type="email"
                  {...register("email")}
                />
                <FieldError error={errors.email} />
              </Field>
              <Field>
                <Label htmlFor="user-role">Primary Role</Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      name={field.name}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <WideSelectTrigger
                        aria-invalid={Boolean(errors.role)}
                        id="user-role"
                        onBlur={field.onBlur}
                        ref={field.ref}
                      >
                        <SelectValue placeholder="Select a role" />
                      </WideSelectTrigger>
                      <SelectContent>
                        {ASSIGNABLE_EMPLOYEE_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {ROLE_LABELS[role] ?? role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError error={errors.role} />
              </Field>
              <Field>
                <Label htmlFor="user-department">Department</Label>
                <Controller
                  control={control}
                  name="department"
                  render={({ field }) => (
                    <Select
                      name={field.name}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <WideSelectTrigger
                        aria-invalid={Boolean(errors.department)}
                        id="user-department"
                        onBlur={field.onBlur}
                        ref={field.ref}
                      >
                        <SelectValue placeholder="Select a department" />
                      </WideSelectTrigger>
                      <SelectContent>
                        {DEPARTMENT_OPTIONS.map((department) => (
                          <SelectItem key={department} value={department}>
                            {department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError error={errors.department} />
              </Field>
              <Field>
                <Label htmlFor="user-manager">Reporting Manager</Label>
                <Controller
                  control={control}
                  name="reportingManagerId"
                  render={({ field }) => (
                    <Select
                      name={field.name}
                      onValueChange={(value) =>
                        field.onChange(value === NO_MANAGER ? "" : value)
                      }
                      value={field.value || NO_MANAGER}
                    >
                      <WideSelectTrigger id="user-manager" onBlur={field.onBlur} ref={field.ref}>
                        <SelectValue placeholder="Select a reporting manager" />
                      </WideSelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_MANAGER}>No reporting manager</SelectItem>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} — {ROLE_LABELS[employee.role] ?? employee.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError error={errors.reportingManagerId} />
              </Field>
              <Field>
                <Label htmlFor="user-mobile">Mobile Number</Label>
                <Input
                  aria-invalid={Boolean(errors.mobile)}
                  autoComplete="off"
                  id="user-mobile"
                  inputMode="tel"
                  placeholder="+91 98765 43210"
                  {...register("mobile")}
                />
                <FieldError error={errors.mobile} />
              </Field>
              <Field>
                <Label htmlFor="user-joining-date">Joining Date</Label>
                <Input
                  aria-invalid={Boolean(errors.joiningDate)}
                  id="user-joining-date"
                  type="date"
                  {...register("joiningDate")}
                />
                <FieldError error={errors.joiningDate} />
              </Field>
              <Field>
                <Label>Employee ID</Label>
                <ProjectHint>
                  Generated automatically when the user is created (for example
                  EMP-1041).
                </ProjectHint>
              </Field>
              <Field>
                <Label>Assign to project(s)</Label>
                <ProjectHint>
                  Optional — leave empty for a workspace-wide role like Super
                  Admin or HO Procurement.
                </ProjectHint>
                <Controller
                  control={control}
                  name="projectIds"
                  render={({ field }) => (
                    <ProjectGrid>
                      {projectOptions.map((project) => (
                        <ProjectOption key={project.id}>
                          <input
                            checked={field.value.includes(project.id)}
                            onChange={(event) => {
                              field.onChange(
                                event.target.checked
                                  ? [...field.value, project.id]
                                  : field.value.filter((id) => id !== project.id),
                              );
                            }}
                            type="checkbox"
                          />
                          {project.name}
                        </ProjectOption>
                      ))}
                    </ProjectGrid>
                  )}
                />
                <FieldError error={errors.projectIds} />
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
                  {isSubmitting ? "Adding user…" : "Add user"}
                </Button>
              </DialogFooter>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

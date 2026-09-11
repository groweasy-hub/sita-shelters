"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ArrowLeftRight, CircleCheck } from "lucide-react";
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
import { focusRing } from "@/components/ui/internal-styles";
import { PROJECT_OPTIONS } from "@/config/constants";
import { MATERIALS } from "@/lib/mock-data/materials";
import { newTransferRequestSchema } from "../schemas/stock-transfers.schema";

const Form = styled.form`
  display: grid;
  gap: 1rem;
`;
const FieldRow = styled.div`
  display: grid;
  gap: 1rem;
  @media (min-width: 480px) {
    grid-template-columns: 1fr 1fr;
  }
`;
const Field = styled.div`
  display: grid;
  gap: 0.375rem;
`;
const FieldError = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.75rem;
`;
const Textarea = styled.textarea`
  ${focusRing}
  width: 100%;
  min-height: 4.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.input};
  border-radius: ${({ theme }) => theme.radii.md};
  outline: none;
  resize: vertical;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  font: inherit;
  font-size: 0.875rem;
  &::placeholder {
    color: ${({ theme }) => theme.colors.mutedForeground};
  }
`;
const SuccessNotice = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.success}40;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.success}14;
  color: ${({ theme }) => theme.colors.success};
  font-size: 0.8125rem;
  font-weight: 600;
  svg {
    width: 1rem;
    height: 1rem;
    flex: 0 0 auto;
  }
`;

const defaultValues = {
  sourceProjectId: "",
  destinationProjectId: "",
  materialCode: "",
  quantity: "",
  remarks: "",
};

/**
 * Presentational "New Transfer Request" form. There is no backend, so
 * submission only validates the input shape with `newTransferRequestSchema`
 * and shows a confirmation — it does not mutate the transfers list.
 */
export function NewTransferDialog() {
  const [open, setOpen] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm({
    resolver: zodResolver(newTransferRequestSchema),
    defaultValues,
  });
  const sourceProjectId = useWatch({ control, name: "sourceProjectId" });

  function handleOpenChange(nextOpen) {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset(defaultValues);
      setSubmittedId(null);
    }
  }

  function onSubmit(values) {
    setSubmittedId(
      `TRF-${String(60_000 + Math.abs(hashCode(values.materialCode + values.sourceProjectId))).slice(0, 5)}`,
    );
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button size="sm">
          <ArrowLeftRight aria-hidden="true" />
          New Transfer Request
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New transfer request</DialogTitle>
          <DialogDescription>
            Move surplus material from one project to another instead of raising
            a fresh purchase. This is a presentational form — no record is
            created yet.
          </DialogDescription>
        </DialogHeader>
        {submittedId ? (
          <SuccessNotice role="status">
            <CircleCheck aria-hidden="true" />
            Draft request {submittedId} captured. Submit it through the workflow
            once backend integration is available.
          </SuccessNotice>
        ) : (
          <Form onSubmit={handleSubmit(onSubmit)}>
            <FieldRow>
              <Field>
                <Label htmlFor="sourceProjectId">Source project</Label>
                <Controller
                  control={control}
                  name="sourceProjectId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="sourceProjectId">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_OPTIONS.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.sourceProjectId ? (
                  <FieldError>{errors.sourceProjectId.message}</FieldError>
                ) : null}
              </Field>
              <Field>
                <Label htmlFor="destinationProjectId">
                  Destination project
                </Label>
                <Controller
                  control={control}
                  name="destinationProjectId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="destinationProjectId">
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_OPTIONS.filter(
                          (project) => project.id !== sourceProjectId,
                        ).map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.destinationProjectId ? (
                  <FieldError>{errors.destinationProjectId.message}</FieldError>
                ) : null}
              </Field>
            </FieldRow>
            <FieldRow>
              <Field>
                <Label htmlFor="materialCode">Material</Label>
                <Controller
                  control={control}
                  name="materialCode"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="materialCode">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {MATERIALS.map((material) => (
                          <SelectItem key={material.code} value={material.code}>
                            {material.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.materialCode ? (
                  <FieldError>{errors.materialCode.message}</FieldError>
                ) : null}
              </Field>
              <Field>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  inputMode="decimal"
                  placeholder="0"
                  type="number"
                  {...register("quantity")}
                />
                {errors.quantity ? (
                  <FieldError>{errors.quantity.message}</FieldError>
                ) : null}
              </Field>
            </FieldRow>
            <Field>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Why is this transfer needed?"
                {...register("remarks")}
              />
            </Field>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save as draft</Button>
            </DialogFooter>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Small deterministic hash so the presentational success id looks stable. */
function hashCode(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

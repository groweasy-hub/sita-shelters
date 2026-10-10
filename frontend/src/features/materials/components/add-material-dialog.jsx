"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import styled from "styled-components";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MATERIAL_CATEGORY_TREE } from "@/lib/mock-data/material-categories";
import { MATERIAL_STATUS_OPTIONS } from "../constants/materials.constants";
import { materialCreateInputSchema } from "../schemas/materials.schema";
import { useCreateMaterial } from "../hooks/use-materials";

const Form = styled.form`
  display: grid;
  gap: 1rem;
`;
const FieldGrid = styled.div`
  display: grid;
  gap: 0.875rem;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
`;
const Field = styled.div`
  display: grid;
  gap: 0.375rem;
  min-width: 0;
`;
const FullField = styled(Field)`
  grid-column: 1 / -1;
`;
const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.75rem;
`;

const DEFAULT_VALUES = {
  code: "",
  name: "",
  category: "",
  subcategory: "",
  unit: "",
  specification: "",
  reorderLevel: "0",
  lastPurchasePrice: "0",
  status: "active",
  approvedVendorIds: [],
};

function fieldErrorsFrom(error) {
  const errors = {};
  error.issues.forEach((issue) => {
    errors[issue.path[0]] = issue.message;
  });
  return errors;
}

export function AddMaterialDialog() {
  const createMaterial = useCreateMaterial();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const subcategories = useMemo(
    () =>
      MATERIAL_CATEGORY_TREE.find((category) => category.id === values.category)
        ?.subcategories ?? [],
    [values.category],
  );

  useEffect(() => {
    if (!open) {
      setValues(DEFAULT_VALUES);
      setFieldErrors({});
      setSubmitError("");
    }
  }, [open]);

  function setField(name, value) {
    setValues((current) => ({
      ...current,
      [name]: value,
      ...(name === "category" ? { subcategory: "" } : {}),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const parsed = materialCreateInputSchema.safeParse(values);
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFrom(parsed.error));
      return;
    }
    setFieldErrors({});
    setSubmitError("");
    createMaterial.mutate(parsed.data, {
      onSuccess: () => setOpen(false),
      onError: (error) =>
        setSubmitError(error?.message ?? "The material could not be created"),
    });
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Add Material
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add material</DialogTitle>
          <DialogDescription>
            Add a catalogue item that can be used in indents, procurement and live inventory.
          </DialogDescription>
        </DialogHeader>
        <Form noValidate onSubmit={handleSubmit}>
          <FieldGrid>
            <Field>
              <Label htmlFor="material-code">Material code</Label>
              <Input
                aria-invalid={Boolean(fieldErrors.code)}
                id="material-code"
                onChange={(event) => setField("code", event.target.value)}
                placeholder="e.g. CEM-JSW-02"
                value={values.code}
              />
              {fieldErrors.code ? <ErrorText>{fieldErrors.code}</ErrorText> : null}
            </Field>
            <Field>
              <Label htmlFor="material-name">Material name</Label>
              <Input
                aria-invalid={Boolean(fieldErrors.name)}
                id="material-name"
                onChange={(event) => setField("name", event.target.value)}
                placeholder="e.g. JSW Cement PPC"
                value={values.name}
              />
              {fieldErrors.name ? <ErrorText>{fieldErrors.name}</ErrorText> : null}
            </Field>
            <Field>
              <Label htmlFor="material-category">Category</Label>
              <Select
                onValueChange={(value) => setField("category", value)}
                value={values.category}
              >
                <SelectTrigger id="material-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_CATEGORY_TREE.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.category ? (
                <ErrorText>{fieldErrors.category}</ErrorText>
              ) : null}
            </Field>
            <Field>
              <Label htmlFor="material-subcategory">Subcategory</Label>
              <Select
                disabled={!values.category}
                onValueChange={(value) => setField("subcategory", value)}
                value={values.subcategory}
              >
                <SelectTrigger id="material-subcategory">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.subcategory ? (
                <ErrorText>{fieldErrors.subcategory}</ErrorText>
              ) : null}
            </Field>
            <Field>
              <Label htmlFor="material-unit">Unit</Label>
              <Input
                aria-invalid={Boolean(fieldErrors.unit)}
                id="material-unit"
                onChange={(event) => setField("unit", event.target.value)}
                placeholder="e.g. bags"
                value={values.unit}
              />
              {fieldErrors.unit ? <ErrorText>{fieldErrors.unit}</ErrorText> : null}
            </Field>
            <Field>
              <Label htmlFor="material-status">Status</Label>
              <Select
                onValueChange={(value) => setField("status", value)}
                value={values.status}
              >
                <SelectTrigger id="material-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="material-reorder-level">Reorder level</Label>
              <Input
                id="material-reorder-level"
                min="0"
                onChange={(event) => setField("reorderLevel", event.target.value)}
                step="any"
                type="number"
                value={values.reorderLevel}
              />
              {fieldErrors.reorderLevel ? (
                <ErrorText>{fieldErrors.reorderLevel}</ErrorText>
              ) : null}
            </Field>
            <Field>
              <Label htmlFor="material-last-price">Last purchase price</Label>
              <Input
                id="material-last-price"
                min="0"
                onChange={(event) => setField("lastPurchasePrice", event.target.value)}
                step="any"
                type="number"
                value={values.lastPurchasePrice}
              />
              {fieldErrors.lastPurchasePrice ? (
                <ErrorText>{fieldErrors.lastPurchasePrice}</ErrorText>
              ) : null}
            </Field>
            <FullField>
              <Label htmlFor="material-specification">Specification</Label>
              <Textarea
                id="material-specification"
                onChange={(event) => setField("specification", event.target.value)}
                placeholder="Optional material specification"
                rows={3}
                value={values.specification}
              />
              {fieldErrors.specification ? (
                <ErrorText>{fieldErrors.specification}</ErrorText>
              ) : null}
            </FullField>
          </FieldGrid>
          {submitError ? <ErrorText>{submitError}</ErrorText> : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={createMaterial.isPending} type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={createMaterial.isPending} type="submit">
              Add Material
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

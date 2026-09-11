"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { PlusCircle, Trash2 } from "lucide-react";
import styled from "styled-components";

import { PageHeader } from "@/components/shared";
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
import { PROJECT_OPTIONS } from "@/config/constants";
import { getMaterialByCode, MATERIALS } from "@/lib/mock-data/materials";
import { INDENT_PRIORITY_OPTIONS } from "../constants/indents.constants";
import { useCreateIndent } from "../hooks/use-indents";
import {
  createIndentInputDefaults,
  createIndentInputSchema,
} from "../schemas/indents.schema";
import { StockRecommendation } from "./stock-recommendation";

const Root = styled.div`
  display: grid;
  max-width: 60rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const Form = styled.form`
  display: grid;
  gap: 1.5rem;
`;
const Panel = styled.section`
  display: grid;
  gap: 1.25rem;
  padding: 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const PanelTitle = styled.h2`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 650;
`;
const FieldGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
`;
const Field = styled.div`
  display: grid;
  gap: 0.375rem;
  min-width: 0;
`;
const FullWidthField = styled(Field)`
  grid-column: 1 / -1;
`;
const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.75rem;
`;
const LinesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const LineCard = styled.div`
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceMuted}55;
`;
const LineGrid = styled.div`
  display: grid;
  gap: 0.75rem;
  align-items: end;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 0.75fr) auto;
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;
const UnitDisplay = styled.div`
  display: flex;
  height: 2.25rem;
  align-items: center;
  padding: 0 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.muted};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.875rem;
`;
const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;
export function IndentCreateScreen() {
  const router = useRouter();
  const createIndent = useCreateIndent();
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm({
    defaultValues: createIndentInputDefaults,
    resolver: zodResolver(createIndentInputSchema),
  });
  const { append, fields, remove } = useFieldArray({ control, name: "lines" });
  const watchedProjectId = useWatch({ control, name: "projectId" });
  const watchedLines = useWatch({ control, name: "lines" });

  function onSubmit(values) {
    createIndent.mutate(values, {
      onSuccess: () => router.push("/indents"),
    });
  }

  return (
    <Root>
      <PageHeader
        description="Raise a material demand request for site consumption. Stock recommendations are calculated live as material lines are added."
        eyebrow="Demand planning"
        title="Raise Indent"
      />
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Panel>
          <PanelTitle>Request details</PanelTitle>
          <FieldGrid>
            <Field>
              <Label htmlFor="indent-project">Project</Label>
              <Controller
                control={control}
                name="projectId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger aria-label="Project" id="indent-project">
                      <SelectValue placeholder="Select a project" />
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
              {errors.projectId ? (
                <ErrorText>{errors.projectId.message}</ErrorText>
              ) : null}
            </Field>
            <Field>
              <Label htmlFor="indent-required-date">Required date</Label>
              <Input
                aria-invalid={Boolean(errors.requiredDate)}
                id="indent-required-date"
                type="date"
                {...register("requiredDate")}
              />
              {errors.requiredDate ? (
                <ErrorText>{errors.requiredDate.message}</ErrorText>
              ) : null}
            </Field>
            <Field>
              <Label htmlFor="indent-priority">Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger aria-label="Priority" id="indent-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDENT_PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field>
              <Label htmlFor="indent-work-location">Work location</Label>
              <Input
                aria-invalid={Boolean(errors.workLocation)}
                id="indent-work-location"
                placeholder="e.g. Tower C - 8th floor slab"
                {...register("workLocation")}
              />
              {errors.workLocation ? (
                <ErrorText>{errors.workLocation.message}</ErrorText>
              ) : null}
            </Field>
            <FullWidthField>
              <Label htmlFor="indent-purpose">Purpose</Label>
              <Input
                aria-invalid={Boolean(errors.purpose)}
                id="indent-purpose"
                placeholder="Describe why this material is required"
                {...register("purpose")}
              />
              {errors.purpose ? (
                <ErrorText>{errors.purpose.message}</ErrorText>
              ) : null}
            </FullWidthField>
          </FieldGrid>
        </Panel>
        <Panel>
          <LinesHeader>
            <PanelTitle>Material lines</PanelTitle>
            <Button
              onClick={() =>
                append({ materialCode: "", requestedQuantity: "" })
              }
              size="sm"
              type="button"
              variant="outline"
            >
              <PlusCircle aria-hidden="true" />
              Add material
            </Button>
          </LinesHeader>
          {errors.lines?.message ? (
            <ErrorText>{errors.lines.message}</ErrorText>
          ) : null}
          {fields.map((field, index) => {
            const lineValue = watchedLines?.[index];
            const material = lineValue?.materialCode
              ? getMaterialByCode(lineValue.materialCode)
              : null;
            const requestedQuantity = Number(lineValue?.requestedQuantity);
            return (
              <LineCard key={field.id}>
                <LineGrid>
                  <Field>
                    <Label htmlFor={`indent-line-material-${index}`}>
                      Material
                    </Label>
                    <Controller
                      control={control}
                      name={`lines.${index}.materialCode`}
                      render={({ field: materialField }) => (
                        <Select
                          onValueChange={materialField.onChange}
                          value={materialField.value}
                        >
                          <SelectTrigger
                            aria-label="Material"
                            id={`indent-line-material-${index}`}
                          >
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {MATERIALS.map((option) => (
                              <SelectItem key={option.code} value={option.code}>
                                {option.name} ({option.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.lines?.[index]?.materialCode ? (
                      <ErrorText>
                        {errors.lines[index].materialCode.message}
                      </ErrorText>
                    ) : null}
                  </Field>
                  <Field>
                    <Label htmlFor={`indent-line-quantity-${index}`}>
                      Quantity
                    </Label>
                    <Input
                      aria-invalid={Boolean(
                        errors.lines?.[index]?.requestedQuantity,
                      )}
                      id={`indent-line-quantity-${index}`}
                      min="0"
                      step="any"
                      type="number"
                      {...register(`lines.${index}.requestedQuantity`)}
                    />
                    {errors.lines?.[index]?.requestedQuantity ? (
                      <ErrorText>
                        {errors.lines[index].requestedQuantity.message}
                      </ErrorText>
                    ) : null}
                  </Field>
                  <Field>
                    <Label>Unit</Label>
                    <UnitDisplay>{material?.unit ?? "—"}</UnitDisplay>
                  </Field>
                  <Button
                    aria-label="Remove material line"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </LineGrid>
                {watchedProjectId && material && requestedQuantity > 0 ? (
                  <StockRecommendation
                    materialCode={material.code}
                    projectId={watchedProjectId}
                    requestedQuantity={requestedQuantity}
                    unit={material.unit}
                  />
                ) : null}
              </LineCard>
            );
          })}
        </Panel>
        <Actions>
          <Button
            onClick={() => router.push("/indents")}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button type="submit">Submit Indent</Button>
        </Actions>
      </Form>
    </Root>
  );
}

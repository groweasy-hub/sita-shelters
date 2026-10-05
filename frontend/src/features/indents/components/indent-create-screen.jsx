"use client";

import { useEffect, useMemo } from "react";
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
import { useAllMaterials } from "@/features/materials";
import { useProjectScope } from "@/features/profile";
import { useProjectDirectory } from "@/hooks";
import {
  INDENT_PRIORITY_OPTIONS,
  NEW_ITEM_CATEGORY_OPTIONS,
  NEW_ITEM_OPTION_VALUE,
  NEW_ITEM_UNIT_OPTIONS,
} from "../constants/indents.constants";
import { useCreateIndent } from "../hooks/use-indents";
import {
  createIndentFormDefaults,
  createIndentFormSchema,
  emptyIndentFormLine,
  toCreateIndentInput,
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
  flex-wrap: wrap;
  gap: 0.375rem 0.75rem;
  align-items: center;
  justify-content: space-between;
`;
const LinesTable = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
`;
const LineRow = styled.div`
  display: grid;
  gap: 0.75rem;
  align-items: center;
  padding: 0.625rem 0.875rem;
  grid-template-columns: 2rem minmax(0, 2fr) minmax(0, 1fr) minmax(0, 0.75fr) auto;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child {
    border-bottom: 0;
  }
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;
const LineRowHead = styled(LineRow)`
  background: ${({ theme }) => theme.colors.surfaceMuted};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.7rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  @media (max-width: 720px) {
    display: none;
  }
`;
const LineIndex = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-variant-numeric: tabular-nums;
  font-weight: 600;
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
const NewItemFields = styled.div`
  display: grid;
  gap: 0.375rem;
`;
const LinkButton = styled.button`
  justify-self: start;
  padding: 0;
  border: 0;
  background: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
const Hint = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
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
    setValue,
  } = useForm({
    defaultValues: createIndentFormDefaults,
    resolver: zodResolver(createIndentFormSchema),
  });
  const { append, fields, remove } = useFieldArray({ control, name: "lines" });
  const watchedProjectId = useWatch({ control, name: "projectId" });
  const watchedLines = useWatch({ control, name: "lines" });
  const { data: projectDirectory = [] } = useProjectDirectory();
  const { scopeProjectIds } = useProjectScope();
  const { data: allMaterials = [] } = useAllMaterials();

  // Project-scoped roles (site engineer, store manager, …) only see the
  // projects they're assigned to; workspace-wide roles see them all.
  const projectOptions = useMemo(
    () =>
      scopeProjectIds
        ? projectDirectory.filter((project) => scopeProjectIds.includes(project.id))
        : projectDirectory,
    [projectDirectory, scopeProjectIds],
  );
  const materialOptions = useMemo(
    () => allMaterials.filter((material) => material.status !== "inactive"),
    [allMaterials],
  );
  const materialsByCode = useMemo(
    () => new Map(allMaterials.map((material) => [material.code, material])),
    [allMaterials],
  );
  const materialNames = useMemo(
    () => new Set(allMaterials.map((material) => material.name.toLocaleLowerCase())),
    [allMaterials],
  );

  // Someone with a single project shouldn't have to pick it.
  useEffect(() => {
    if (projectOptions.length === 1 && !watchedProjectId) {
      setValue("projectId", projectOptions[0].id, { shouldValidate: true });
    }
  }, [projectOptions, watchedProjectId, setValue]);

  function onSubmit(values) {
    createIndent.mutate(toCreateIndentInput(values), {
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
                      {projectOptions.map((project) => (
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
              ) : projectOptions.length === 0 ? (
                <Hint>
                  You aren&apos;t assigned to any project yet. Ask an
                  administrator to assign you.
                </Hint>
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
              onClick={() => append(emptyIndentFormLine)}
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
          <LinesTable>
            <LineRowHead>
              <span>#</span>
              <span>Item Description</span>
              <span>Unit</span>
              <span>Quantity</span>
              <span />
            </LineRowHead>
            {fields.map((field, index) => {
              const lineValue = watchedLines?.[index];
              const isNew = Boolean(lineValue?.isNew);
              const material =
                !isNew && lineValue?.materialCode
                  ? materialsByCode.get(lineValue.materialCode)
                  : null;
              const lineErrors = errors.lines?.[index];
              const requestedQuantity = Number(lineValue?.requestedQuantity);
              const typedName = lineValue?.newName?.trim().toLocaleLowerCase();
              return (
                <div key={field.id}>
                  <LineRow>
                    <LineIndex>{index + 1}</LineIndex>
                    {isNew ? (
                      <NewItemFields>
                        <Input
                          aria-invalid={Boolean(lineErrors?.newName)}
                          aria-label={`New item name, line ${index + 1}`}
                          placeholder="New item name, e.g. Wall putty 20 kg"
                          {...register(`lines.${index}.newName`)}
                        />
                        {lineErrors?.newName ? (
                          <ErrorText>{lineErrors.newName.message}</ErrorText>
                        ) : typedName && materialNames.has(typedName) ? (
                          <Hint>
                            This item is already in the list — the existing one
                            will be used.
                          </Hint>
                        ) : null}
                        <Controller
                          control={control}
                          name={`lines.${index}.newCategory`}
                          render={({ field: categoryField }) => (
                            <Select
                              onValueChange={categoryField.onChange}
                              value={categoryField.value}
                            >
                              <SelectTrigger
                                aria-label={`Category, line ${index + 1}`}
                              >
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {NEW_ITEM_CATEGORY_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {lineErrors?.newCategory ? (
                          <ErrorText>{lineErrors.newCategory.message}</ErrorText>
                        ) : null}
                        <LinkButton
                          onClick={() => {
                            setValue(`lines.${index}.isNew`, false);
                            setValue(`lines.${index}.newName`, "");
                            setValue(`lines.${index}.newUnit`, "");
                            setValue(`lines.${index}.newCategory`, "");
                          }}
                          type="button"
                        >
                          Choose from the list instead
                        </LinkButton>
                      </NewItemFields>
                    ) : (
                      <div>
                        <Controller
                          control={control}
                          name={`lines.${index}.materialCode`}
                          render={({ field: materialField }) => (
                            <Select
                              onValueChange={(value) => {
                                if (value === NEW_ITEM_OPTION_VALUE) {
                                  setValue(`lines.${index}.isNew`, true);
                                  setValue(`lines.${index}.materialCode`, "");
                                  return;
                                }
                                materialField.onChange(value);
                              }}
                              value={materialField.value}
                            >
                              <SelectTrigger
                                aria-label={`Item description, line ${index + 1}`}
                                id={`indent-line-material-${index}`}
                              >
                                <SelectValue placeholder="Select material" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={NEW_ITEM_OPTION_VALUE}>
                                  + Add a new item…
                                </SelectItem>
                                {materialOptions.map((option) => (
                                  <SelectItem key={option.code} value={option.code}>
                                    {option.name} ({option.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {lineErrors?.materialCode ? (
                          <ErrorText>{lineErrors.materialCode.message}</ErrorText>
                        ) : null}
                      </div>
                    )}
                    {isNew ? (
                      <div>
                        <Controller
                          control={control}
                          name={`lines.${index}.newUnit`}
                          render={({ field: unitField }) => (
                            <Select
                              onValueChange={unitField.onChange}
                              value={unitField.value}
                            >
                              <SelectTrigger aria-label={`Unit, line ${index + 1}`}>
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {NEW_ITEM_UNIT_OPTIONS.map((unit) => (
                                  <SelectItem key={unit} value={unit}>
                                    {unit}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {lineErrors?.newUnit ? (
                          <ErrorText>{lineErrors.newUnit.message}</ErrorText>
                        ) : null}
                      </div>
                    ) : (
                      <UnitDisplay>{material?.unit ?? "—"}</UnitDisplay>
                    )}
                    <div>
                      <Input
                        aria-invalid={Boolean(lineErrors?.requestedQuantity)}
                        aria-label={`Quantity, line ${index + 1}`}
                        id={`indent-line-quantity-${index}`}
                        min="0"
                        step="any"
                        type="number"
                        {...register(`lines.${index}.requestedQuantity`)}
                      />
                      {lineErrors?.requestedQuantity ? (
                        <ErrorText>{lineErrors.requestedQuantity.message}</ErrorText>
                      ) : null}
                    </div>
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
                  </LineRow>
                  {watchedProjectId && material && requestedQuantity > 0 ? (
                    <StockRecommendation
                      materialCode={material.code}
                      projectId={watchedProjectId}
                      requestedQuantity={requestedQuantity}
                      unit={material.unit}
                    />
                  ) : null}
                </div>
              );
            })}
          </LinesTable>
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

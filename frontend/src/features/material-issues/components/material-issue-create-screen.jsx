"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import styled from "styled-components";

import { AccessDeniedState, PageHeader } from "@/components/shared";
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
import { EmptyState } from "@/components/feedback/empty-state";
import { hasPermission, ROLE_LABELS } from "@/config/permissions";
import { useCurrentUser } from "@/features/profile";
import { useAllInventoryItems } from "@/features/inventory";
import { useProjectDirectory } from "@/hooks";
import { materialIssueCreateInputSchema } from "../schemas/material-issues.schema";
import { useCreateMaterialIssue } from "../hooks/use-material-issues";

const Root = styled.div`
  display: grid;
  max-width: 42rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const BackLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border: none;
  background: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
  }
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
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
const Field = styled.div`
  display: grid;
  gap: 0.375rem;
  min-width: 0;
`;
const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.75rem;
`;
const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

export function MaterialIssueCreateScreen() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const { data: allInventoryItems = [] } = useAllInventoryItems();
  const { data: projectOptions = [] } = useProjectDirectory();
  const createMaterialIssue = useCreateMaterialIssue();

  const [projectId, setProjectId] = useState("");
  const [materialCode, setMaterialCode] = useState("");
  const [issuedQuantity, setIssuedQuantity] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const availableItems = useMemo(
    () =>
      allInventoryItems
        // Stock posted but not yet formally confirmed by the Store Manager
        // is still issuable — creating the issue is itself the
        // acknowledgement that it's on hand (see createMaterialIssue).
        .map((item) => ({
          ...item,
          issuableQuantity: item.availableQuantity + (item.pendingReceiptQuantity ?? 0),
        }))
        .filter(
          (item) => item.projectId === projectId && item.issuableQuantity > 1e-6,
        ),
    [allInventoryItems, projectId],
  );
  const selectedItem = availableItems.find(
    (item) => item.materialCode === materialCode,
  );

  const canIssueMaterial = Boolean(
    currentUser && hasPermission(currentUser.role, "material-issues:manage"),
  );
  if (!canIssueMaterial) {
    return (
      <AccessDeniedState
        pageName="Issue Material"
        roleLabel={currentUser?.role ? ROLE_LABELS[currentUser.role] : undefined}
      />
    );
  }

  function handleSelectProject(nextProjectId) {
    setProjectId(nextProjectId);
    setMaterialCode("");
    setIssuedQuantity("");
  }
  function handleSelectMaterial(nextMaterialCode) {
    setMaterialCode(nextMaterialCode);
    setIssuedQuantity("");
  }

  function onSubmit(event) {
    event.preventDefault();
    const result = materialIssueCreateInputSchema.safeParse({
      projectId,
      materialCode,
      issuedQuantity,
      recipientName,
      purpose,
      workLocation,
    });
    if (!result.success) {
      const issues = {};
      result.error.issues.forEach((zodIssue) => {
        issues[zodIssue.path[0]] = zodIssue.message;
      });
      setFieldErrors(issues);
      return;
    }
    setFieldErrors({});
    setSubmitError("");
    createMaterialIssue.mutate(result.data, {
      onSuccess: () => router.push("/material-issues"),
      onError: (error) =>
        setSubmitError(error?.message ?? "The material issue could not be created"),
    });
  }

  return (
    <Root>
      <div>
        <BackLink onClick={() => router.back()} type="button">
          <ArrowLeft aria-hidden="true" />
          Back
        </BackLink>
      </div>
      <PageHeader
        description="Issue material from site stock to a work team. The issued quantity is deducted from available stock immediately."
        eyebrow="Site operations"
        title="Issue Material"
      />
      <Form noValidate onSubmit={onSubmit}>
        <Panel>
          <PanelTitle>Issue details</PanelTitle>
          <Field>
            <Label htmlFor="issue-project">Project</Label>
            <Select onValueChange={handleSelectProject} value={projectId}>
              <SelectTrigger id="issue-project">
                <SelectValue placeholder="Choose a project" />
              </SelectTrigger>
              <SelectContent>
                {projectOptions.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.projectId ? (
              <ErrorText>{fieldErrors.projectId}</ErrorText>
            ) : null}
          </Field>
          {projectId ? (
            availableItems.length === 0 ? (
              <EmptyState
                description="No material at this project currently has available stock to issue."
                title="Nothing available to issue"
              />
            ) : (
              <>
                <Field>
                  <Label htmlFor="issue-material">Material</Label>
                  <Select onValueChange={handleSelectMaterial} value={materialCode}>
                    <SelectTrigger id="issue-material">
                      <SelectValue placeholder="Choose a material" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.map((item) => (
                        <SelectItem key={item.materialCode} value={item.materialCode}>
                          {item.materialName} ({item.materialCode}) — {item.issuableQuantity}{" "}
                          {item.unit} available
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.materialCode ? (
                    <ErrorText>{fieldErrors.materialCode}</ErrorText>
                  ) : null}
                </Field>
                {selectedItem ? (
                  <Field>
                    <Label htmlFor="issue-quantity">
                      Issued quantity ({selectedItem.unit}) — up to{" "}
                      {selectedItem.issuableQuantity}
                    </Label>
                    <Input
                      id="issue-quantity"
                      max={selectedItem.issuableQuantity}
                      min="0"
                      onChange={(event) => setIssuedQuantity(event.target.value)}
                      step="any"
                      type="number"
                      value={issuedQuantity}
                    />
                    {fieldErrors.issuedQuantity ? (
                      <ErrorText>{fieldErrors.issuedQuantity}</ErrorText>
                    ) : null}
                  </Field>
                ) : null}
              </>
            )
          ) : null}
          <Field>
            <Label htmlFor="issue-recipient">Recipient / work team</Label>
            <Input
              id="issue-recipient"
              onChange={(event) => setRecipientName(event.target.value)}
              placeholder="e.g. RCC Crew - Team A"
              value={recipientName}
            />
            {fieldErrors.recipientName ? (
              <ErrorText>{fieldErrors.recipientName}</ErrorText>
            ) : null}
          </Field>
          <Field>
            <Label htmlFor="issue-purpose">Purpose</Label>
            <Input
              id="issue-purpose"
              onChange={(event) => setPurpose(event.target.value)}
              placeholder="Describe why this material is being issued"
              value={purpose}
            />
            {fieldErrors.purpose ? (
              <ErrorText>{fieldErrors.purpose}</ErrorText>
            ) : null}
          </Field>
          <Field>
            <Label htmlFor="issue-work-location">Work location</Label>
            <Input
              id="issue-work-location"
              onChange={(event) => setWorkLocation(event.target.value)}
              placeholder="e.g. Tower A - Ground Floor"
              value={workLocation}
            />
            {fieldErrors.workLocation ? (
              <ErrorText>{fieldErrors.workLocation}</ErrorText>
            ) : null}
          </Field>
          {submitError ? <ErrorText>{submitError}</ErrorText> : null}
        </Panel>
        <Actions>
          <Button onClick={() => router.back()} type="button" variant="outline">
            Cancel
          </Button>
          <Button
            disabled={!selectedItem || createMaterialIssue.isPending}
            type="submit"
          >
            Issue Material
          </Button>
        </Actions>
      </Form>
    </Root>
  );
}

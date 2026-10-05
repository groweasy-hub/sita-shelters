"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useAllMaterialIssues } from "@/features/material-issues";
import { RETURN_REASON_OPTIONS } from "../constants/returns.constants";
import { returnCreateInputSchema } from "../schemas/returns.schema";
import { useCreateReturn } from "../hooks/use-returns";

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

function outstandingQuantity(issue) {
  return issue.issuedQuantity - issue.consumedQuantity - issue.returnedQuantity;
}

export function ReturnCreateScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useCurrentUser();
  const { data: allIssues = [] } = useAllMaterialIssues();
  const createReturn = useCreateReturn();
  const eligibleIssues = useMemo(
    () => allIssues.filter((issue) => outstandingQuantity(issue) > 1e-6),
    [allIssues],
  );
  const [materialIssueId, setMaterialIssueId] = useState(
    searchParams.get("materialIssueId") ?? "",
  );
  const [returningQuantity, setReturningQuantity] = useState("");
  const [reason, setReason] = useState("unused-material");
  const [fieldErrors, setFieldErrors] = useState({});

  const canLogReturn = Boolean(
    currentUser && hasPermission(currentUser.role, "returns:manage"),
  );
  if (!canLogReturn) {
    return (
      <AccessDeniedState
        pageName="Log a Return"
        roleLabel={currentUser?.role ? ROLE_LABELS[currentUser.role] : undefined}
      />
    );
  }

  const issue = eligibleIssues.find((entry) => entry.id === materialIssueId);
  const maxQuantity = issue ? outstandingQuantity(issue) : 0;

  function handleSelectIssue(nextIssueId) {
    setMaterialIssueId(nextIssueId);
    const nextIssue = eligibleIssues.find((entry) => entry.id === nextIssueId);
    setReturningQuantity(
      nextIssue ? String(outstandingQuantity(nextIssue)) : "",
    );
  }

  function onSubmit(event) {
    event.preventDefault();
    const result = returnCreateInputSchema.safeParse({
      materialIssueId,
      returningQuantity,
      reason,
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
    createReturn.mutate(
      { ...result.data, returnedById: currentUser.id },
      { onSuccess: (record) => router.push(`/returns/${record.id}`) },
    );
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
        description="Log material coming back to store from an issued material slip. It starts Pending Inspection until the good/damaged split is recorded."
        eyebrow="Site operations"
        title="Log a Return"
      />
      {eligibleIssues.length === 0 ? (
        <EmptyState
          description="No material issue currently has an outstanding quantity available to return."
          title="Nothing to return"
        />
      ) : (
        <Form noValidate onSubmit={onSubmit}>
          <Panel>
            <PanelTitle>Return details</PanelTitle>
            <Field>
              <Label htmlFor="return-issue-select">Material issue</Label>
              <Select onValueChange={handleSelectIssue} value={materialIssueId}>
                <SelectTrigger id="return-issue-select">
                  <SelectValue placeholder="Choose a material issue" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleIssues.map((entry) => (
                    <SelectItem key={entry.id} value={entry.id}>
                      {entry.id} · {entry.materialName} · {entry.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.materialIssueId ? (
                <ErrorText>{fieldErrors.materialIssueId}</ErrorText>
              ) : null}
            </Field>
            {issue ? (
              <Field>
                <Label htmlFor="return-quantity">
                  Returning quantity ({issue.unit}) — up to {maxQuantity}
                </Label>
                <Input
                  id="return-quantity"
                  max={maxQuantity}
                  min="0"
                  onChange={(event) => setReturningQuantity(event.target.value)}
                  step="any"
                  type="number"
                  value={returningQuantity}
                />
                {fieldErrors.returningQuantity ? (
                  <ErrorText>{fieldErrors.returningQuantity}</ErrorText>
                ) : null}
              </Field>
            ) : null}
            <Field>
              <Label htmlFor="return-reason">Reason</Label>
              <Select onValueChange={setReason} value={reason}>
                <SelectTrigger id="return-reason">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RETURN_REASON_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </Panel>
          <Actions>
            <Button
              onClick={() => router.back()}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={!issue || createReturn.isPending} type="submit">
              Log Return
            </Button>
          </Actions>
        </Form>
      )}
    </Root>
  );
}

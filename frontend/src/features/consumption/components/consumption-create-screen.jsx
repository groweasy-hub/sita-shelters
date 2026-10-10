"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ClipboardList } from "lucide-react";
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
import { inProjectScope, useCurrentUser, useProjectScope } from "@/features/profile";
import { formatQuantity } from "@/lib/formatters";
import { useAllMaterialIssues } from "@/features/material-issues";
import { consumptionCreateInputSchema } from "../schemas/consumption.schema";
import { useCreateConsumption } from "../hooks/use-consumption";

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
const IssueSummary = styled.div`
  display: grid;
  gap: 0.375rem;
  padding: 0.875rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.muted};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  line-height: 1.4rem;
`;
const ReturnLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-weight: 600;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
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

export function ConsumptionCreateScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useCurrentUser();
  const { data: allIssues = [] } = useAllMaterialIssues();
  const createConsumption = useCreateConsumption();
  const { scopeProjectIds } = useProjectScope();
  const eligibleIssues = useMemo(
    () =>
      allIssues.filter(
        (issue) =>
          outstandingQuantity(issue) > 1e-6 &&
          inProjectScope(scopeProjectIds, issue.projectId),
      ),
    [allIssues, scopeProjectIds],
  );
  const [materialIssueId, setMaterialIssueId] = useState(
    searchParams.get("materialIssueId") ?? "",
  );
  const [quantityConsumed, setQuantityConsumed] = useState("");
  const [activity, setActivity] = useState("");
  const [location, setLocation] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const canLogConsumption = Boolean(
    currentUser && hasPermission(currentUser.role, "consumption:manage"),
  );
  if (!canLogConsumption) {
    return (
      <AccessDeniedState
        pageName="Log Consumption"
        roleLabel={currentUser?.role ? ROLE_LABELS[currentUser.role] : undefined}
      />
    );
  }

  const issue = eligibleIssues.find((entry) => entry.id === materialIssueId);
  const maxQuantity = issue ? outstandingQuantity(issue) : 0;

  function handleSelectIssue(nextIssueId) {
    setMaterialIssueId(nextIssueId);
    setQuantityConsumed("");
  }

  function onSubmit(event) {
    event.preventDefault();
    const result = consumptionCreateInputSchema.safeParse({
      materialIssueId,
      quantityConsumed,
      activity,
      location,
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
    createConsumption.mutate(result.data, {
      onSuccess: () => router.push("/consumption"),
      onError: (error) =>
        setSubmitError(error?.message ?? "The consumption entry could not be recorded"),
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
        description="Record how much of an issued material a work team actually used."
        eyebrow="Site operations"
        title="Log Consumption"
      />
      {eligibleIssues.length === 0 ? (
        <EmptyState
          action={
            <Button asChild>
              <Link href="/indents/create">
                <ClipboardList aria-hidden="true" strokeWidth={1.75} />
                Raise Indent
              </Link>
            </Button>
          }
          description="No material issue currently has an outstanding quantity available to consume. Raise an indent to request stock for the site."
          title="Stock not available"
        />
      ) : (
        <Form noValidate onSubmit={onSubmit}>
          <Panel>
            <PanelTitle>Consumption details</PanelTitle>
            <Field>
              <Label htmlFor="consumption-issue-select">Material issue</Label>
              <Select onValueChange={handleSelectIssue} value={materialIssueId}>
                <SelectTrigger id="consumption-issue-select">
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
              <IssueSummary>
                <span>
                  Issued {formatQuantity(issue.issuedQuantity, issue.unit)} ·
                  consumed {formatQuantity(issue.consumedQuantity, issue.unit)} ·
                  returned {formatQuantity(issue.returnedQuantity, issue.unit)} ·
                  outstanding {formatQuantity(maxQuantity, issue.unit)}
                </span>
                {issue.returns.length > 0 ? (
                  <span>
                    Returns against this issue:{" "}
                    {issue.returns.map((record, index) => (
                      <span key={record.id}>
                        {index > 0 ? ", " : null}
                        <ReturnLink href={`/returns/${encodeURIComponent(record.id)}`}>
                          {record.id}
                        </ReturnLink>{" "}
                        ({formatQuantity(record.returnedQuantity, issue.unit)}
                        {record.replacedQuantity > 0
                          ? `, ${formatQuantity(record.replacedQuantity, issue.unit)} replaced`
                          : ""}
                        )
                      </span>
                    ))}
                  </span>
                ) : null}
              </IssueSummary>
            ) : null}
            {issue ? (
              <Field>
                <Label htmlFor="consumption-quantity">
                  Quantity consumed ({issue.unit}) — up to {maxQuantity}
                </Label>
                <Input
                  id="consumption-quantity"
                  max={maxQuantity}
                  min="0"
                  onChange={(event) => setQuantityConsumed(event.target.value)}
                  step="any"
                  type="number"
                  value={quantityConsumed}
                />
                {fieldErrors.quantityConsumed ? (
                  <ErrorText>{fieldErrors.quantityConsumed}</ErrorText>
                ) : null}
              </Field>
            ) : null}
            <Field>
              <Label htmlFor="consumption-activity">Activity</Label>
              <Input
                id="consumption-activity"
                onChange={(event) => setActivity(event.target.value)}
                placeholder="e.g. Slab casting - Tower A 2nd floor Bay 1"
                value={activity}
              />
              {fieldErrors.activity ? (
                <ErrorText>{fieldErrors.activity}</ErrorText>
              ) : null}
            </Field>
            <Field>
              <Label htmlFor="consumption-location">Location</Label>
              <Input
                id="consumption-location"
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Tower A - 2nd Floor"
                value={location}
              />
              {fieldErrors.location ? (
                <ErrorText>{fieldErrors.location}</ErrorText>
              ) : null}
            </Field>
            {submitError ? <ErrorText>{submitError}</ErrorText> : null}
          </Panel>
          <Actions>
            <Button
              onClick={() => router.back()}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={!issue || createConsumption.isPending} type="submit">
              Log Consumption
            </Button>
          </Actions>
        </Form>
      )}
    </Root>
  );
}

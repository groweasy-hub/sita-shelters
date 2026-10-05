"use client";

import { useMemo } from "react";
import styled from "styled-components";

import { Badge } from "@/components/ui/badge";
import {
  ConfirmConsumptionAction,
  outstandingOf,
  usePendingConsumption,
} from "@/features/material-issues";
import { formatDateTime, formatQuantity } from "@/lib/formatters";

const VISIBLE = 6;

const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.875rem;
  font-weight: 650;
`;
const Intro = styled.p`
  margin: 0;
  padding: 0.75rem 1.25rem 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  line-height: 1.4;
`;
const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  padding: 0.875rem 1.25rem;
  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }
`;
const Info = styled.div`
  display: grid;
  min-width: 0;
  flex: 1 1 14rem;
  gap: 0.125rem;
`;
const Title = styled.span`
  font-size: 0.875rem;
  font-weight: 650;
`;
const Meta = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  line-height: 1.35;
`;
const Foot = styled.div`
  padding: 0.75rem 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;

/**
 * Material the store has issued that nobody has marked consumed yet. The
 * request goes to the site's Site Engineer and Project Manager; either one's
 * "Consumed" click settles it for both, and it drops off this list.
 */
export function AwaitingConsumptionPanel({
  projectId,
  title = "Awaiting consumption confirmation",
}) {
  // The server already limits this to the caller's sites.
  const { data: issues = [] } = usePendingConsumption();
  const pending = useMemo(
    () =>
      issues
        .filter((issue) => !projectId || issue.projectId === projectId)
        .sort((first, second) => first.issuedAt.localeCompare(second.issuedAt)),
    [issues, projectId],
  );
  if (pending.length === 0) return null;
  return (
    <Panel aria-label={title}>
      <Header>
        {title}
        <Badge variant="warning">{pending.length}</Badge>
      </Header>
      <Intro>
        Sent to the Site Engineer and Project Manager. Either one marking it consumed updates
        it for everyone, and it then shows as consumed on the Consumption page.
      </Intro>
      {pending.slice(0, VISIBLE).map((issue) => (
        <Row key={issue.id}>
          <Info>
            <Title>
              {issue.materialName} · {formatQuantity(outstandingOf(issue), issue.unit)} to confirm
            </Title>
            <Meta>
              {issue.id} · {issue.projectName} · issued to {issue.recipientName} on{" "}
              {formatDateTime(issue.issuedAt)}
            </Meta>
            <Meta>
              {issue.purpose} · {issue.workLocation}
            </Meta>
          </Info>
          <ConfirmConsumptionAction issue={issue} />
        </Row>
      ))}
      {pending.length > VISIBLE ? (
        <Foot>
          Showing the {VISIBLE} oldest of {pending.length}. Open the Consumption page for the
          full list.
        </Foot>
      ) : null}
    </Panel>
  );
}

"use client";

import { Info } from "lucide-react";
import styled from "styled-components";

import { StatusBadge } from "@/components/shared/status-badge";
import { ROLE_LABELS } from "@/config/permissions";
import { formatDate } from "@/lib/formatters";

const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.card};
`;
const Header = styled.header`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const Title = styled.h3`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 650;
`;
const Description = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
`;
const Body = styled.div`
  display: grid;
  gap: 1.5rem;
  max-width: 42rem;
  padding: 1.5rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;
const Field = styled.div`
  display: grid;
  gap: 0.375rem;
`;
const FieldLabel = styled.p`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.6875rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  svg {
    width: 0.625rem;
    height: 0.625rem;
  }
`;
const Value = styled.p`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
`;
const Notice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  margin: 0 1.5rem 1.5rem;
  padding: 0.875rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.accent}80;
  color: ${({ theme }) => theme.colors.accentForeground};
  font-size: 0.8125rem;
  line-height: 1.4;
  svg {
    width: 1rem;
    height: 1rem;
    flex: 0 0 auto;
    margin-top: 0.125rem;
  }
`;

export function ProfessionalInformationTab({ user }) {
  return (
    <Panel>
      <Header>
        <Title>Professional Information</Title>
        <Description>Employment record maintained by the system administrator.</Description>
      </Header>
      <Body>
        <Field>
          <FieldLabel>Employee ID</FieldLabel>
          <Value>{user.employeeId}</Value>
        </Field>
        <Field>
          <FieldLabel>Designation</FieldLabel>
          <Value>{user.designation}</Value>
        </Field>
        <Field>
          <FieldLabel>Department</FieldLabel>
          <Value>{user.department}</Value>
        </Field>
        <Field>
          <FieldLabel>Primary Role</FieldLabel>
          <Value>{ROLE_LABELS[user.role]}</Value>
        </Field>
        <Field>
          <FieldLabel>Reporting Manager</FieldLabel>
          <Value>{user.reportingManagerName ?? "—"}</Value>
        </Field>
        <Field>
          <FieldLabel>Employment Status</FieldLabel>
          <StatusBadge label={user.employmentStatus} status="active" />
        </Field>
        <Field>
          <FieldLabel>Joining Date</FieldLabel>
          <Value>{formatDate(user.joiningDate)}</Value>
        </Field>
      </Body>
      <Notice>
        <Info aria-hidden="true" />
        Professional information is managed by the system administrator.
        Contact HR or your workspace administrator to request a correction.
      </Notice>
    </Panel>
  );
}

"use client";

import styled from "styled-components";

import { Switch } from "@/components/ui/switch";

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;
const Copy = styled.div`
  min-width: 0;
`;
const Label = styled.p`
  margin: 0;
  font-size: 0.84375rem;
  font-weight: 600;
`;
const Description = styled.p`
  margin: 0.125rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const Channels = styled.div`
  display: flex;
  align-items: center;
  gap: 1.75rem;
  flex: 0 0 auto;
`;
const Channel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.6875rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

export function NotificationPreferenceRow({ description, label, onChange, value }) {
  return (
    <Row>
      <Copy>
        <Label>{label}</Label>
        {description ? <Description>{description}</Description> : null}
      </Copy>
      <Channels>
        <Channel>
          In-App
          <Switch checked={value.inApp} onCheckedChange={(next) => onChange("inApp", next)} />
        </Channel>
        <Channel>
          Email
          <Switch checked={value.email} onCheckedChange={(next) => onChange("email", next)} />
        </Channel>
      </Channels>
    </Row>
  );
}

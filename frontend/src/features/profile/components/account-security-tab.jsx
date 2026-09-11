"use client";

import {
  Check,
  Clock,
  KeyRound,
  LogOut,
  Mail,
  Monitor,
  Phone,
  Smartphone,
} from "lucide-react";
import styled from "styled-components";

import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/formatters";

const Grid = styled.div`
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 1.1fr 0.9fr;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;
const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.card};
  padding: 1.25rem 1.5rem;
`;
const Title = styled.h3`
  margin: 0 0 0.875rem;
  font-size: 0.9375rem;
  font-weight: 650;
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  &:first-of-type {
    border-top: 0;
  }
`;
const RowLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.84375rem;
`;
const RowIcon = styled.span`
  display: flex;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  color: ${({ theme }) => theme.colors.mutedForeground};
  svg {
    width: 0.9375rem;
    height: 0.9375rem;
  }
`;
const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;
const SessionsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.875rem;
`;
const SessionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  & + & {
    margin-top: 0.625rem;
  }
`;
const SessionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;
const DeviceIcon = styled.span`
  display: flex;
  width: 2.125rem;
  height: 2.125rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  svg {
    width: 1rem;
    height: 1rem;
  }
`;
const SessionDevice = styled.p`
  margin: 0;
  font-size: 0.84375rem;
  font-weight: 650;
`;
const SessionMeta = styled.p`
  margin: 0.125rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;

export function AccountSecurityTab({ sessions, user }) {
  return (
    <Grid>
      <Panel>
        <Title>Account Status</Title>
        <Row>
          <RowLabel>
            <RowIcon>
              <Mail aria-hidden="true" />
            </RowIcon>
            Email verification
          </RowLabel>
          {user.emailVerified ? (
            <Badge variant="success">
              <Check aria-hidden="true" />
              Verified
            </Badge>
          ) : (
            <Badge variant="warning">Pending</Badge>
          )}
        </Row>
        <Row>
          <RowLabel>
            <RowIcon>
              <Phone aria-hidden="true" />
            </RowIcon>
            Mobile verification
          </RowLabel>
          {user.mobileVerified ? (
            <Badge variant="success">
              <Check aria-hidden="true" />
              Verified
            </Badge>
          ) : (
            <Badge variant="warning">Pending</Badge>
          )}
        </Row>
        <Row>
          <RowLabel>
            <RowIcon>
              <KeyRound aria-hidden="true" />
            </RowIcon>
            Password status
          </RowLabel>
          <Badge variant="outline">Last changed 96 days ago</Badge>
        </Row>
        <Row>
          <RowLabel>
            <RowIcon>
              <Clock aria-hidden="true" />
            </RowIcon>
            Last login
          </RowLabel>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
            {formatDateTime(user.lastLoginAt)}
          </span>
        </Row>
        <Actions>
          <ConfirmationDialog
            confirmLabel="Send reset link"
            description="We'll email you a link to set a new password. Your other sessions will stay signed in."
            onConfirm={() => Promise.resolve()}
            title="Change your password?"
            trigger={
              <Button size="sm" variant="outline">
                <KeyRound aria-hidden="true" />
                Change Password
              </Button>
            }
          />
        </Actions>
      </Panel>

      <Panel>
        <SessionsHeader>
          <Title style={{ margin: 0 }}>Active Sessions</Title>
          <ConfirmationDialog
            confirmLabel="Log out other devices"
            description="This ends every session except the one you're using right now. You may need to sign in again on those devices."
            destructive
            onConfirm={() => Promise.resolve()}
            title="Log out other devices?"
            trigger={
              <Button size="sm" variant="destructive">
                <LogOut aria-hidden="true" />
                Logout Other Devices
              </Button>
            }
          />
        </SessionsHeader>
        {sessions.map((session) => (
          <SessionRow key={session.id}>
            <SessionInfo>
              <DeviceIcon>
                {session.device.toLowerCase().includes("iphone") ||
                session.device.toLowerCase().includes("android") ? (
                  <Smartphone aria-hidden="true" />
                ) : (
                  <Monitor aria-hidden="true" />
                )}
              </DeviceIcon>
              <div>
                <SessionDevice>{session.device}</SessionDevice>
                <SessionMeta>
                  {session.location} · {session.lastActiveLabel}
                </SessionMeta>
              </div>
            </SessionInfo>
            {session.current ? (
              <Badge variant="success">This device</Badge>
            ) : (
              <Button size="sm" variant="outline">
                Log out
              </Button>
            )}
          </SessionRow>
        ))}
      </Panel>
    </Grid>
  );
}

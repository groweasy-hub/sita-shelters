"use client";

import {
  CircleCheckBig,
  KeyRound,
  LogIn,
  LogOut,
  Pencil,
  ShieldAlert,
} from "lucide-react";
import styled from "styled-components";

import { EmptyState, ErrorState, LoadingState } from "@/components/feedback";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/formatters";
import { useCurrentUserActivity } from "../hooks/use-current-user";

const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.card};
  overflow: hidden;
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
const Scroll = styled.div`
  overflow-x: auto;
`;
const Table = styled.table`
  width: 100%;
  min-width: 42rem;
  border-collapse: collapse;
  font-size: 0.8125rem;
`;
const HeaderRow = styled.tr`
  background: ${({ theme }) => theme.colors.surfaceMuted};
  color: ${({ theme }) => theme.colors.mutedForeground};
`;
const Th = styled.th`
  padding: 0.625rem 1.25rem;
  font-size: 0.75rem;
  font-weight: 650;
  text-align: left;
`;
const Row = styled.tr`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;
const Td = styled.td`
  padding: 0.75rem 1.25rem;
  vertical-align: middle;
`;
const ActivityCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
`;
const ActivityIcon = styled.span`
  display: flex;
  width: 1.75rem;
  height: 1.75rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  color: ${({ theme }) => theme.colors.mutedForeground};
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`;
const Muted = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
`;
const Remarks = styled(Muted)`
  display: block;
  margin-top: 0.125rem;
  font-size: 0.75rem;
`;

const activityIcons = {
  "Logged in": LogIn,
  "Logged out": LogOut,
  "Logged out a device": LogOut,
  "Logged out of all devices": LogOut,
  "Profile updated": Pencil,
  "Password changed": KeyRound,
};

export function ActivityHistoryTab() {
  const activity = useCurrentUserActivity();

  return (
    <Panel>
      <Header>
        <Title>Activity History</Title>
        <Description>
          Account activity for the last 30 days, updated live. IP addresses are
          partially masked.
        </Description>
      </Header>
      {activity.isPending ? (
        <LoadingState label="Loading activity" />
      ) : activity.isError ? (
        <ErrorState
          description="Your account activity couldn't be loaded."
          onRetry={() => activity.refetch()}
          title="Unable to load activity"
        />
      ) : activity.data.length === 0 ? (
        <EmptyState
          description="Sign-ins, password changes and profile updates will appear here."
          title="No recent activity"
        />
      ) : (
        <Scroll>
          <Table>
            <thead>
              <HeaderRow>
                <Th>Date &amp; Time</Th>
                <Th>Activity</Th>
                <Th>Device</Th>
                <Th>IP Address</Th>
                <Th>Status</Th>
              </HeaderRow>
            </thead>
            <tbody>
              {activity.data.map((entry) => {
                const blocked = entry.status === "blocked";
                const Icon = blocked
                  ? ShieldAlert
                  : (activityIcons[entry.action] ?? CircleCheckBig);
                return (
                  <Row key={entry.id}>
                    <Td>{formatDateTime(entry.at)}</Td>
                    <Td>
                      <ActivityCell>
                        <ActivityIcon>
                          <Icon aria-hidden="true" />
                        </ActivityIcon>
                        <div>
                          {entry.action}
                          {entry.remarks ? <Remarks>{entry.remarks}</Remarks> : null}
                        </div>
                      </ActivityCell>
                    </Td>
                    <Td>{entry.device}</Td>
                    <Td>{entry.ipMasked ?? <Muted>—</Muted>}</Td>
                    <Td>
                      <Badge variant={blocked ? "destructive" : "success"}>
                        {blocked ? "Blocked" : "Success"}
                      </Badge>
                    </Td>
                  </Row>
                );
              })}
            </tbody>
          </Table>
        </Scroll>
      )}
    </Panel>
  );
}

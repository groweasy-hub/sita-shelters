"use client";

import {
  Building2,
  CircleCheckBig,
  KeyRound,
  Pencil,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import styled from "styled-components";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/formatters";

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

const activityIcons = {
  "Logged in": KeyRound,
  "Profile updated": Pencil,
  "Password changed": KeyRound,
  "Failed login attempt": KeyRound,
};
function resolveActivityIcon(action) {
  if (activityIcons[action]) return activityIcons[action];
  if (action.startsWith("New project assigned")) return Building2;
  if (action.startsWith("Role")) return UserCheck;
  return CircleCheckBig;
}
const statusMap = {
  success: "active",
  blocked: "rejected",
  applied: "approved",
};

export function ActivityHistoryTab({ entries }) {
  return (
    <Panel>
      <Header>
        <Title>Activity History</Title>
        <Description>
          Account activity for the last 30 days. IP addresses are partially
          masked.
        </Description>
      </Header>
      <Scroll>
        <Table>
          <thead>
            <HeaderRow>
              <Th>Date &amp; Time</Th>
              <Th>Activity</Th>
              <Th>Device</Th>
              <Th>IP / Location</Th>
              <Th>Status</Th>
            </HeaderRow>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const Icon = resolveActivityIcon(entry.action);
              return (
                <Row key={entry.id}>
                  <Td>{formatDateTime(entry.at)}</Td>
                  <Td>
                    <ActivityCell>
                      <ActivityIcon>
                        {entry.status === "blocked" ? (
                          <ShieldAlert aria-hidden="true" />
                        ) : (
                          <Icon aria-hidden="true" />
                        )}
                      </ActivityIcon>
                      {entry.action}
                    </ActivityCell>
                  </Td>
                  <Td>{entry.device}</Td>
                  <Td>{entry.ipMasked ?? <Muted>—</Muted>}</Td>
                  <Td>
                    <StatusBadge status={statusMap[entry.status] ?? entry.status} />
                  </Td>
                </Row>
              );
            })}
          </tbody>
        </Table>
      </Scroll>
    </Panel>
  );
}

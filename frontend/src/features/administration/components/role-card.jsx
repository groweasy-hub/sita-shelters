"use client";

import Link from "next/link";
import { Copy, KeyRound } from "lucide-react";
import styled from "styled-components";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ROLE_ACCESS_SCOPE, ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/config/permissions";

const Card = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.card};
`;
const Top = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
`;
const IconFrame = styled.span`
  display: flex;
  width: 2.375rem;
  height: 2.375rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accentForeground};
  svg {
    width: 1.125rem;
    height: 1.125rem;
  }
`;
const Title = styled.p`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 650;
`;
const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  line-height: 1.45;
`;
const Stats = styled.div`
  display: flex;
  gap: 1.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;
const StatValue = styled.p`
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 650;
`;
const StatLabel = styled.p`
  margin: 0.125rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.6875rem;
`;
const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export function RoleCard({ icon: Icon, isSystemRole, permissionCount, role, userCount }) {
  return (
    <Card>
      <Top>
        <IconFrame>
          <Icon aria-hidden="true" />
        </IconFrame>
        {isSystemRole ? <Badge variant="muted">System role</Badge> : null}
      </Top>
      <div>
        <Title>{ROLE_LABELS[role]}</Title>
        <Description>{ROLE_DESCRIPTIONS[role]}</Description>
      </div>
      <Stats>
        <div>
          <StatValue>{userCount}</StatValue>
          <StatLabel>Users</StatLabel>
        </div>
        <div>
          <StatValue>{permissionCount}</StatValue>
          <StatLabel>Permissions</StatLabel>
        </div>
        <div>
          <StatValue style={{ fontSize: "0.875rem" }}>
            {ROLE_ACCESS_SCOPE[role] === "global" ? "Global" : "Project"}
          </StatValue>
          <StatLabel>Access Scope</StatLabel>
        </div>
      </Stats>
      <CardActions>
        <Button asChild size="sm" variant="outline">
          <Link href={`/access/roles/${role}`}>View</Link>
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button disabled size="sm" variant="outline">
                <KeyRound aria-hidden="true" />
                Edit
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Requires backend</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button disabled size="sm" variant="outline">
                <Copy aria-hidden="true" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Duplicate role — requires backend</TooltipContent>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

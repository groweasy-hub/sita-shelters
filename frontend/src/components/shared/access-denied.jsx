"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import styled from "styled-components";

import { Button } from "@/components/ui/button";

const Wrap = styled.div`
  display: flex;
  min-height: 24rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  max-width: 28rem;
  margin: 2rem auto;
  padding: 2.5rem 1.5rem;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  text-align: center;
`;
const IconFrame = styled.span`
  display: grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.danger}14;
  color: ${({ theme }) => theme.colors.danger};
  svg {
    width: 1.375rem;
    height: 1.375rem;
  }
`;
const Title = styled.h2`
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 650;
`;
const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.875rem;
  line-height: 1.5rem;
`;

/** Shown by `RouteAccessGuard` when the signed-in role can't see a route. */
export function AccessDeniedState({ pageName, roleLabel }) {
  return (
    <Wrap role="alert">
      <IconFrame>
        <ShieldAlert aria-hidden="true" strokeWidth={1.75} />
      </IconFrame>
      <Title>Access Denied</Title>
      <Description>
        {roleLabel ? (
          <>
            Your role, <strong>{roleLabel}</strong>, doesn&apos;t include
            permission to view {pageName ? `"${pageName}"` : "this page"}.
          </>
        ) : (
          <>You don&apos;t have permission to view {pageName ? `"${pageName}"` : "this page"}.</>
        )}{" "}
        Contact your administrator if you believe this is a mistake.
      </Description>
      <Button asChild size="sm" variant="outline">
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </Wrap>
  );
}

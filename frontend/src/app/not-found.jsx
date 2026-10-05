"use client";

import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import styled from "styled-components";

const Main = styled.main`
  display: grid;
  min-height: 100vh;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.background};
  place-items: center;
`;
const Card = styled.section`
  width: 100%;
  max-width: 32rem;
  padding: 2.5rem 2rem;
  border-left: 2px solid ${({ theme }) => theme.colors.accentForeground};
  background: ${({ theme }) => theme.colors.card};
  box-shadow: ${({ theme }) => theme.shadows.subtle};
`;
const IconFrame = styled.div`
  display: flex;
  width: 2.75rem;
  height: 2.75rem;
  margin-bottom: 1.75rem;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryForeground};
`;
const Eyebrow = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.accentForeground};
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;
const Title = styled.h1`
  margin: 0.75rem 0 0;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 650;
  letter-spacing: -0.045em;
  line-height: 1.08;
`;
const Copy = styled.p`
  max-width: 28rem;
  margin: 0.75rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  line-height: 1.6;
`;
const ReturnLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.75rem;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.875rem;
  font-weight: 650;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
`;

export default function NotFound() {
  return (
    <Main>
      <Card>
        <IconFrame>
          <Building2 aria-hidden="true" size={21} strokeWidth={1.8} />
        </IconFrame>
        <Eyebrow>404 · Route unavailable</Eyebrow>
        <Title>This workspace could not be found.</Title>
        <Copy>
          The link may be outdated, or your current project scope may not
          include this resource.
        </Copy>
        <ReturnLink href="/dashboard">
          <ArrowLeft aria-hidden="true" size={16} />
          Return to dashboard
        </ReturnLink>
      </Card>
    </Main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import styled from "styled-components";

const Shell = styled.main`
  display: grid;
  height: 100vh;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 0.9fr) minmax(30rem, 1.1fr);
  }
`;
const Story = styled.aside`
  position: relative;
  display: none;
  height: 100%;
  padding: 2.75rem 3rem;
  overflow: hidden;
  flex-direction: column;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.sidebar};
  color: ${({ theme }) => theme.colors.inverseForeground};
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0.08;
    background-image:
      linear-gradient(
        ${({ theme }) => theme.colors.inverseBorder} 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        ${({ theme }) => theme.colors.inverseBorder} 1px,
        transparent 1px
      );
    background-size: 64px 64px;
    pointer-events: none;
  }
  @media (min-width: 1024px) {
    display: flex;
  }
  @media (min-width: 1280px) {
    padding-inline: 4rem;
  }
`;
const Brand = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: inherit;
  text-decoration: none;
`;
const Logo = styled.span`
  display: grid;
  width: 12rem;
  height: 3.375rem;
  place-items: center;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;
const Statement = styled.div`
  position: relative;
  max-width: 36rem;
  padding-bottom: 2rem;
`;
const AccentLine = styled.div`
  width: 5rem;
  height: 1px;
  margin-bottom: 2rem;
  background: ${({ theme }) => theme.colors.sidebarHighlight};
`;
const Eyebrow = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inverseQuiet};
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;
const StoryTitle = styled.h1`
  margin: 1rem 0 0;
  font-size: clamp(2.2rem, 4.2vw, 4.8rem);
  font-weight: 650;
  letter-spacing: -0.055em;
  line-height: 1.03;
  color: ${({ theme }) => theme.colors.inverseForeground};
`;
const StoryCopy = styled.p`
  max-width: 32rem;
  margin: 1.5rem 0 0;
  color: ${({ theme }) => theme.colors.inverseMuted};
  font-size: 1rem;
  line-height: 1.75rem;
`;
const Trust = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.inverseQuiet};
  font-size: 0.75rem;
`;
const FormSection = styled.section`
  display: flex;
  height: 100vh;
  align-items: safe center;
  justify-content: center;
  padding: 2.5rem 1.25rem;
  overflow-y: auto;
  @media (min-width: 640px) {
    padding-inline: 2.5rem;
  }
  @media (min-width: 1024px) {
    padding-inline: 4rem;
  }
`;
const FormContainer = styled.div`
  width: 100%;
  max-width: 28rem;
`;
const MobileBrand = styled(Brand)`
  margin-bottom: 3rem;
  @media (min-width: 1024px) {
    display: none;
  }
`;
const MobileLogo = styled(Logo)`
  width: 10.75rem;
  height: 3rem;
`;

export function AuthShell({ children }) {
  return (
    <Shell>
      <Story>
        <Brand href="/">
          <Logo>
            <Image
              alt="Sita Shelters"
              height={627}
              priority
              src="/images/logo.png"
              width={2236}
            />
          </Logo>
        </Brand>
        <Statement>
          <AccentLine />
          <Eyebrow>Project intelligence</Eyebrow>
          <StoryTitle>Build with clarity. Control every resource.</StoryTitle>
          <StoryCopy>
            One operating view for materials, procurement, quality and movement
            across the Sita project portfolio.
          </StoryCopy>
        </Statement>
        <Trust>
          <ShieldCheck aria-hidden="true" size={15} />
          Enterprise workspace · role-aware by design
        </Trust>
      </Story>
      <FormSection>
        <FormContainer>
          <MobileBrand href="/">
            <MobileLogo>
              <Image
                alt="Sita Shelters"
                height={627}
                priority
                src="/images/logo.png"
                width={2236}
              />
            </MobileLogo>
          </MobileBrand>
          {children}
        </FormContainer>
      </FormSection>
    </Shell>
  );
}

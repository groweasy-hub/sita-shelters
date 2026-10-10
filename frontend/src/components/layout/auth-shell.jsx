"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import styled from "styled-components";

const Shell = styled.main`
  box-sizing: border-box;
  display: grid;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
  @media (max-width: 1023px) {
    display: grid;
    grid-template-rows: 36dvh minmax(0, 64dvh);
    width: 100%;
    max-width: 100vw;
    height: 100vh;
    height: 100dvh;
    min-height: 0;
    overflow: hidden;
    background: #fffaf8;
  }
  @media (max-width: 430px) {
    grid-template-rows: 35dvh minmax(0, 65dvh);
  }
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
  box-sizing: border-box;
  display: flex;
  height: 100vh;
  height: 100dvh;
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
  @media (max-width: 1023px) {
    display: flex;
    height: 100%;
    min-height: 0;
    align-items: flex-start;
    justify-content: center;
    padding: 1.25rem 1rem 1.5rem;
    overflow-y: auto;
    background: #fffaf8;
  }
  @media (max-width: 760px) {
    padding-inline: 1rem;
  }
  @media (max-width: 360px) {
    padding-inline: 0.85rem;
  }
  @media (max-width: 430px) {
    padding: 1rem 1rem 1.5rem;
  }
`;
const FormContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  max-width: 28rem;
  @media (max-width: 1023px) {
    max-width: 24rem;
    margin: 0 auto;
    overflow: hidden;
  }
`;
// The logo's wordmark is white (made for the dark story panel), so on a phone
// it sits on a dark badge instead of vanishing into the light form background.
const MobileBrand = styled(Brand)`
  width: fit-content;
  margin-bottom: 2rem;
  padding: 0.625rem 0.875rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.sidebar};
  @media (min-width: 1024px) {
    display: none;
  }
  @media (max-width: 1023px) {
    display: none;
  }
`;
const MobileLogo = styled(Logo)`
  width: 10.75rem;
  height: 3rem;
`;
const MobileHero = styled.section`
  position: relative;
  display: none;
  height: 100%;
  min-height: 0;
  padding: clamp(1rem, 3vh, 1.75rem) 7rem clamp(3rem, 8vh, 4.5rem);
  overflow: hidden;
  color: #ffffff;
  background:
    radial-gradient(circle at 26% 18%, rgb(255 255 255 / 0.1), transparent 22rem),
    linear-gradient(135deg, #7e0017 0%, #990011 52%, #b1041a 100%);
  isolation: isolate;
  &::before {
    content: "";
    position: absolute;
    right: -6rem;
    bottom: 3.75rem;
    width: 36rem;
    height: 30rem;
    opacity: 0.27;
    background:
      linear-gradient(90deg, transparent 0 9%, rgb(255 255 255 / 0.28) 9% 10%, transparent 10% 23%, rgb(255 255 255 / 0.28) 23% 24%, transparent 24%),
      linear-gradient(0deg, transparent 0 18%, rgb(255 255 255 / 0.28) 18% 19%, transparent 19% 42%, rgb(255 255 255 / 0.28) 42% 43%, transparent 43% 66%, rgb(255 255 255 / 0.28) 66% 67%, transparent 67%),
      linear-gradient(160deg, transparent 0 50%, rgb(255 255 255 / 0.18) 50% 51%, transparent 51%);
    border: 1px solid rgb(255 255 255 / 0.22);
    transform: skewY(-8deg);
    pointer-events: none;
  }
  &::after {
    content: "";
    position: absolute;
    right: -10rem;
    top: 1.5rem;
    width: 20rem;
    height: 14rem;
    opacity: 0.16;
    border-top: 1px solid #ffffff;
    border-left: 1px solid #ffffff;
    transform: rotate(-24deg);
    pointer-events: none;
  }
  @media (max-width: 1023px) {
    display: block;
  }
  @media (max-width: 760px) {
    padding: clamp(0.8rem, 2.4vh, 1.25rem) 1rem clamp(2.25rem, 6vh, 3.75rem);
  }
  @media (max-width: 360px) {
    padding-inline: 0.85rem;
  }
  @media (max-width: 430px) {
    padding: 0.8rem 0.85rem 2.4rem;
  }
`;
const MobileHeroInner = styled.div`
  position: relative;
  z-index: 2;
  width: min(100%, 48rem);
  margin: 0 auto;
`;
const HeroLogo = styled(Logo)`
  width: clamp(11rem, 34vw, 18rem);
  height: clamp(3.05rem, 9.5vw, 5rem);
  @media (max-width: 760px) {
    width: clamp(8.5rem, 45vw, 13rem);
    height: clamp(2.35rem, 12.5vw, 3.7rem);
  }
  @media (max-width: 430px) {
    width: 9rem;
    height: 2.55rem;
  }
`;
const MobileStatement = styled.div`
  max-width: min(78vw, 24rem);
  margin-top: clamp(1.05rem, 3.5vh, 2rem);
  @media (max-width: 760px) {
    max-width: 72vw;
    margin-top: clamp(0.8rem, 2.6vh, 1.45rem);
  }
  @media (max-width: 430px) {
    max-width: 68vw;
    margin-top: 0.85rem;
  }
`;
const MobileAccentLine = styled.div`
  width: clamp(3.5rem, 14vw, 6rem);
  height: 2px;
  margin-bottom: clamp(0.75rem, 2vh, 1.2rem);
  background: rgb(255 255 255 / 0.9);
`;
const MobileEyebrow = styled.p`
  margin: 0;
  color: rgb(255 255 255 / 0.42);
  font-size: clamp(0.58rem, 2.2vw, 0.88rem);
  font-weight: 800;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  @media (max-width: 360px) {
    font-size: 0.48rem;
    letter-spacing: 0.22em;
  }
  @media (max-width: 430px) {
    font-size: 0.52rem;
    letter-spacing: 0.18em;
  }
`;
const MobileTitle = styled.h1`
  margin: clamp(0.55rem, 1.6vh, 0.9rem) 0 0;
  color: #ffffff;
  font-size: clamp(1.55rem, 5.9vw, 3rem);
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.06;
  max-width: 100%;
  overflow-wrap: anywhere;
  @media (max-width: 360px) {
    font-size: clamp(1.35rem, 9vw, 1.65rem);
    line-height: 1.08;
  }
  @media (max-width: 430px) {
    width: 68vw;
    font-size: clamp(1.2rem, 6.4vw, 1.48rem);
    line-height: 1.08;
  }
`;
const MobileCopy = styled.p`
  max-width: min(74vw, 22rem);
  margin: clamp(0.55rem, 1.8vh, 0.95rem) 0 0;
  color: rgb(255 255 255 / 0.92);
  font-size: clamp(0.8rem, 2.9vw, 1.1rem);
  line-height: 1.42;
  max-width: 100%;
  @media (max-width: 360px) {
    font-size: 0.72rem;
    line-height: 1.35;
  }
  @media (max-width: 430px) {
    width: 68vw;
    font-size: 0.66rem;
    line-height: 1.35;
  }
`;
const Wave = styled.div`
  position: absolute;
  right: -8%;
  bottom: -4rem;
  left: -8%;
  z-index: 1;
  height: clamp(5rem, 13vh, 8rem);
  background: #fffaf8;
  border-radius: 50% 50% 0 0 / 42% 52% 0 0;
  transform: rotate(1.5deg);
  &::before,
  &::after {
    content: "";
    position: absolute;
    inset-inline: -4%;
    top: -2.1rem;
    height: 5.75rem;
    border-radius: 50%;
    background: rgb(255 255 255 / 0.22);
  }
  &::after {
    top: -1.15rem;
    background: rgb(255 255 255 / 0.14);
  }
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
      <MobileHero>
        <MobileHeroInner>
          <Brand href="/">
            <HeroLogo>
              <Image
                alt="Sita Shelters"
                height={627}
                priority
                src="/images/logo.png"
                width={2236}
              />
            </HeroLogo>
          </Brand>
          <MobileStatement>
            <MobileAccentLine />
            <MobileEyebrow>Project intelligence</MobileEyebrow>
            <MobileTitle>Build with clarity. Control every resource.</MobileTitle>
            <MobileCopy>
              One operating view for materials, procurement, quality and movement
              across the Sita project portfolio.
            </MobileCopy>
          </MobileStatement>
        </MobileHeroInner>
        <Wave aria-hidden="true" />
      </MobileHero>
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

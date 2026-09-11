"use client";

import { ArrowUpRight, Blocks, ChartSpline, Construction } from "lucide-react";
import { motion } from "framer-motion";
import styled from "styled-components";

import { Badge } from "@/components/ui/badge";

const Section = styled(motion.section)`
  display: flex;
  min-height: calc(100dvh - 9rem);
  max-width: 72rem;
  margin: 0 auto;
  align-items: center;
`;
const Frame = styled.div`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const Grid = styled.div`
  display: grid;
  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1fr) 20rem;
  }
`;
const Main = styled.div`
  padding: 2.25rem 1.5rem;
  @media (min-width: 640px) {
    padding: 3rem 2.5rem;
  }
`;
const Topline = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
`;
const IconFrame = styled.span`
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
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
  font-size: clamp(2rem, 4vw, 3.25rem);
  font-weight: 650;
  letter-spacing: -0.045em;
  line-height: 1.05;
`;
const Description = styled.p`
  max-width: 42rem;
  margin: 1rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 1rem;
  line-height: 1.7;
`;
const Reference = styled.p`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1.75rem 0 0;
  padding-top: 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;
`;
const Aside = styled.aside`
  padding: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceMuted}80;
  @media (min-width: 1024px) {
    padding: 2rem;
    border-top: 0;
    border-left: 1px solid ${({ theme }) => theme.colors.border};
  }
`;
const AsideIcon = styled(Blocks)`
  color: ${({ theme }) => theme.colors.accentForeground};
`;
const AsideTitle = styled.h2`
  margin: 1.25rem 0 0;
  font-size: 0.875rem;
  font-weight: 650;
`;
const AsideCopy = styled.p`
  margin: 0.5rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.875rem;
  line-height: 1.5rem;
`;
const DefinitionList = styled.dl`
  display: grid;
  gap: 0.75rem;
  margin: 1.75rem 0 0;
  padding-top: 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.75rem;
`;
const Definition = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  dt {
    color: ${({ theme }) => theme.colors.mutedForeground};
  }
  dd {
    margin: 0;
    font-weight: 600;
  }
`;

const placeholderIcons = {
  reports: ChartSpline,
};

export function RoutePlaceholder({
  eyebrow,
  title,
  description,
  iconName,
  reference,
}) {
  const Icon = placeholderIcons[iconName] ?? Construction;

  return (
    <Section
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <Frame>
        <Grid>
          <Main>
            <Topline>
              <IconFrame>
                <Icon aria-hidden="true" size={21} strokeWidth={1.7} />
              </IconFrame>
              <Badge variant="muted">Foundation ready</Badge>
            </Topline>
            <Eyebrow>{eyebrow}</Eyebrow>
            <Title>{title}</Title>
            <Description>{description}</Description>
            {reference ? (
              <Reference>
                <ArrowUpRight aria-hidden="true" size={14} />
                Context: {reference}
              </Reference>
            ) : null}
          </Main>
          <Aside>
            <AsideIcon aria-hidden="true" size={20} />
            <AsideTitle>Module boundary established</AsideTitle>
            <AsideCopy>
              This route owns composition only. Components, schemas, hooks and
              services remain isolated inside its feature module.
            </AsideCopy>
            <DefinitionList>
              <Definition>
                <dt>Route shell</dt>
                <dd>Ready</dd>
              </Definition>
              <Definition>
                <dt>Permission slot</dt>
                <dd>Policy-ready</dd>
              </Definition>
              <Definition>
                <dt>Backend coupling</dt>
                <dd>None</dd>
              </Definition>
            </DefinitionList>
          </Aside>
        </Grid>
      </Frame>
    </Section>
  );
}

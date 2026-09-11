"use client";

import { Contrast, Sparkles, Type } from "lucide-react";
import styled from "styled-components";

import { Switch } from "@/components/ui/switch";
import { usePreferencesStore } from "@/stores/preferences-store";
import { FONT_SIZE_OPTIONS } from "../constants/preferences.constants";

const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.card};
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
const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  &:first-of-type {
    border-top: 0;
  }
`;
const RowInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;
const RowIcon = styled.span`
  display: flex;
  width: 2.125rem;
  height: 2.125rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  color: ${({ theme }) => theme.colors.mutedForeground};
  svg {
    width: 1rem;
    height: 1rem;
  }
`;
const RowName = styled.p`
  margin: 0;
  font-size: 0.84375rem;
  font-weight: 650;
`;
const RowDescription = styled.p`
  margin: 0.125rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const SizeToggle = styled.div`
  display: flex;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
`;
const SizeOption = styled.button`
  padding: 0.5rem 0.875rem;
  border: 0;
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $selected, theme }) => ($selected ? theme.colors.primary : theme.colors.card)};
  color: ${({ $selected, theme }) => ($selected ? theme.colors.primaryForeground : theme.colors.mutedForeground)};
  font-size: 0.78125rem;
  font-weight: 650;
  cursor: pointer;
  &:first-child {
    border-left: 0;
  }
`;

export function AccessibilitySection() {
  const accessibility = usePreferencesStore((state) => state.accessibility);
  const setFontSize = usePreferencesStore((state) => state.setFontSize);
  const setReducedMotion = usePreferencesStore((state) => state.setReducedMotion);
  const setHighContrast = usePreferencesStore((state) => state.setHighContrast);

  return (
    <Panel>
      <Header>
        <Title>Accessibility</Title>
        <Description>
          A minimal set of controls to make the workspace easier to read and
          navigate.
        </Description>
      </Header>
      <Row>
        <RowInfo>
          <RowIcon>
            <Type aria-hidden="true" />
          </RowIcon>
          <div>
            <RowName>Font Size</RowName>
            <RowDescription>Scales text across the whole workspace.</RowDescription>
          </div>
        </RowInfo>
        <SizeToggle>
          {FONT_SIZE_OPTIONS.map((option) => (
            <SizeOption
              $selected={accessibility.fontSize === option.value}
              key={option.value}
              onClick={() => setFontSize(option.value)}
              type="button"
            >
              {option.label}
            </SizeOption>
          ))}
        </SizeToggle>
      </Row>
      <Row>
        <RowInfo>
          <RowIcon>
            <Sparkles aria-hidden="true" />
          </RowIcon>
          <div>
            <RowName>Reduced Motion</RowName>
            <RowDescription>Minimizes transitions and animated feedback.</RowDescription>
          </div>
        </RowInfo>
        <Switch checked={accessibility.reducedMotion} onCheckedChange={setReducedMotion} />
      </Row>
      <Row>
        <RowInfo>
          <RowIcon>
            <Contrast aria-hidden="true" />
          </RowIcon>
          <div>
            <RowName>High Contrast</RowName>
            <RowDescription>
              Increases contrast between text, borders and surfaces.
            </RowDescription>
          </div>
        </RowInfo>
        <Switch checked={accessibility.highContrast} onCheckedChange={setHighContrast} />
      </Row>
    </Panel>
  );
}

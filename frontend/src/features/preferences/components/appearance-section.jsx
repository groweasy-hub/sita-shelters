"use client";

import { Info, Moon, Sun } from "lucide-react";
import styled from "styled-components";

import { usePreferencesStore } from "@/stores/preferences-store";
import { DENSITY_OPTIONS, THEME_MODE_OPTIONS } from "../constants/preferences.constants";

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
const OptionGrid = styled.div`
  display: grid;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;
const Option = styled.button`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 0.875rem;
  border: 1.5px solid
    ${({ $selected, theme }) => ($selected ? theme.colors.primary : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $selected, theme }) => ($selected ? `${theme.colors.primary}0a` : theme.colors.card)};
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
`;
const OptionLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 650;
  svg {
    width: 1rem;
    height: 1rem;
  }
`;
const Notice = styled.div`
  display: flex;
  gap: 0.625rem;
  margin: 0 1.5rem 1.25rem;
  padding: 0.75rem 0.875rem;
  border: 1px solid ${({ theme }) => theme.colors.info}33;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.info}0d;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.78125rem;
  line-height: 1.45;
  svg {
    width: 0.9375rem;
    height: 0.9375rem;
    flex: 0 0 auto;
    margin-top: 0.125rem;
    color: ${({ theme }) => theme.colors.info};
  }
`;
const DensityRow = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
`;

const themeIcons = { light: Sun, dark: Moon };

export function AppearanceSection() {
  const { density, themeMode } = usePreferencesStore((state) => state.appearance);
  const setThemeMode = usePreferencesStore((state) => state.setThemeMode);
  const setDensity = usePreferencesStore((state) => state.setDensity);

  return (
    <>
      <Panel>
        <Header>
          <Title>Theme Mode</Title>
          <Description>Choose how Sita Shelters looks when you sign in.</Description>
        </Header>
        <OptionGrid>
          {THEME_MODE_OPTIONS.map((option) => {
            const Icon = themeIcons[option.value];
            return (
              <Option
                $selected={themeMode === option.value}
                key={option.value}
                onClick={() => setThemeMode(option.value)}
                type="button"
              >
                <OptionLabel>
                  <Icon aria-hidden="true" />
                  {option.label}
                </OptionLabel>
              </Option>
            );
          })}
        </OptionGrid>
        <Notice>
          <Info aria-hidden="true" />
          Applies instantly and is saved for your user account on this device.
          Light is the default until you choose dark.
        </Notice>
      </Panel>

      <Panel style={{ marginTop: "1.5rem" }}>
        <Header>
          <Title>Interface Density</Title>
          <Description>Controls spacing in tables and lists.</Description>
        </Header>
        <DensityRow>
          {DENSITY_OPTIONS.map((option) => (
            <Option
              $selected={density === option.value}
              key={option.value}
              onClick={() => setDensity(option.value)}
              style={{ flex: 1 }}
              type="button"
            >
              <OptionLabel>{option.label}</OptionLabel>
            </Option>
          ))}
        </DensityRow>
      </Panel>
    </>
  );
}

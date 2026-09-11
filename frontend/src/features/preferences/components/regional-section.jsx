"use client";

import { Info } from "lucide-react";
import styled from "styled-components";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePreferencesStore } from "@/stores/preferences-store";
import {
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  NUMBER_FORMAT_OPTIONS,
  TIME_ZONE_OPTIONS,
} from "../constants/preferences.constants";

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
const FieldGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;
const FieldLabel = styled.p`
  margin: 0 0 0.5rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.6875rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;
const Hint = styled.p`
  margin: 0.375rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.71875rem;
`;
const Notice = styled.div`
  display: flex;
  gap: 0.625rem;
  margin: 0 1.5rem 1.25rem;
  padding: 0.75rem 0.875rem;
  border: 1px solid ${({ theme }) => theme.colors.info}33;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.info}0d;
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

export function RegionalSection() {
  const regional = usePreferencesStore((state) => state.regional);
  const setRegionalField = usePreferencesStore((state) => state.setRegionalField);
  const dateFormat = DATE_FORMAT_OPTIONS.find(
    (option) => option.value === regional.dateFormat,
  );

  return (
    <Panel>
      <Header>
        <Title>Regional Settings</Title>
        <Description>
          Defaults are set for the Sita Shelters India operation; each is
          independently changeable.
        </Description>
      </Header>
      <FieldGrid>
        <div>
          <FieldLabel>Language</FieldLabel>
          <Select
            onValueChange={(value) => setRegionalField("language", value)}
            value={regional.language}
          >
            <SelectTrigger style={{ width: "100%" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Hint>More languages coming soon.</Hint>
        </div>
        <div>
          <FieldLabel>Time Zone</FieldLabel>
          <Select
            onValueChange={(value) => setRegionalField("timeZone", value)}
            value={regional.timeZone}
          >
            <SelectTrigger style={{ width: "100%" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_ZONE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <FieldLabel>Date Format</FieldLabel>
          <Select
            onValueChange={(value) => setRegionalField("dateFormat", value)}
            value={regional.dateFormat}
          >
            <SelectTrigger style={{ width: "100%" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_FORMAT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Hint>Example: {dateFormat?.example}</Hint>
        </div>
        <div>
          <FieldLabel>Number Format</FieldLabel>
          <Select
            onValueChange={(value) => setRegionalField("numberFormat", value)}
            value={regional.numberFormat}
          >
            <SelectTrigger style={{ width: "100%" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NUMBER_FORMAT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <FieldLabel>Currency Display</FieldLabel>
          <Select
            onValueChange={(value) => setRegionalField("currency", value)}
            value={regional.currency}
          >
            <SelectTrigger style={{ width: "100%" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FieldGrid>
      <Notice>
        <Info aria-hidden="true" />
        These settings only change how information is displayed for you.
        Reports and shared documents follow the workspace default unless
        you export them.
      </Notice>
    </Panel>
  );
}

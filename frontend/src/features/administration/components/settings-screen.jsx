"use client";

import { Info } from "lucide-react";
import styled from "styled-components";

import { PageHeader } from "@/components/shared";
import { DEFAULT_CURRENCY, DEFAULT_LOCALE, siteConfig } from "@/config";
import { SettingsToggleRow } from "./settings-toggle-row";

const Root = styled.div`
  display: grid;
  max-width: 60rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const Notice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.875rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.info}33;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.info}0d;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.8125rem;
  line-height: 1.4;
  svg {
    width: 1rem;
    height: 1rem;
    flex: 0 0 auto;
    margin-top: 0.125rem;
    color: ${({ theme }) => theme.colors.info};
  }
`;
const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const PanelHeader = styled.header`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.875rem;
  font-weight: 650;
`;
const DefinitionGrid = styled.dl`
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  margin: 0;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  dt {
    color: ${({ theme }) => theme.colors.mutedForeground};
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  dd {
    margin: 0.25rem 0 0;
    font-size: 0.9375rem;
    font-weight: 600;
  }
`;

export function SettingsScreen() {
  return (
    <Root>
      <PageHeader
        description="Organization identity and workspace preferences."
        eyebrow="Administration"
        title="Settings"
      />
      <Notice>
        <Info aria-hidden="true" />
        Settings are presentation-only until connected to a backend.
      </Notice>
      <Panel>
        <PanelHeader>Organization</PanelHeader>
        <DefinitionGrid>
          <div>
            <dt>Organization name</dt>
            <dd>{siteConfig.name}</dd>
          </div>
          <div>
            <dt>Default currency</dt>
            <dd>{DEFAULT_CURRENCY}</dd>
          </div>
          <div>
            <dt>Default locale</dt>
            <dd>{DEFAULT_LOCALE}</dd>
          </div>
        </DefinitionGrid>
      </Panel>
      <Panel>
        <PanelHeader>Preferences</PanelHeader>
        <SettingsToggleRow
          description="Notify store managers when material stock falls below the reorder level."
          enabled
          label="Email notifications for low stock"
        />
        <SettingsToggleRow
          description="Route indents above the threshold to an approver before procurement can act."
          enabled
          label="Require approval for indents over ₹1,00,000"
        />
        <SettingsToggleRow
          description="Require a second verification step at sign-in."
          enabled={false}
          label="Two-factor authentication"
        />
      </Panel>
    </Root>
  );
}

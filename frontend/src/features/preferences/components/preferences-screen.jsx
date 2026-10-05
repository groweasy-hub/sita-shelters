"use client";

import { useState } from "react";
import styled from "styled-components";

import { PageHeader } from "@/components/shared/page-header";
import { PREFERENCES_SECTIONS } from "../constants/preferences.constants";
import { AccessibilitySection } from "./accessibility-section";
import { AppearanceSection } from "./appearance-section";
import { DashboardSection } from "./dashboard-section";
import { NotificationsSection } from "./notifications-section";
import { RegionalSection } from "./regional-section";
import { SettingsNav } from "./settings-nav";

const Root = styled.div`
  display: grid;
  max-width: 64rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const Layout = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: 13.75rem 1fr;
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const sectionComponents = {
  appearance: AppearanceSection,
  notifications: NotificationsSection,
  dashboard: DashboardSection,
  regional: RegionalSection,
  accessibility: AccessibilitySection,
};

export function PreferencesScreen() {
  const [activeSection, setActiveSection] = useState("appearance");
  const ActiveSection = sectionComponents[activeSection];

  return (
    <Root>
      <PageHeader
        description="Personal settings for how the workspace looks and behaves for you. These never affect other users."
        eyebrow="My Account"
        title="Preferences"
      />
      <Layout>
        <SettingsNav
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          sections={PREFERENCES_SECTIONS}
        />
        <ActiveSection />
      </Layout>
    </Root>
  );
}

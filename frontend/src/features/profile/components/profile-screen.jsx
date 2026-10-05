"use client";

import styled from "styled-components";

import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROFILE_TABS } from "../constants/profile.constants";
import { useCurrentUser } from "../hooks/use-current-user";
import { AccountSecurityTab } from "./account-security-tab";
import { ActivityHistoryTab } from "./activity-history-tab";
import { PersonalInformationTab } from "./personal-information-tab";
import { ProfessionalInformationTab } from "./professional-information-tab";
import { ProfileHeader } from "./profile-header";
import { ProjectAssignmentsTab } from "./project-assignments-tab";

const Root = styled.div`
  display: grid;
  max-width: 72rem;
  margin: 0 auto;
  gap: 1.5rem;
`;

export function ProfileScreen() {
  const user = useCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <Root>
      <PageHeader
        description="Your professional identity, project access and account security across the Sita Shelters workspace."
        eyebrow="My Account"
        title="Profile"
      />
      <ProfileHeader user={user} />
      <Tabs defaultValue="personal">
        <TabsList>
          {PROFILE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="personal">
          <PersonalInformationTab user={user} />
        </TabsContent>
        <TabsContent value="professional">
          <ProfessionalInformationTab user={user} />
        </TabsContent>
        <TabsContent value="projects">
          <ProjectAssignmentsTab user={user} />
        </TabsContent>
        <TabsContent value="security">
          <AccountSecurityTab user={user} />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityHistoryTab />
        </TabsContent>
      </Tabs>
    </Root>
  );
}

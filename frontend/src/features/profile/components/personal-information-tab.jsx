"use client";

import { Check, Pencil } from "lucide-react";
import styled from "styled-components";

import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EditProfileDialog } from "./edit-profile-dialog";

const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.card};
`;
const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
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
const Body = styled.div`
  display: grid;
  gap: 1.5rem;
  max-width: 42rem;
  padding: 1.5rem;
  grid-template-columns: minmax(0, 1fr);
  @media (min-width: 560px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;
const Field = styled.div`
  display: grid;
  gap: 0.5rem;
`;
const ViewValue = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
`;
const PhotoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export function PersonalInformationTab({ user }) {
  return (
    <Panel>
      <Header>
        <div>
          <Title>Personal Information</Title>
          <Description>
            Contact details you control. Changing your email requires
            re-verification before it takes effect.
          </Description>
        </div>
        <EditProfileDialog
          trigger={
            <Button size="sm" variant="outline">
              <Pencil aria-hidden="true" />
              Edit
            </Button>
          }
          user={user}
        />
      </Header>
      <Body>
        <Field>
          <Label>Full Name</Label>
          <ViewValue>{user.name}</ViewValue>
        </Field>
        <Field>
          <Label>Mobile Number</Label>
          <ViewValue>
            {user.mobile || "—"}
            {user.mobile ? (
              user.mobileVerified ? (
                <Badge variant="success">
                  <Check aria-hidden="true" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="warning">Pending verification</Badge>
              )
            ) : null}
          </ViewValue>
        </Field>
        <Field>
          <Label>Email Address</Label>
          <ViewValue>
            {user.email}
            {user.emailVerified ? (
              <Badge variant="success">
                <Check aria-hidden="true" />
                Verified
              </Badge>
            ) : (
              <Badge variant="warning">Pending verification</Badge>
            )}
          </ViewValue>
        </Field>
        <Field>
          <Label>Profile Image</Label>
          <PhotoRow>
            <UserAvatar name={user.name} size="2.25rem" />
            <Button size="sm" variant="outline">
              <Pencil aria-hidden="true" />
              Change photo
            </Button>
          </PhotoRow>
        </Field>
      </Body>
    </Panel>
  );
}

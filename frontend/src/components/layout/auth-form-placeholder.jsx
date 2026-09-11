"use client";

import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import styled, { keyframes } from "styled-components";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const content = {
  login: {
    eyebrow: "Secure workspace",
    title: "Welcome back",
    description: "Sign in to continue to construction operations.",
    action: "Continue securely",
  },
  "forgot-password": {
    eyebrow: "Account recovery",
    title: "Reset your access",
    description: "Enter your work email to begin the recovery process.",
    action: "Send recovery link",
  },
  "reset-password": {
    eyebrow: "Account security",
    title: "Choose a new password",
    description: "Set a strong password for your Sita Shelters workspace.",
    action: "Update password",
  },
};
const enter = keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); }`;
const Root = styled.div`
  animation: ${enter} 220ms ease-out;
`;
const Header = styled.div`
  margin-bottom: 2rem;
`;
const Eyebrow = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.accentForeground};
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;
const Title = styled.h2`
  margin: 0.75rem 0 0;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 650;
  letter-spacing: -0.045em;
  line-height: 1.08;
`;
const Description = styled.p`
  margin: 0.5rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
`;
const Form = styled.form`
  display: grid;
  gap: 1.25rem;
`;
const Field = styled.div`
  display: grid;
  gap: 0.5rem;
`;
const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;
const TextLink = styled(Link)`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-weight: 550;
  text-decoration: none;
  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
    text-decoration: underline;
  }
`;
const SubmitButton = styled(Button)`
  width: 100%;
  height: 2.5rem;
  justify-content: space-between;
`;
const ButtonLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
const Return = styled.p`
  margin: 1.75rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.875rem;
  text-align: center;
  a {
    color: ${({ theme }) => theme.colors.foreground};
    font-weight: 650;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;
const Note = styled.p`
  margin: 2.5rem 0 0;
  padding-top: 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  line-height: 1.25rem;
`;

export function AuthFormPlaceholder({ mode }) {
  const copy = content[mode];
  const isLogin = mode === "login";
  const isReset = mode === "reset-password";
  return (
    <Root>
      <Header>
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <Title>{copy.title}</Title>
        <Description>{copy.description}</Description>
      </Header>
      <Form action="#">
        {!isReset ? (
          <Field>
            <Label htmlFor="email">Work email</Label>
            <Input
              autoComplete="email"
              id="email"
              placeholder="name@sitagroup.com"
              type="email"
            />
          </Field>
        ) : null}
        {isLogin || isReset ? (
          <Field>
            <LabelRow>
              <Label htmlFor="password">
                {isReset ? "New password" : "Password"}
              </Label>
              {isLogin ? (
                <TextLink href="/forgot-password">Forgot password?</TextLink>
              ) : null}
            </LabelRow>
            <Input
              autoComplete={isReset ? "new-password" : "current-password"}
              id="password"
              type="password"
            />
          </Field>
        ) : null}
        {isReset ? (
          <Field>
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              autoComplete="new-password"
              id="confirm-password"
              type="password"
            />
          </Field>
        ) : null}
        <SubmitButton type="button">
          <ButtonLabel>
            <LockKeyhole aria-hidden="true" size={15} />
            {copy.action}
          </ButtonLabel>
          <ArrowRight aria-hidden="true" size={16} />
        </SubmitButton>
      </Form>
      {!isLogin ? (
        <Return>
          Remembered your details? <Link href="/login">Return to sign in</Link>
        </Return>
      ) : null}
      <Note>
        Authentication behavior is intentionally not connected in this frontend
        foundation. Access policy will be integrated at the application
        boundary.
      </Note>
    </Root>
  );
}

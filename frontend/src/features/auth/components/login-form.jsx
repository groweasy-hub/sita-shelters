"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Info, LockKeyhole } from "lucide-react";
import styled, { keyframes } from "styled-components";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_ROLES, ROLE_LABELS } from "@/config/permissions";
import { USERS } from "@/lib/mock-data/users";

const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_LOGIN_PASSWORD ?? "";
const accountsByRole = APP_ROLES.map((role) => ({
  role,
  label: ROLE_LABELS[role],
  users: USERS.filter((user) => user.role === role),
})).filter((group) => group.users.length > 0);

const enter = keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); }`;
const Root = styled.div`
  animation: ${enter} 220ms ease-out;
`;
const Header = styled.div`
  margin-bottom: 1.75rem;
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
const ErrorMessage = styled.p`
  margin: 0;
  padding: 0.625rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.danger}40;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.danger}18;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.8125rem;
`;
const Notice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 0.75rem 0.875rem;
  border: 1px solid ${({ theme }) => theme.colors.info}33;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.info}0d;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.78125rem;
  line-height: 1.4;
  svg {
    width: 0.9375rem;
    height: 0.9375rem;
    flex: 0 0 auto;
    margin-top: 0.125rem;
    color: ${({ theme }) => theme.colors.info};
  }
`;
const Demo = styled.div`
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;
const DemoTitle = styled.p`
  margin: 0 0 0.875rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.6875rem;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;
const DemoGroups = styled.div`
  display: grid;
  gap: 0.875rem;
  max-height: 15rem;
  overflow-y: auto;
  padding-right: 0.25rem;
`;
const DemoGroup = styled.div`
  display: grid;
  gap: 0.375rem;
`;
const DemoGroupLabel = styled.p`
  margin: 0;
  font-size: 0.75rem;
  font-weight: 650;
`;
const DemoChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
`;
const DemoChip = styled.button`
  display: inline-flex;
  align-items: center;
  height: 1.75rem;
  padding: 0 0.625rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body.error ?? "Sign in failed. Please try again.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Root>
      <Header>
        <Eyebrow>Secure workspace</Eyebrow>
        <Title>Welcome back</Title>
        <Description>Sign in to continue to construction operations.</Description>
      </Header>
      <Form onSubmit={handleSubmit}>
        <Field>
          <Label htmlFor="email">Work email</Label>
          <Input
            autoComplete="email"
            id="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@sitashelters-example.com"
            type="email"
            value={email}
          />
        </Field>
        <Field>
          <Label htmlFor="password">Password</Label>
          <Input
            autoComplete="current-password"
            id="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </Field>
        {error ? <ErrorMessage role="alert">{error}</ErrorMessage> : null}
        <SubmitButton disabled={pending} type="submit">
          <ButtonLabel>
            <LockKeyhole aria-hidden="true" size={15} />
            {pending ? "Signing in…" : "Continue securely"}
          </ButtonLabel>
          <ArrowRight aria-hidden="true" size={16} />
        </SubmitButton>
      </Form>
      <Notice>
        <Info aria-hidden="true" />
        Dummy demo login — there is no real backend yet. Every account below
        signs in with the password{" "}
        <strong>{DEMO_PASSWORD || "(not configured)"}</strong>, already filled
        in above. Pick anyone to preview their dashboard.
      </Notice>
      <Demo>
        <DemoTitle>Demo accounts</DemoTitle>
        <DemoGroups>
          {accountsByRole.map((group) => (
            <DemoGroup key={group.role}>
              <DemoGroupLabel>
                {group.label}{" "}
                <Badge style={{ marginLeft: "0.25rem" }} variant="muted">
                  {group.users.length}
                </Badge>
              </DemoGroupLabel>
              <DemoChips>
                {group.users.map((user) => (
                  <DemoChip
                    key={user.id}
                    onClick={() => setEmail(user.email)}
                    type="button"
                  >
                    {user.name}
                  </DemoChip>
                ))}
              </DemoChips>
            </DemoGroup>
          ))}
        </DemoGroups>
      </Demo>
    </Root>
  );
}

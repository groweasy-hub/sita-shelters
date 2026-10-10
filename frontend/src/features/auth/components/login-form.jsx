"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Info, LockKeyhole, Mail } from "lucide-react";
import styled, { keyframes } from "styled-components";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HttpError } from "@/services/http-client";
import { useRefreshAuth } from "../hooks/use-auth";
import { login } from "../services/auth.service";

const enter = keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); }`;
const Root = styled.div`
  animation: ${enter} 220ms ease-out;
  @media (max-width: 1023px) {
    display: grid;
    justify-items: center;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }
`;
const Header = styled.div`
  margin-bottom: 1.75rem;
  @media (max-width: 1023px) {
    width: 100%;
    max-width: 21.5rem;
    justify-self: center;
    margin-bottom: 1.25rem;
    text-align: center;
  }
`;
const Eyebrow = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.accentForeground};
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  @media (max-width: 1023px) {
    color: #990011;
    font-size: 0.68rem;
    font-weight: 900;
    letter-spacing: 0.14em;
  }
`;
const Title = styled.h2`
  margin: 0.75rem 0 0;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 650;
  letter-spacing: -0.045em;
  line-height: 1.08;
  @media (max-width: 1023px) {
    margin-top: 0.5rem;
    color: #080d13;
    font-size: 2.35rem;
    font-weight: 850;
    letter-spacing: 0;
    line-height: 1.02;
    white-space: normal;
  }
  @media (max-width: 380px) {
    font-size: 2rem;
  }
`;
const Description = styled.p`
  margin: 0.5rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  @media (max-width: 1023px) {
    margin-top: 0.55rem;
    color: #777f87;
    font-size: 0.95rem;
    line-height: 1.35;
  }
`;
const Form = styled.form`
  display: grid;
  gap: 1.25rem;
  @media (max-width: 1023px) {
    width: 100%;
    max-width: 21.5rem;
    justify-self: center;
    gap: 0.85rem;
  }
`;
const Field = styled.div`
  display: grid;
  gap: 0.5rem;
  @media (max-width: 1023px) {
    gap: 0.45rem;
  }
  label {
    @media (max-width: 1023px) {
      color: #111820;
      font-size: 0.75rem;
      font-weight: 800;
    }
  }
`;
const Control = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;
const ControlIcon = styled.span`
  position: absolute;
  left: 1rem;
  z-index: 1;
  display: inline-flex;
  color: #646d76;
  pointer-events: none;
  svg {
    width: 1.35rem;
    height: 1.35rem;
  }
  @media (max-width: 1023px) {
    left: 1rem;
    svg {
      width: 1.15rem;
      height: 1.15rem;
    }
  }
`;
const LoginInput = styled(Input)`
  padding-left: 3rem;
  @media (max-width: 1023px) {
    height: 3.15rem;
    padding-right: 3rem;
    padding-left: 3rem;
    border-color: #d5d5d7;
    border-radius: 1.25rem;
    background: #fffdfc;
    color: #111820;
    font-size: 1rem;
    box-shadow: 0 1px 0 rgb(0 0 0 / 0.03);
    &::placeholder {
      color: #7f8790;
    }
  }
`;
const PasswordToggle = styled.button`
  position: absolute;
  right: 0.875rem;
  display: inline-flex;
  width: 2.25rem;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: #646d76;
  cursor: pointer;
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
  @media (max-width: 1023px) {
    right: 0.7rem;
    width: 2.2rem;
    height: 2.2rem;
    svg {
      width: 1.15rem;
      height: 1.15rem;
    }
  }
`;
const SubmitButton = styled(Button)`
  width: 100%;
  height: 2.5rem;
  justify-content: center;
  @media (max-width: 1023px) {
    height: 3.15rem;
    margin-top: 0.25rem;
    padding-inline: 1rem;
    border-radius: 1.25rem;
    background: linear-gradient(135deg, #b70016 0%, #990011 62%, #c50019 100%);
    color: #ffffff;
    font-size: 0.95rem;
    font-weight: 800;
    box-shadow: 0 1.25rem 2.5rem rgb(153 0 17 / 0.18);
    svg {
      width: 1rem;
      height: 1rem;
    }
    > svg {
      display: none;
    }
  }
`;
const ButtonLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  @media (max-width: 1023px) {
    gap: 0.55rem;
  }
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
  @media (max-width: 1023px) {
    width: 100%;
    max-width: 21.5rem;
    justify-self: center;
    gap: 0.75rem;
    margin-top: 1rem;
    padding: 0.875rem 1rem;
    border-color: #dfe5eb;
    border-radius: 1.25rem;
    background: #f9fafc;
    color: #101820;
    font-size: 0.78rem;
    box-shadow: 0 0.75rem 2rem rgb(17 24 39 / 0.04);
    svg {
      width: 1rem;
      height: 1rem;
      margin-top: 0.1rem;
      color: #406a8f;
    }
  }
`;
const NoticeText = styled.span`
  display: grid;
  gap: 0.25rem;
  strong {
    font-size: 1em;
    font-weight: 850;
  }
`;
export function LoginForm() {
  const router = useRouter();
  const refreshAuth = useRefreshAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login({ email, password });
      // Populate the auth cache with the now-signed-in user before
      // navigating — the dashboard layout reads it synchronously on mount,
      // so arriving there before this resolves reads stale "signed out"
      // data and bounces straight back to `/login`.
      await refreshAuth();
      router.push("/dashboard");
    } catch (submitError) {
      if (submitError instanceof HttpError) {
        setError(
          submitError.body?.error ?? "Sign in failed. Please try again.",
        );
      } else {
        setError("Could not reach the server. Please try again.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Root>
      <Header>
        <Eyebrow>Secure workspace</Eyebrow>
        <Title>Welcome back</Title>
        <Description>
          Sign in to continue to construction operations.
        </Description>
      </Header>
      <Form onSubmit={handleSubmit}>
        <Field>
          <Label htmlFor="email">Work email</Label>
          <Control>
            <ControlIcon>
              <Mail aria-hidden="true" strokeWidth={1.9} />
            </ControlIcon>
            <LoginInput
              autoComplete="email"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@sitashelters-example.com"
              type="email"
              value={email}
            />
          </Control>
        </Field>
        <Field>
          <Label htmlFor="password">Password</Label>
          <Control>
            <ControlIcon>
              <LockKeyhole aria-hidden="true" strokeWidth={1.9} />
            </ControlIcon>
            <LoginInput
              autoComplete="current-password"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <PasswordToggle
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
              type="button"
            >
              {showPassword ? (
                <Eye aria-hidden="true" strokeWidth={1.9} />
              ) : (
                <EyeOff aria-hidden="true" strokeWidth={1.9} />
              )}
            </PasswordToggle>
          </Control>
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
        <NoticeText>
          <strong>Don&apos;t have access yet?</strong>
          <span>Ask your administrator to activate your account.</span>
        </NoticeText>
      </Notice>
    </Root>
  );
}

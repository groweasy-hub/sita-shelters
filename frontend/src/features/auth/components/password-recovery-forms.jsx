"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import styled, { keyframes } from "styled-components";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HttpError } from "@/services/http-client";
import { requestPasswordReset, resetPassword } from "../services/auth.service";

const enter = keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); }`;
const Root = styled.div`
  display: grid;
  width: 100%;
  max-width: 21.5rem;
  justify-self: center;
  gap: 1rem;
  animation: ${enter} 220ms ease-out;
`;
const Header = styled.div`
  display: grid;
  gap: 0.55rem;
  text-align: center;
`;
const Eyebrow = styled.p`
  margin: 0;
  color: #990011;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;
const Title = styled.h2`
  margin: 0;
  color: #080d13;
  font-size: 2.15rem;
  font-weight: 850;
  letter-spacing: 0;
  line-height: 1.04;
`;
const Description = styled.p`
  margin: 0;
  color: #777f87;
  font-size: 0.95rem;
  line-height: 1.35;
`;
const Form = styled.form`
  display: grid;
  gap: 0.85rem;
`;
const Field = styled.div`
  display: grid;
  gap: 0.45rem;
  label {
    color: #111820;
    font-size: 0.75rem;
    font-weight: 800;
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
    width: 1.15rem;
    height: 1.15rem;
  }
`;
const RecoveryInput = styled(Input)`
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
`;
const PasswordToggle = styled.button`
  position: absolute;
  right: 0.7rem;
  display: inline-flex;
  width: 2.2rem;
  height: 2.2rem;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: #646d76;
  cursor: pointer;
  svg {
    width: 1.15rem;
    height: 1.15rem;
  }
`;
const SubmitButton = styled(Button)`
  width: 100%;
  height: 3.15rem;
  justify-content: center;
  margin-top: 0.25rem;
  padding-inline: 1rem;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, #b70016 0%, #990011 62%, #c50019 100%);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 800;
  box-shadow: 0 1.25rem 2.5rem rgb(153 0 17 / 0.18);
`;
const ButtonLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 0.55rem;
`;
const Message = styled.p`
  margin: 0;
  padding: 0.75rem 0.875rem;
  border: 1px solid
    ${({ $tone, theme }) =>
      $tone === "success" ? `${theme.colors.success}55` : `${theme.colors.danger}40`};
  border-radius: 1rem;
  background: ${({ $tone, theme }) =>
    $tone === "success" ? `${theme.colors.success}12` : `${theme.colors.danger}14`};
  color: ${({ $tone, theme }) =>
    $tone === "success" ? theme.colors.success : theme.colors.danger};
  font-size: 0.82rem;
  line-height: 1.35;
`;
const ReturnLink = styled(Link)`
  display: inline-flex;
  justify-self: center;
  align-items: center;
  gap: 0.4rem;
  color: #990011;
  font-size: 0.83rem;
  font-weight: 850;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

function errorMessage(error, fallback) {
  if (error instanceof HttpError) {
    return error.body?.error ?? fallback;
  }
  return "Could not reach the server. Please try again.";
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await requestPasswordReset({ email });
      const token = response?.token;
      if (!token) {
        setError("Password reset could not be started.");
        return;
      }
      router.push(`/reset-password?token=${encodeURIComponent(token)}`);
    } catch (submitError) {
      setError(
        errorMessage(
          submitError,
          "No active account found for this email.",
        ),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Root>
      <Header>
        <Eyebrow>Account recovery</Eyebrow>
        <Title>Find your account</Title>
        <Description>
          Enter your work email. If it matches an active SITA account, you can set a new password.
        </Description>
      </Header>
      <Form onSubmit={handleSubmit}>
        <Field>
          <Label htmlFor="recovery-email">Work email</Label>
          <Control>
            <ControlIcon>
              <Mail aria-hidden="true" strokeWidth={1.9} />
            </ControlIcon>
            <RecoveryInput
              autoComplete="email"
              id="recovery-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@sitashelters-example.com"
              required
              type="email"
              value={email}
            />
          </Control>
        </Field>
        {error ? <Message role="alert">{error}</Message> : null}
        <SubmitButton disabled={pending} type="submit">
          <ButtonLabel>
            <Mail aria-hidden="true" size={15} />
            {pending ? "Checking email..." : "Verify email"}
          </ButtonLabel>
          <ArrowRight aria-hidden="true" size={16} />
        </SubmitButton>
      </Form>
      <ReturnLink href="/login">
        <ArrowLeft aria-hidden="true" size={15} />
        Return to sign in
      </ReturnLink>
    </Root>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!token) {
      setError("Start from forgot password so we can verify your email first.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    try {
      await resetPassword({ token, password });
      setSuccess(true);
      window.setTimeout(() => router.push("/login"), 1200);
    } catch (submitError) {
      setError(
        errorMessage(
          submitError,
          "Password reset could not be completed.",
        ),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Root>
      <Header>
        <Eyebrow>Account security</Eyebrow>
        <Title>Choose a new password</Title>
        <Description>
          Use at least 12 characters with letters and numbers.
        </Description>
      </Header>
      <Form onSubmit={handleSubmit}>
        <Field>
          <Label htmlFor="new-password">New password</Label>
          <Control>
            <ControlIcon>
              <LockKeyhole aria-hidden="true" strokeWidth={1.9} />
            </ControlIcon>
            <RecoveryInput
              autoComplete="new-password"
              id="new-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter new password"
              required
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
        <Field>
          <Label htmlFor="confirm-new-password">Confirm password</Label>
          <Control>
            <ControlIcon>
              <LockKeyhole aria-hidden="true" strokeWidth={1.9} />
            </ControlIcon>
            <RecoveryInput
              autoComplete="new-password"
              id="confirm-new-password"
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter new password"
              required
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
            />
          </Control>
        </Field>
        {error ? <Message role="alert">{error}</Message> : null}
        {success ? (
          <Message $tone="success" role="status">
            <CheckCircle2 aria-hidden="true" size={15} /> Password updated. Returning to sign in...
          </Message>
        ) : null}
        <SubmitButton disabled={pending || success} type="submit">
          <ButtonLabel>
            <LockKeyhole aria-hidden="true" size={15} />
            {pending ? "Updating password..." : "Update password"}
          </ButtonLabel>
          <ArrowRight aria-hidden="true" size={16} />
        </SubmitButton>
      </Form>
      <ReturnLink href="/forgot-password">
        <ArrowLeft aria-hidden="true" size={15} />
        Verify a different email
      </ReturnLink>
    </Root>
  );
}

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
    justify-items: start;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }
`;
const Header = styled.div`
  margin-bottom: 1.75rem;
  @media (max-width: 1023px) {
    width: min(100%, 20rem);
    justify-self: start;
    margin-bottom: clamp(0.7rem, 1.8vh, 1.15rem);
  }
  @media (max-width: 520px) {
    width: 68%;
    min-width: 13.5rem;
  }
  @media (max-width: 430px) {
    width: 66%;
    min-width: 11rem;
    margin-bottom: 0.65rem;
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
    font-size: clamp(0.42rem, 1.45vw, 0.58rem);
    font-weight: 900;
    letter-spacing: 0.16em;
  }
  @media (max-width: 430px) {
    font-size: 0.46rem;
    letter-spacing: 0.16em;
  }
`;
const Title = styled.h2`
  margin: 0.75rem 0 0;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 650;
  letter-spacing: -0.045em;
  line-height: 1.08;
  @media (max-width: 1023px) {
    margin-top: clamp(0.35rem, 1vh, 0.55rem);
    color: #080d13;
    font-size: clamp(1.35rem, 5.8vw, 2.1rem);
    font-weight: 850;
    letter-spacing: 0;
    line-height: 0.98;
  }
  @media (max-width: 520px) {
    font-size: clamp(2rem, 11vw, 2.65rem);
  }
  @media (max-width: 360px) {
    font-size: clamp(1.65rem, 10vw, 2rem);
    line-height: 1;
  }
  @media (max-width: 430px) {
    font-size: clamp(1.42rem, 7.4vw, 1.72rem);
    line-height: 1;
    white-space: normal;
  }
`;
const Description = styled.p`
  margin: 0.5rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  @media (max-width: 1023px) {
    margin-top: clamp(0.25rem, 0.9vh, 0.45rem);
    color: #777f87;
    font-size: clamp(0.62rem, 2.2vw, 0.82rem);
    line-height: 1.25;
  }
  @media (max-width: 360px) {
    font-size: 0.82rem;
    white-space: normal;
  }
  @media (max-width: 430px) {
    font-size: 0.68rem;
    line-height: 1.2;
  }
`;
const Form = styled.form`
  display: grid;
  gap: 1.25rem;
  @media (max-width: 1023px) {
    width: min(100%, 20rem);

    justify-self: start;
    gap: clamp(0.55rem, 1.5vh, 0.85rem);
  }
  @media (max-width: 520px) {
    width: 68%;
    min-width: 13.5rem;
  }
  @media (max-width: 430px) {
    width: 66%;
    min-width: 11rem;
    gap: 0.48rem;
  }
`;
const Field = styled.div`
  display: grid;
  gap: 0.5rem;
  @media (max-width: 1023px) {
    gap: clamp(0.25rem, 0.8vh, 0.4rem);
  }
  label {
    @media (max-width: 1023px) {
      color: #111820;
      font-size: clamp(0.44rem, 1.55vw, 0.58rem);
      font-weight: 800;
    }
    @media (max-width: 360px) {
      font-size: 0.46rem;
    }
    @media (max-width: 430px) {
      font-size: 0.46rem;
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
    left: clamp(0.75rem, 2.6vw, 1rem);
    svg {
      width: clamp(0.85rem, 2.7vw, 1.1rem);
      height: clamp(0.85rem, 2.7vw, 1.1rem);
    }
  }
  @media (max-width: 430px) {
    left: 0.85rem;
    svg {
      width: 1rem;
      height: 1rem;
    }
  }
`;
const LoginInput = styled(Input)`
  padding-left: 3rem;
  @media (max-width: 1023px) {
    height: clamp(2.1rem, 5.6vh, 2.7rem);
    padding-right: clamp(2.35rem, 7vw, 3rem);
    padding-left: clamp(2.55rem, 7.8vw, 3.25rem);
    border-color: #d5d5d7;
    border-radius: 1rem;
    background: #fffdfc;
    color: #111820;
    font-size: clamp(0.62rem, 2.3vw, 0.82rem);
    box-shadow: 0 1px 0 rgb(0 0 0 / 0.03);
    &::placeholder {
      color: #7f8790;
    }
  }
  @media (max-width: 520px) {
    height: clamp(2.6rem, 7.2vh, 3.1rem);
    padding-left: 3rem;
    font-size: 0.9rem;
  }
  @media (max-width: 360px) {
    height: clamp(2.35rem, 6.8vh, 2.8rem);
    padding-right: 2.75rem;
    padding-left: 2.7rem;
    border-radius: 0.8rem;
    font-size: 0.78rem;
  }
  @media (max-width: 430px) {
    height: 2.55rem;
    padding-right: 2.4rem;
    padding-left: 2.45rem;
    border-radius: 0.78rem;
    font-size: 0.68rem;
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
    right: clamp(0.45rem, 1.8vw, 0.7rem);
    width: clamp(1.55rem, 4.6vw, 1.9rem);
    height: clamp(1.55rem, 4.6vw, 1.9rem);
    svg {
      width: clamp(0.85rem, 2.8vw, 1.1rem);
      height: clamp(0.85rem, 2.8vw, 1.1rem);
    }
  }
  @media (max-width: 430px) {
    right: 0.45rem;
    width: 1.9rem;
    height: 1.9rem;
    svg {
      width: 1rem;
      height: 1rem;
    }
  }
`;
const SubmitButton = styled(Button)`
  width: 100%;
  height: 2.5rem;
  justify-content: space-between;
  @media (max-width: 1023px) {
    height: clamp(2.2rem, 5.8vh, 2.85rem);
    margin-top: clamp(0.05rem, 0.5vh, 0.2rem);
    padding-inline: clamp(0.75rem, 3vw, 1.05rem);
    border-radius: 1rem;
    background: linear-gradient(135deg, #b70016 0%, #990011 62%, #c50019 100%);
    color: #ffffff;
    font-size: clamp(0.66rem, 2.2vw, 0.86rem);
    font-weight: 800;
    box-shadow: 0 1.25rem 2.5rem rgb(153 0 17 / 0.18);
    svg {
      width: clamp(0.85rem, 2.8vw, 1.1rem);
      height: clamp(0.85rem, 2.8vw, 1.1rem);
    }
  }
  @media (max-width: 520px) {
    height: clamp(2.9rem, 7.4vh, 3.35rem);
    padding-inline: 1rem;
    font-size: 0.78rem;
  }
  @media (max-width: 360px) {
    height: clamp(2.65rem, 7vh, 3rem);
    border-radius: 0.8rem;
    font-size: 0.72rem;
  }
  @media (max-width: 430px) {
    height: 2.8rem;
    padding-inline: 0.8rem;
    border-radius: 0.78rem;
    font-size: 0.72rem;
  }
`;
const ButtonLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  @media (max-width: 1023px) {
    gap: clamp(0.55rem, 2.4vw, 0.9rem);
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
    width: min(100%, 20rem);
    justify-self: start;
    gap: clamp(0.65rem, 2.8vw, 1rem);
    margin-top: clamp(0.45rem, 1.2vh, 0.7rem);
    padding: clamp(0.45rem, 1.35vh, 0.7rem) clamp(0.65rem, 2.2vw, 0.9rem);
    border-color: #dfe5eb;
    border-radius: 1rem;
    background: #f9fafc;
    color: #101820;
    font-size: clamp(0.4rem, 1.42vw, 0.52rem);
    box-shadow: 0 0.75rem 2rem rgb(17 24 39 / 0.04);
    svg {
      width: clamp(0.85rem, 2.7vw, 1.05rem);
      height: clamp(0.85rem, 2.7vw, 1.05rem);
      margin-top: 0.1rem;
      color: #406a8f;
    }
  }
  @media (max-width: 520px) {
    padding: 0.7rem 0.85rem;
    font-size: 0.48rem;
  }
  @media (max-width: 520px) {
    width: 68%;
    min-width: 13.5rem;
  }
  @media (max-width: 360px) {
    width: 66%;
    min-width: 11rem;
    gap: 0.5rem;
    margin-top: 0.55rem;
    padding: 0.55rem 0.65rem;
    border-radius: 0.8rem;
    font-size: 0.44rem;
    svg {
      width: 1rem;
      height: 1rem;
    }
  }
  @media (max-width: 430px) {
    width: 66%;
    min-width: 11rem;
    gap: 0.5rem;
    margin-top: 0.55rem;
    padding: 0.55rem 0.65rem;
    border-radius: 0.78rem;
    font-size: 0.44rem;
    svg {
      width: 1rem;
      height: 1rem;
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

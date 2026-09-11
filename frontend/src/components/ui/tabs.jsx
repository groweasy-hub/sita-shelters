"use client";

import { forwardRef } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import styled from "styled-components";

import { focusRing } from "./internal-styles";

export const Tabs = TabsPrimitive.Root;

const StyledList = styled(TabsPrimitive.List)`
  display: inline-flex;
  width: fit-content;
  min-height: 2.25rem;
  align-items: center;
  gap: 0.125rem;
  padding: 0.125rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.muted};
`;

export const TabsList = forwardRef(function TabsList(props, ref) {
  return <StyledList ref={ref} data-slot="tabs-list" {...props} />;
});

const StyledTrigger = styled(TabsPrimitive.Trigger)`
  ${focusRing}
  display: inline-flex;
  min-height: 2rem;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0 0.75rem;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radii.sm};
  outline: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.875rem;
  font-weight: 600;
  &[data-state="active"] {
    border-color: ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.foreground};
  }
`;

export const TabsTrigger = forwardRef(function TabsTrigger(props, ref) {
  return <StyledTrigger ref={ref} data-slot="tabs-trigger" {...props} />;
});

const StyledContent = styled(TabsPrimitive.Content)`
  ${focusRing}
  margin-top: 1rem;
  outline: none;
`;

export const TabsContent = forwardRef(function TabsContent(props, ref) {
  return <StyledContent ref={ref} data-slot="tabs-content" {...props} />;
});

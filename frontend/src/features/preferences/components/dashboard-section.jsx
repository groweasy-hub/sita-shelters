"use client";

import styled from "styled-components";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ALL_PROJECTS_VALUE, PROJECT_OPTIONS } from "@/config/constants";
import { usePreferencesStore } from "@/stores/preferences-store";
import { DASHBOARD_WIDGETS, DATE_RANGE_OPTIONS } from "../constants/preferences.constants";

const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.card};
`;
const Header = styled.header`
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
const FieldRow = styled.div`
  display: grid;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;
const FieldLabel = styled.p`
  margin: 0 0 0.5rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.6875rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;
const WidgetRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;
const WidgetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.84375rem;
  font-weight: 600;
`;
const WidgetIcon = styled.span`
  display: flex;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  color: ${({ theme }) => theme.colors.mutedForeground};
  svg {
    width: 0.9375rem;
    height: 0.9375rem;
  }
`;

export function DashboardSection() {
  const dashboard = usePreferencesStore((state) => state.dashboard);
  const setDefaultProjectId = usePreferencesStore((state) => state.setDefaultProjectId);
  const setDefaultDateRange = usePreferencesStore((state) => state.setDefaultDateRange);
  const toggleWidgetVisibility = usePreferencesStore(
    (state) => state.toggleWidgetVisibility,
  );

  return (
    <>
      <Panel>
        <Header>
          <Title>Default View</Title>
          <Description>What the dashboard opens to when you sign in.</Description>
        </Header>
        <FieldRow>
          <div>
            <FieldLabel>Default Project</FieldLabel>
            <Select
              onValueChange={(value) =>
                setDefaultProjectId(value === ALL_PROJECTS_VALUE ? null : value)
              }
              value={dashboard.defaultProjectId ?? ALL_PROJECTS_VALUE}
            >
              <SelectTrigger style={{ width: "100%" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_PROJECTS_VALUE}>All Projects</SelectItem>
                {PROJECT_OPTIONS.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <FieldLabel>Default Date Range</FieldLabel>
            <Select onValueChange={setDefaultDateRange} value={dashboard.defaultDateRange}>
              <SelectTrigger style={{ width: "100%" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FieldRow>
      </Panel>

      <Panel style={{ marginTop: "1.5rem" }}>
        <Header>
          <Title>Dashboard Widgets</Title>
          <Description>Choose what appears on your dashboard home.</Description>
        </Header>
        {DASHBOARD_WIDGETS.map((widget) => (
          <WidgetRow key={widget.id}>
            <WidgetInfo>
              <WidgetIcon>
                <widget.icon aria-hidden="true" />
              </WidgetIcon>
              {widget.label}
            </WidgetInfo>
            <Switch
              checked={dashboard.widgetVisibility[widget.id]}
              onCheckedChange={() => toggleWidgetVisibility(widget.id)}
            />
          </WidgetRow>
        ))}
      </Panel>
    </>
  );
}

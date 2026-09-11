"use client";

import { Contrast, Globe2, LayoutGrid, Palette, BellRing } from "lucide-react";
import styled from "styled-components";

const sectionIcons = {
  appearance: Palette,
  notifications: BellRing,
  dashboard: LayoutGrid,
  regional: Globe2,
  accessibility: Contrast,
};

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;
const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  height: 2.375rem;
  padding: 0 0.75rem;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ $active, theme }) => ($active ? theme.colors.surfaceMuted : "transparent")};
  color: ${({ $active, theme }) => ($active ? theme.colors.foreground : theme.colors.mutedForeground)};
  font: inherit;
  font-size: 0.84375rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

export function SettingsNav({ activeSection, onSectionChange, sections }) {
  return (
    <Nav aria-label="Preference sections">
      {sections.map((section) => {
        const Icon = sectionIcons[section.id];
        return (
          <NavButton
            $active={activeSection === section.id}
            aria-current={activeSection === section.id ? "page" : undefined}
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            type="button"
          >
            <Icon aria-hidden="true" />
            {section.label}
          </NavButton>
        );
      })}
    </Nav>
  );
}

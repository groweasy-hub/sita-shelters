"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import styled from "styled-components";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getNavigationSections } from "@/config/navigation";
import { useCurrentUser } from "@/features/profile";
import { useUiStore } from "@/stores/ui-store";

function buildSearchableRoutes(navigationSections) {
  return navigationSections.flatMap((section) =>
    section.items.flatMap((item) => [
      { title: item.title, href: item.href, section: section.title },
      ...(item.items?.map((child) => ({
        title: child.title,
        href: child.href,
        section: item.title,
      })) ?? []),
    ]),
  );
}
const Content = styled(DialogContent)`
  top: 18%;
  max-width: 36rem;
  gap: 0;
  padding: 0;
  transform: translate(-50%, 0);
`;
const HiddenHeader = styled(DialogHeader)`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;
const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.mutedForeground};
`;
const SearchField = styled(Input)`
  height: 3.25rem;
  padding-inline: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  &:focus-visible {
    outline: none;
    box-shadow: none;
  }
`;
const Shortcut = styled.kbd`
  display: none;
  padding: 0.125rem 0.375rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xs};
  background: ${({ theme }) => theme.colors.muted};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.62rem;
  @media (min-width: 640px) {
    display: block;
  }
`;
const Results = styled.div`
  max-height: 22rem;
  padding: 0.5rem;
  overflow-y: auto;
`;
const ResultsLabel = styled.p`
  margin: 0;
  padding: 0.5rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.65rem;
  font-weight: 650;
  letter-spacing: 0.09em;
  text-transform: uppercase;
`;
const ResultList = styled.div`
  display: grid;
  gap: 0.125rem;
`;
const ResultButton = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.foreground};
  text-align: left;
  cursor: pointer;
  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.accent};
    outline: none;
  }
  &:hover > svg {
    opacity: 1;
  }
  > svg {
    color: ${({ theme }) => theme.colors.mutedForeground};
    opacity: 0;
  }
`;
const ResultIcon = styled.span`
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.muted};
  color: ${({ theme }) => theme.colors.mutedForeground};
`;
const ResultCopy = styled.span`
  min-width: 0;
  flex: 1;
`;
const ResultTitle = styled.span`
  display: block;
  overflow: hidden;
  font-size: 0.875rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const ResultSection = styled.span`
  display: block;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const Empty = styled.p`
  margin: 0;
  padding: 2.5rem 0.75rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.875rem;
  text-align: center;
`;
const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.66rem;
`;

export function CommandMenu() {
  const router = useRouter();
  const open = useUiStore((state) => state.commandPaletteOpen);
  const setOpen = useUiStore((state) => state.setCommandPaletteOpen);
  const [query, setQuery] = useState("");
  const user = useCurrentUser();
  const searchableRoutes = useMemo(
    () =>
      user
        ? buildSearchableRoutes(getNavigationSections({ roles: [user.role] }))
        : [],
    [user],
  );
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);
  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value
      ? searchableRoutes.filter((route) =>
          `${route.title} ${route.section}`.toLowerCase().includes(value),
        )
      : searchableRoutes.slice(0, 8);
  }, [query, searchableRoutes]);
  const navigate = (href) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <Content>
        <HiddenHeader>
          <DialogTitle>Global command and search</DialogTitle>
          <DialogDescription>
            Search for a Sita Shelters module and navigate to it.
          </DialogDescription>
        </HiddenHeader>
        <SearchRow>
          <Search aria-hidden="true" size={18} />
          <SearchField
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search modules, workflows and reports…"
            value={query}
          />
          <Shortcut>ESC</Shortcut>
        </SearchRow>
        <Results>
          <ResultsLabel>
            {query ? "Search results" : "Quick navigation"}
          </ResultsLabel>
          {results.length ? (
            <ResultList>
              {results.map((route) => (
                <ResultButton
                  key={`${route.section}-${route.href}`}
                  onClick={() => navigate(route.href)}
                  type="button"
                >
                  <ResultIcon>
                    <Search aria-hidden="true" size={14} />
                  </ResultIcon>
                  <ResultCopy>
                    <ResultTitle>{route.title}</ResultTitle>
                    <ResultSection>{route.section}</ResultSection>
                  </ResultCopy>
                  <ArrowRight aria-hidden="true" size={15} />
                </ResultButton>
              ))}
            </ResultList>
          ) : (
            <Empty>No matching modules.</Empty>
          )}
        </Results>
        <Footer>
          <span>Type to filter</span>
          <span>↵ Open</span>
        </Footer>
      </Content>
    </Dialog>
  );
}

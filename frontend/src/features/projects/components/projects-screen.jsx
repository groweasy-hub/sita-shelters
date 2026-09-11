"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CircleCheck,
  CircleAlert,
  ClipboardList,
  MapPin,
  ShoppingCart,
} from "lucide-react";
import styled from "styled-components";

import {
  FilterBar,
  KpiCard,
  KpiGrid,
  PageHeader,
  StatusBadge,
} from "@/components/shared";
import { SearchInput } from "@/components/shared/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/feedback/empty-state";
import {
  formatCompactNumber,
  formatCurrency,
  formatDate,
} from "@/lib/formatters";
import { getUserName } from "@/lib/mock-data/users";
import { PROJECT_STATUS_OPTIONS } from "../constants/projects.constants";
import { useProjects } from "../hooks/use-projects";
import { AddProjectDialog } from "./add-project-dialog";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const Grid = styled.div`
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr));
`;
const CreatedNotice = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.success}40;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.success}0d;
  color: ${({ theme }) => theme.colors.success};
  font-size: 0.875rem;
  font-weight: 600;
`;
const NoticeCopy = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  svg {
    width: 1rem;
    height: 1rem;
  }
`;
const NoticeLink = styled(Link)`
  color: inherit;
  font-size: 0.8125rem;
  text-underline-offset: 0.2em;
`;
const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  color: inherit;
  text-decoration: none;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.subtle};
  }
`;
const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1.25rem 1.25rem 1rem;
`;
const CardIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
`;
const SiteIcon = styled.span`
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.muted};
`;
const CardTitle = styled.h3`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 650;
`;
const CardMeta = styled.p`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0.2rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  svg {
    width: 0.75rem;
    height: 0.75rem;
  }
`;
const ProjectMeta = styled(CardMeta)`
  margin-top: 0.5rem;
`;
const ProgressWrap = styled.div`
  padding: 0 1.25rem 1rem;
`;
const ProgressLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  span:first-child {
    color: ${({ theme }) => theme.colors.mutedForeground};
  }
  span:last-child {
    font-weight: 600;
  }
`;
const Track = styled.div`
  height: 0.375rem;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.muted};
`;
const Fill = styled.div`
  width: ${({ $progress }) => $progress}%;
  height: 100%;
  border-radius: inherit;
  background: ${({ theme, $status }) =>
    $status === "completed" ? theme.colors.info : theme.colors.success};
`;
const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  margin-top: auto;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.border};
`;
const Stat = styled.div`
  padding: 0.75rem 1.25rem;
  background: ${({ theme }) => theme.colors.card};
`;
const StatLabel = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.68rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;
const StatValue = styled.p`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0.25rem 0 0;
  font-size: 0.9375rem;
  font-weight: 650;
  svg {
    width: 0.8125rem;
    height: 0.8125rem;
    color: ${({ theme }) => theme.colors.warning};
  }
`;

export function ProjectsScreen() {
  const { data: projects = [] } = useProjects();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [createdProject, setCreatedProject] = useState(null);
  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const matchesStatus = status === "all" || project.status === status;
      const haystack = [
        project.name,
        project.code,
        project.location,
        project.address.line1,
        project.address.line2,
        project.address.landmark,
        project.address.city,
        project.address.state,
        project.address.postalCode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      return matchesStatus && haystack.includes(search.toLocaleLowerCase());
    });
  }, [projects, search, status]);
  const kpis = useMemo(() => {
    const totalValue = projects.reduce((sum, p) => sum + p.inventoryValue, 0);
    const active = projects.filter((p) => p.status === "active").length;
    const pendingIndents = projects.reduce(
      (sum, p) => sum + p.activeIndents,
      0,
    );
    const lowStock = projects.reduce((sum, p) => sum + p.lowStockAlerts, 0);
    return { totalValue, active, pendingIndents, lowStock };
  }, [projects]);
  return (
    <Root>
      <PageHeader
        actions={
          <AddProjectDialog
            onCreated={(project) => {
              setSearch("");
              setStatus("all");
              setCreatedProject(project);
            }}
          />
        }
        description="The portfolio directory for every SITA Shelters construction project."
        eyebrow="Portfolio"
        title="Projects"
      />
      {createdProject ? (
        <CreatedNotice role="status">
          <NoticeCopy>
            <CircleCheck aria-hidden="true" />
            {createdProject.name} was added to the portfolio.
          </NoticeCopy>
          <NoticeLink href={`/projects/${createdProject.id}`}>
            View project details
          </NoticeLink>
        </CreatedNotice>
      ) : null}
      <KpiGrid>
        <KpiCard icon={Building2} label="Active projects" value={kpis.active} />
        <KpiCard
          icon={ShoppingCart}
          label="Total inventory value"
          value={formatCurrency(kpis.totalValue, { maximumFractionDigits: 0 })}
        />
        <KpiCard
          icon={ClipboardList}
          label="Active indents"
          value={formatCompactNumber(kpis.pendingIndents)}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Low stock alerts"
          tone="warning"
          value={formatCompactNumber(kpis.lowStock)}
        />
      </KpiGrid>
      <FilterBar
        leading={
          <SearchInput
            aria-label="Search projects"
            onValueChange={setSearch}
            placeholder="Search project, code or location"
            value={search}
          />
        }
        onClear={() => {
          setSearch("");
          setStatus("all");
        }}
      >
        <Select onValueChange={setStatus} value={status}>
          <SelectTrigger aria-label="Filter by status" size="sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PROJECT_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>
      {filtered.length ? (
        <Grid>
          {filtered.map((project) => (
            <Card href={`/projects/${project.id}`} key={project.id}>
              <CardHeader>
                <CardIdentity>
                  <SiteIcon>
                    <Building2 aria-hidden="true" size={18} strokeWidth={1.7} />
                  </SiteIcon>
                  <div>
                    <CardTitle>{project.name}</CardTitle>
                    <CardMeta>
                      <MapPin aria-hidden="true" />
                      {project.location} · {project.code}
                    </CardMeta>
                  </div>
                </CardIdentity>
                <StatusBadge status={project.status} />
              </CardHeader>
              <ProgressWrap>
                <ProgressLabel>
                  <span>Completion</span>
                  <span>{project.progressPercent}%</span>
                </ProgressLabel>
                <Track>
                  <Fill
                    $progress={project.progressPercent}
                    $status={project.status}
                  />
                </Track>
                <ProjectMeta>
                  PM: {getUserName(project.projectManagerId)} · Due{" "}
                  {formatDate(project.estimatedCompletionDate)}
                </ProjectMeta>
              </ProgressWrap>
              <StatRow>
                <Stat>
                  <StatLabel>Inventory value</StatLabel>
                  <StatValue>
                    {formatCurrency(project.inventoryValue, {
                      maximumFractionDigits: 0,
                    })}
                  </StatValue>
                </Stat>
                <Stat>
                  <StatLabel>Active indents</StatLabel>
                  <StatValue>{project.activeIndents}</StatValue>
                </Stat>
                <Stat>
                  <StatLabel>Pending procurement</StatLabel>
                  <StatValue>{project.pendingProcurement}</StatValue>
                </Stat>
                <Stat>
                  <StatLabel>Low stock</StatLabel>
                  <StatValue>
                    {project.lowStockAlerts > 0 ? (
                      <CircleAlert aria-hidden="true" />
                    ) : null}
                    {project.lowStockAlerts}
                  </StatValue>
                </Stat>
              </StatRow>
            </Card>
          ))}
        </Grid>
      ) : (
        <EmptyState
          description="Try changing or clearing the active filters."
          title="No matching projects"
        />
      )}
    </Root>
  );
}

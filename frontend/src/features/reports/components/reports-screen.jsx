"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import styled from "styled-components";

import { PageHeader } from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ALL_PROJECTS_VALUE, PROJECT_OPTIONS } from "@/config/constants";
import { ConsumptionReportTab } from "./consumption-report-tab";
import { DamageReportTab } from "./damage-report-tab";
import { InventoryReportTab } from "./inventory-report-tab";
import { ProcurementReportTab } from "./procurement-report-tab";
import { TransferReportTab } from "./transfer-report-tab";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
`;
const FilterLabel = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export function ReportsScreen() {
  const searchParams = useSearchParams();
  const initialProject = searchParams.get("project");
  const [projectFilter, setProjectFilter] = useState(
    initialProject ?? ALL_PROJECTS_VALUE,
  );
  const projectId = projectFilter === ALL_PROJECTS_VALUE ? null : projectFilter;
  return (
    <Root>
      <PageHeader
        description="The Decision support layer for every module's operational data. Filter by project — every report below responds to it."
        eyebrow="Insights &amp; control"
        title="Reports &amp; Analytics"
      />
      <FilterRow>
        <FilterLabel>Project</FilterLabel>
        <Select onValueChange={setProjectFilter} value={projectFilter}>
          <SelectTrigger aria-label="Filter reports by project" size="sm">
            <SelectValue placeholder="All projects" />
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
      </FilterRow>
      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
          <TabsTrigger value="procurement">Procurement</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="damage">Damage &amp; wastage</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory">
          <InventoryReportTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="consumption">
          <ConsumptionReportTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="procurement">
          <ProcurementReportTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="transfers">
          <TransferReportTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="damage">
          <DamageReportTab projectId={projectId} />
        </TabsContent>
      </Tabs>
    </Root>
  );
}

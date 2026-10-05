"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes, Warehouse } from "lucide-react";
import styled from "styled-components";

import {
  DataTable,
  KpiCard,
  KpiGrid,
  PageHeader,
  ProjectFilterSelect,
} from "@/components/shared";
import { useProjectScope } from "@/features/profile";
import { formatCompactNumber, formatCurrency } from "@/lib/formatters";
import { useSiteStockRegister } from "../hooks/use-inventory-ledger";
import { siteStockRegisterColumns } from "./site-stock-register-columns";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;

function registerValue(rows) {
  return rows.reduce((total, row) => total + (row.stockValue ?? 0), 0);
}

export function SiteStockRegisterScreen() {
  const router = useRouter();
  const { scopeProjectIds, isLocked, defaultProjectId } = useProjectScope();
  const [projectId, setProjectId] = useState(defaultProjectId ?? null);
  const { data: rows = [] } = useSiteStockRegister(projectId);

  return (
    <Root>
      <PageHeader
        description="Every item remains traceable from indent to approved stock: opening balance, inward, issued and transfer movements roll forward into the current position."
        eyebrow="Site Stock & Procurement Visibility"
        title="Site Stock Register"
      />
      <KpiGrid>
        <KpiCard
          icon={Warehouse}
          label="Total stock value"
          value={formatCurrency(registerValue(rows), {
            maximumFractionDigits: 0,
          })}
        />
        <KpiCard
          icon={Boxes}
          label="Items tracked"
          value={formatCompactNumber(rows.length)}
        />
      </KpiGrid>
      <DataTable
        ariaLabel="Site stock register"
        columns={siteStockRegisterColumns}
        data={rows}
        filters={
          <ProjectFilterSelect
            isLocked={isLocked}
            onChange={setProjectId}
            scopeProjectIds={scopeProjectIds}
            value={projectId}
          />
        }
        initialState={{ sorting: [{ id: "materialName", desc: false }] }}
        onResetFilters={() => setProjectId(defaultProjectId ?? null)}
        onRowClick={(row) => {
          if (row.materialId) router.push(`/materials/${row.materialId}`);
        }}
        search={{ placeholder: "Search item or code" }}
      />
    </Root>
  );
}

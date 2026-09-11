"use client";

import { useMemo } from "react";
import styled from "styled-components";

import { DataTable, PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { inProjectScope, useProjectScope } from "@/features/profile";
import { formatCompactNumber } from "@/lib/formatters";
import { inventoryLedgerColumns } from "./inventory-ledger-columns";
import { useInventoryLedger } from "../hooks/use-inventory-ledger";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;

export function InventoryLedgerScreen() {
  const { scopeProjectIds } = useProjectScope();
  const { data: rawData = [] } = useInventoryLedger();
  const data = useMemo(
    () => rawData.filter((entry) => inProjectScope(scopeProjectIds, entry.projectId)),
    [rawData, scopeProjectIds],
  );
  return (
    <Root>
      <PageHeader
        description="A chronological movement trail across goods inward, issues, consumption, returns, transfers and damage write-offs."
        eyebrow="Stock control"
        meta={
          <Badge variant="outline">
            {formatCompactNumber(data.length)} entries
          </Badge>
        }
        title="Stock Ledger"
      />
      <DataTable
        ariaLabel="Stock ledger"
        columns={inventoryLedgerColumns}
        data={data}
        initialState={{ sorting: [{ id: "date", desc: true }] }}
        search={{ placeholder: "Search reference, material or project" }}
      />
    </Root>
  );
}

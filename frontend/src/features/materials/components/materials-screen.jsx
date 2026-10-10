"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Boxes, IndianRupee, Layers, PackageSearch } from "lucide-react";
import styled from "styled-components";

import { DataTable, KpiCard, KpiGrid, PageHeader } from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/config/permissions";
import { useCurrentUser } from "@/features/profile";
import { formatCompactNumber, formatCurrency } from "@/lib/formatters";
import { MATERIAL_CATEGORY_OPTIONS } from "@/lib/mock-data/material-categories";
import { AddMaterialDialog } from "./add-material-dialog";
import { materialsColumns } from "./materials-columns";
import { MaterialIntelligencePanel } from "./material-intelligence-panel";
import { useMaterials } from "../hooks/use-materials";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export function MaterialsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useCurrentUser();
  const canManageMaterials = Boolean(
    currentUser && hasPermission(currentUser.role, "materials:manage"),
  );
  const [category, setCategory] = useState(searchParams.get("category"));
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([{ id: "name", desc: false }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const params = {
    category,
    search,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id ?? "name",
    sortDirection: sorting[0]?.desc ? "desc" : "asc",
  };
  const { data } = useMaterials(params);
  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const kpis = useMemo(() => {
    const totalValue = items.reduce(
      (sum, item) => sum + item.lastPurchasePrice * item.reorderLevel,
      0,
    );
    return {
      totalValue,
      categoryCount: MATERIAL_CATEGORY_OPTIONS.length,
    };
  }, [items]);
  const showAllMaterials = () => {
    setCategory(null);
    setSearch("");
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };
  return (
    <Root>
      <PageHeader
        actions={
          <HeaderActions>
            {canManageMaterials ? <AddMaterialDialog /> : null}
            <Button
              onClick={() => router.push("/materials/categories")}
              variant="outline"
            >
              <Layers aria-hidden="true" />
              View categories
            </Button>
          </HeaderActions>
        }
        description="The single source of truth for every material referenced by indents, procurement, inventory and consumption."
        eyebrow="Material master"
        title="Materials"
      />
      <KpiGrid>
        <KpiCard
          icon={PackageSearch}
          label="Catalogue size"
          onClick={showAllMaterials}
          value={formatCompactNumber(total)}
        />
        <KpiCard
          href="/materials/categories"
          icon={Layers}
          label="Categories"
          value={kpis.categoryCount}
        />
        <KpiCard
          icon={IndianRupee}
          label="Reorder-level valuation (page)"
          onClick={showAllMaterials}
          value={formatCurrency(kpis.totalValue, { maximumFractionDigits: 0 })}
        />
        <KpiCard
          icon={Boxes}
          label="Active SKUs"
          onClick={showAllMaterials}
          value={formatCompactNumber(total)}
        />
      </KpiGrid>
      <MaterialIntelligencePanel />
      <DataTable
        ariaLabel="Materials"
        columns={materialsColumns}
        data={items}
        filters={
          <Select
            onValueChange={(value) =>
              setCategory(value === "all" ? null : value)
            }
            value={category ?? "all"}
          >
            <SelectTrigger aria-label="Filter by category" size="sm">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {MATERIAL_CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        manualFiltering
        manualPagination
        manualSorting
        onPaginationChange={setPagination}
        onResetFilters={() => {
          setCategory(null);
          setSearch("");
        }}
        onRowClick={(row) => router.push(`/materials/${row.id}`)}
        onSearchChange={setSearch}
        onSortingChange={setSorting}
        pageCount={Math.max(1, Math.ceil(total / pagination.pageSize))}
        rowCount={total}
        search={{ placeholder: "Search material name or code" }}
        state={{ pagination, sorting }}
      />
    </Root>
  );
}

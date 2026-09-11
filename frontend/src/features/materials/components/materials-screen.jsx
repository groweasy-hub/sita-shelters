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
import { formatCompactNumber, formatCurrency } from "@/lib/formatters";
import { MATERIAL_CATEGORY_OPTIONS } from "@/lib/mock-data/material-categories";
import { materialsColumns } from "./materials-columns";
import { MaterialIntelligencePanel } from "./material-intelligence-panel";
import { useMaterials } from "../hooks/use-materials";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;

export function MaterialsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  return (
    <Root>
      <PageHeader
        actions={
          <Button
            onClick={() => router.push("/materials/categories")}
            variant="outline"
          >
            <Layers aria-hidden="true" />
            View categories
          </Button>
        }
        description="The single source of truth for every material referenced by indents, procurement, inventory and consumption."
        eyebrow="Material master"
        title="Materials"
      />
      <KpiGrid>
        <KpiCard
          icon={PackageSearch}
          label="Catalogue size"
          value={formatCompactNumber(total)}
        />
        <KpiCard icon={Layers} label="Categories" value={kpis.categoryCount} />
        <KpiCard
          icon={IndianRupee}
          label="Reorder-level valuation (page)"
          value={formatCurrency(kpis.totalValue, { maximumFractionDigits: 0 })}
        />
        <KpiCard
          icon={Boxes}
          label="Active SKUs"
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

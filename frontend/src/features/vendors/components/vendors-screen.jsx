"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ShieldCheck, Star, Users } from "lucide-react";
import styled from "styled-components";

import { DataTable, KpiCard, KpiGrid, PageHeader } from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCompactNumber, formatPercent } from "@/lib/formatters";
import { MATERIAL_CATEGORY_OPTIONS } from "@/lib/mock-data/material-categories";
import { vendorsColumns } from "./vendors-columns";
import { useVendors } from "../hooks/use-vendors";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;

export function VendorsScreen() {
  const router = useRouter();
  const [category, setCategory] = useState(null);
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
  const { data } = useVendors(params);
  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const kpis = useMemo(() => {
    const avgRating =
      items.reduce((sum, item) => sum + item.rating, 0) /
      Math.max(items.length, 1);
    const avgDelivery =
      items.reduce((sum, item) => sum + item.deliveryPerformance, 0) /
      Math.max(items.length, 1);
    const active = items.filter((item) => item.status === "active").length;
    return { avgRating, avgDelivery, active };
  }, [items]);
  return (
    <Root>
      <PageHeader
        description="Every supplier and vendor SITA Shelters procures from, with delivery, quality and pricing performance."
        eyebrow="Partners"
        title="Vendors"
      />
      <KpiGrid>
        <KpiCard
          icon={Users}
          label="Vendors on page"
          value={formatCompactNumber(total)}
        />
        <KpiCard icon={Building2} label="Active vendors" value={kpis.active} />
        <KpiCard
          icon={Star}
          label="Average rating"
          value={kpis.avgRating.toFixed(1)}
        />
        <KpiCard
          icon={ShieldCheck}
          label="Average delivery performance"
          value={formatPercent(kpis.avgDelivery)}
        />
      </KpiGrid>
      <DataTable
        ariaLabel="Vendors"
        columns={vendorsColumns}
        data={items}
        filters={
          <Select
            onValueChange={(value) =>
              setCategory(value === "all" ? null : value)
            }
            value={category ?? "all"}
          >
            <SelectTrigger aria-label="Filter by material category" size="sm">
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
        onRowClick={(row) => router.push(`/vendors/${row.id}`)}
        onSearchChange={setSearch}
        onSortingChange={setSorting}
        pageCount={Math.max(1, Math.ceil(total / pagination.pageSize))}
        rowCount={total}
        search={{ placeholder: "Search vendor name or code" }}
        state={{ pagination, sorting }}
      />
    </Root>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IndianRupee,
  PackageCheck,
  ShoppingBag,
  TriangleAlert,
} from "lucide-react";
import styled from "styled-components";

import { DataTable, KpiCard, KpiGrid, PageHeader } from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_PROJECTS_VALUE, PROJECT_OPTIONS } from "@/config/constants";
import { formatCompactNumber, formatCurrency } from "@/lib/formatters";
import { VENDORS } from "@/lib/mock-data/vendors";
import { PURCHASE_ORDER_STATUS_OPTIONS } from "../constants/procurement.constants";
import {
  useAllPurchaseOrders,
  usePurchaseOrders,
} from "../hooks/use-purchase-orders";
import { calculatePurchaseOrderValue } from "../lib/purchase-order-metrics";
import { purchaseOrderColumns } from "./purchase-order-columns";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;

export function PurchaseOrdersScreen() {
  const router = useRouter();
  const [status, setStatus] = useState(null);
  const [vendorId, setVendorId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([{ id: "createdAt", desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const params = {
    status,
    vendorId,
    projectId,
    search,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id ?? "createdAt",
    sortDirection: sorting[0]?.desc ? "desc" : "asc",
  };
  const { data } = usePurchaseOrders(params);
  const { data: allOrders = [] } = useAllPurchaseOrders();
  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const kpis = useMemo(() => {
    const activeStatuses = new Set(["sent", "partially-supplied", "approved"]);
    const activeOrders = allOrders.filter((order) =>
      activeStatuses.has(order.status),
    );
    return {
      total: allOrders.length,
      active: activeOrders.length,
      partiallySupplied: allOrders.filter(
        (order) => order.status === "partially-supplied",
      ).length,
      activeValue: activeOrders.reduce(
        (sum, order) => sum + calculatePurchaseOrderValue(order),
        0,
      ),
    };
  }, [allOrders]);
  return (
    <Root>
      <PageHeader
        description="Vendor purchase orders raised from selected quotations or directly by procurement, with delivery progress against schedule."
        eyebrow="Procurement"
        title="Purchase Orders"
      />
      <KpiGrid>
        <KpiCard
          icon={ShoppingBag}
          label="Total purchase orders"
          value={formatCompactNumber(kpis.total)}
        />
        <KpiCard
          icon={PackageCheck}
          label="Active orders"
          tone="info"
          value={kpis.active}
        />
        <KpiCard
          icon={TriangleAlert}
          label="Partially supplied"
          tone="warning"
          value={kpis.partiallySupplied}
        />
        <KpiCard
          icon={IndianRupee}
          label="Active order value"
          value={formatCurrency(kpis.activeValue, { maximumFractionDigits: 0 })}
        />
      </KpiGrid>
      <DataTable
        ariaLabel="Purchase orders"
        columns={purchaseOrderColumns}
        data={items}
        filters={
          <>
            <Select
              onValueChange={(value) =>
                setProjectId(value === ALL_PROJECTS_VALUE ? null : value)
              }
              value={projectId ?? ALL_PROJECTS_VALUE}
            >
              <SelectTrigger aria-label="Filter by project" size="sm">
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
            <Select
              onValueChange={(value) =>
                setVendorId(value === "all" ? null : value)
              }
              value={vendorId ?? "all"}
            >
              <SelectTrigger aria-label="Filter by vendor" size="sm">
                <SelectValue placeholder="All vendors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All vendors</SelectItem>
                {VENDORS.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) =>
                setStatus(value === "all" ? null : value)
              }
              value={status ?? "all"}
            >
              <SelectTrigger aria-label="Filter by status" size="sm">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {PURCHASE_ORDER_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
        manualFiltering
        manualPagination
        manualSorting
        onPaginationChange={setPagination}
        onResetFilters={() => {
          setStatus(null);
          setVendorId(null);
          setProjectId(null);
          setSearch("");
        }}
        onRowClick={(row) =>
          router.push(`/procurement/purchase-orders/${row.id}`)
        }
        onSearchChange={setSearch}
        onSortingChange={setSorting}
        pageCount={Math.max(1, Math.ceil(total / pagination.pageSize))}
        rowCount={total}
        search={{ placeholder: "Search PO, vendor or material" }}
        state={{ pagination, sorting }}
      />
    </Root>
  );
}

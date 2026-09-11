"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, CircleCheck, Hourglass, Route } from "lucide-react";
import styled from "styled-components";

import { DataTable, KpiCard, KpiGrid, PageHeader } from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_OPTIONS } from "@/config/constants";
import { inProjectScope, useProjectScope } from "@/features/profile";
import { formatCompactNumber } from "@/lib/formatters";
import { TRANSFER_STATUS_OPTIONS } from "../constants/stock-transfers.constants";
import { useStockTransfers } from "../hooks/use-stock-transfers";
import { NewTransferDialog } from "./new-transfer-dialog";
import { stockTransfersColumns } from "./stock-transfers-columns";

const Root = styled.div`
  display: grid;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1.5rem;
`;

export function StockTransfersScreen() {
  const router = useRouter();
  const { scopeProjectIds } = useProjectScope();
  const [status, setStatus] = useState("");
  const [sourceProjectId, setSourceProjectId] = useState(null);
  const [destinationProjectId, setDestinationProjectId] = useState(null);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([{ id: "requestedAt", desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const params = {
    status: status || null,
    sourceProjectId,
    destinationProjectId,
    search,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id ?? "requestedAt",
    sortDirection: sorting[0]?.desc ? "desc" : "asc",
  };
  const { data } = useStockTransfers(params);
  const projectOptions = scopeProjectIds
    ? PROJECT_OPTIONS.filter((project) => scopeProjectIds.includes(project.id))
    : PROJECT_OPTIONS;
  const items = useMemo(() => {
    const pageItems = data?.items ?? [];
    // A project-scoped role sees transfers touching either side of their
    // site — the underlying filter is source AND destination, so scope is
    // enforced here instead of by forcing either single field.
    return scopeProjectIds
      ? pageItems.filter(
          (item) =>
            inProjectScope(scopeProjectIds, item.sourceProjectId) ||
            inProjectScope(scopeProjectIds, item.destinationProjectId),
        )
      : pageItems;
  }, [data, scopeProjectIds]);
  const total = data?.total ?? 0;
  const kpis = useMemo(() => {
    const inTransit = items.filter(
      (item) => item.status === "in-transit",
    ).length;
    const pendingApproval = items.filter(
      (item) => item.status === "draft" || item.status === "requested",
    ).length;
    const received = items.filter((item) => item.status === "received").length;
    return { inTransit, pendingApproval, received };
  }, [items]);
  return (
    <Root>
      <PageHeader
        actions={<NewTransferDialog />}
        description="Move material between SITA Shelters projects when one site has surplus and another is short, instead of raising a fresh purchase."
        eyebrow="Inter-project movement"
        title="Stock transfers"
      />
      <KpiGrid>
        <KpiCard
          icon={ArrowLeftRight}
          label="Transfers on page"
          value={formatCompactNumber(total)}
        />
        <KpiCard
          icon={Route}
          label="In transit"
          tone="info"
          value={kpis.inTransit}
        />
        <KpiCard
          icon={Hourglass}
          label="Pending approval"
          tone="warning"
          value={kpis.pendingApproval}
        />
        <KpiCard
          icon={CircleCheck}
          label="Received (page)"
          tone="success"
          value={kpis.received}
        />
      </KpiGrid>
      <DataTable
        ariaLabel="Stock transfers"
        columns={stockTransfersColumns}
        data={items}
        filters={
          <>
            <Select
              onValueChange={(value) => setStatus(value === "all" ? "" : value)}
              value={status || "all"}
            >
              <SelectTrigger aria-label="Filter by status" size="sm">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {TRANSFER_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) =>
                setSourceProjectId(value === "all" ? null : value)
              }
              value={sourceProjectId ?? "all"}
            >
              <SelectTrigger aria-label="Filter by source project" size="sm">
                <SelectValue placeholder="Any source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any source</SelectItem>
                {projectOptions.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) =>
                setDestinationProjectId(value === "all" ? null : value)
              }
              value={destinationProjectId ?? "all"}
            >
              <SelectTrigger
                aria-label="Filter by destination project"
                size="sm"
              >
                <SelectValue placeholder="Any destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any destination</SelectItem>
                {projectOptions.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
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
          setStatus("");
          setSourceProjectId(null);
          setDestinationProjectId(null);
          setSearch("");
        }}
        onRowClick={(row) => router.push(`/stock-transfers/${row.id}`)}
        onSearchChange={setSearch}
        onSortingChange={setSorting}
        pageCount={Math.max(1, Math.ceil(total / pagination.pageSize))}
        rowCount={total}
        search={{
          placeholder: "Search transfer #, project, material or vehicle",
        }}
        state={{ pagination, sorting }}
      />
    </Root>
  );
}

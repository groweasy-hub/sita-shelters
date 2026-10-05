"use client";

import styled from "styled-components";

import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDateTime, formatQuantity } from "@/lib/formatters";
import { replacementProgress } from "@/lib/replacements";
import { RETURN_REASON_OPTIONS } from "../constants/returns.constants";

const columnHelper = createDataTableColumnHelper();
const Code = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;
  font-weight: 600;
`;
const Strong = styled.span`
  font-weight: 600;
`;
const Muted = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const Quantity = styled.span`
  font-variant-numeric: tabular-nums;
  font-weight: 650;
`;
const ReturnedAt = styled.time`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
`;
const Split = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
`;
const GoodValue = styled.span`
  color: ${({ theme }) => theme.colors.success};
  font-weight: 650;
`;
const DamagedValue = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 650;
`;
const SplitDivider = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
`;

/** Settlement of the damaged part: refund, replacement progress, or still open. */
export function ResolutionSummary({ resolution, unit, needsResolution }) {
  if (resolution) {
    if (resolution.type === "refund") {
      return (
        <div>
          <StatusBadge
            status={resolution.refund?.completed ? "refunded" : "refund-pending"}
          />
          <div>
            <Muted>
              {resolution.quantity > 0
                ? `${formatQuantity(resolution.quantity, unit)} · `
                : ""}
              {formatCurrency(resolution.amount)}
            </Muted>
          </div>
        </div>
      );
    }
    const awaitingApproval = (resolution.replacements ?? []).filter((receipt) =>
      receipt.stage?.startsWith("pending"),
    ).length;
    return (
      <div>
        <StatusBadge
          status={replacementProgress(resolution.replacedQuantity, resolution.quantity)}
        />
        <div>
          <Muted>
            {formatQuantity(resolution.replacedQuantity, unit)} of{" "}
            {formatQuantity(resolution.quantity, unit)} delivered
            {awaitingApproval > 0 ? ` · ${awaitingApproval} awaiting approval` : ""}
          </Muted>
        </div>
      </div>
    );
  }
  return needsResolution ? (
    <StatusBadge status="awaiting-resolution" />
  ) : (
    <Muted>—</Muted>
  );
}

const reasonLabels = Object.fromEntries(
  RETURN_REASON_OPTIONS.map((option) => [option.value, option.label]),
);

/** Business-specific columns stay within the returns feature boundary. */
export const returnsColumns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "Return #",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "Return #" },
  }),
  columnHelper.accessor("projectName", {
    header: "Project",
    meta: { label: "Project" },
  }),
  columnHelper.accessor("materialName", {
    header: "Material",
    cell: ({ getValue, row }) => (
      <div>
        <Strong>{getValue()}</Strong>
        <div>
          <Muted>{row.original.materialCode}</Muted>
        </div>
      </div>
    ),
    meta: { label: "Material" },
  }),
  columnHelper.accessor("returningQuantity", {
    header: "Returning qty",
    cell: ({ getValue, row }) => (
      <Quantity>{formatQuantity(getValue(), row.original.unit)}</Quantity>
    ),
    meta: { label: "Returning quantity", align: "end" },
  }),
  columnHelper.accessor("reason", {
    header: "Reason",
    cell: ({ getValue }) => reasonLabels[getValue()] ?? getValue(),
    meta: { label: "Reason" },
  }),
  columnHelper.accessor((row) => row.inspection.status, {
    id: "inspectionStatus",
    header: "Inspection status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { label: "Inspection status" },
  }),
  columnHelper.display({
    id: "goodDamagedSplit",
    header: "Good / damaged",
    cell: ({ row }) => {
      const { inspection, unit } = row.original;
      if (inspection.status === "pending-inspection") {
        return <Muted>Not inspected yet</Muted>;
      }
      return (
        <Split>
          <GoodValue>{formatQuantity(inspection.goodQuantity, unit)}</GoodValue>
          <SplitDivider>/</SplitDivider>
          <DamagedValue>
            {formatQuantity(inspection.damagedQuantity, unit)}
          </DamagedValue>
        </Split>
      );
    },
    meta: { label: "Good / damaged" },
  }),
  columnHelper.display({
    id: "resolution",
    header: "Replace / refund",
    cell: ({ row }) => (
      <ResolutionSummary
        needsResolution={row.original.inspection.status === "damaged"}
        resolution={row.original.resolution}
        unit={row.original.unit}
      />
    ),
    meta: { label: "Replace / refund" },
  }),
  columnHelper.accessor("returnedAt", {
    header: "Date",
    cell: ({ getValue }) => (
      <ReturnedAt dateTime={getValue()}>{formatDateTime(getValue())}</ReturnedAt>
    ),
    meta: { label: "Date" },
  }),
]);

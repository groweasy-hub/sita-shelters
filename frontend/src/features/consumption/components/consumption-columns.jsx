"use client";

import Link from "next/link";
import styled from "styled-components";

import { createDataTableColumnHelper } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime, formatQuantity } from "@/lib/formatters";

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
const RecordedAt = styled.time`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
`;

const IssueCell = styled.div`
  display: grid;
  min-width: 11rem;
  gap: 0.125rem;
`;
const ReturnLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

/** The issue a consumption entry draws on, with what came back (and was replaced) against it. */
function IssueLinks({ entry }) {
  const replaced = entry.returns.reduce(
    (total, record) => total + record.replacedQuantity,
    0,
  );
  return (
    <IssueCell>
      <Code>{entry.materialIssueId}</Code>
      {entry.returns.length === 0 ? (
        <Muted>No returns</Muted>
      ) : (
        <>
          <Muted>
            Returned {formatQuantity(entry.issue?.returnedQuantity ?? 0, entry.unit)}
            {replaced > 0
              ? ` · ${formatQuantity(replaced, entry.unit)} replaced`
              : ""}
          </Muted>
          <span>
            {entry.returns.map((record, index) => (
              <span key={record.id}>
                {index > 0 ? ", " : null}
                <ReturnLink href={`/returns/${encodeURIComponent(record.id)}`}>
                  {record.id}
                </ReturnLink>
              </span>
            ))}
          </span>
        </>
      )}
    </IssueCell>
  );
}

/** Business-specific columns stay within the consumption feature boundary. */
export const consumptionColumns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "Consumption #",
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
    meta: { label: "Consumption #" },
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
  columnHelper.accessor("quantityConsumed", {
    header: "Quantity",
    cell: ({ getValue, row }) => (
      <Quantity>{formatQuantity(getValue(), row.original.unit)}</Quantity>
    ),
    meta: { label: "Quantity", align: "end" },
  }),
  columnHelper.accessor("materialIssueId", {
    header: "Issue / returns",
    cell: ({ row }) => <IssueLinks entry={row.original} />,
    meta: { label: "Issue / returns" },
  }),
  columnHelper.accessor("activity", {
    header: "Activity",
    cell: ({ getValue, row }) => (
      <div>
        <Strong>{getValue()}</Strong>
        <div>
          <Muted>{row.original.location}</Muted>
        </div>
      </div>
    ),
    meta: { label: "Activity" },
  }),
  columnHelper.accessor("consumedAt", {
    header: "Date",
    cell: ({ getValue }) => (
      <RecordedAt dateTime={getValue()}>
        {formatDateTime(getValue())}
      </RecordedAt>
    ),
    meta: { label: "Date" },
  }),
  columnHelper.accessor((row) => row.issue?.status ?? "consumed", {
    id: "issueStatus",
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { label: "Status" },
  }),
  columnHelper.accessor("recordedByName", {
    header: "Marked by",
    meta: { label: "Marked by" },
  }),
]);

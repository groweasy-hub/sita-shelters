"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { FileSearch } from "lucide-react";
import styled from "styled-components";

import { PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getVendorById } from "@/lib/mock-data/vendors";
import { useAllPurchaseRequests } from "../hooks/use-purchase-requests";
import { useAllQuotations } from "../hooks/use-quotations";

const Root = styled.div`
  display: grid;
  max-width: 84rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const Panel = styled.section`
  border: 1px solid
    ${({ theme, $highlighted }) =>
      $highlighted ? theme.colors.primary : theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const PanelHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const PanelTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.875rem;
  font-weight: 650;
`;
const PanelMeta = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-weight: 500;
`;
const TableWrap = styled.div`
  overflow-x: auto;
`;
const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(
      0,
      1.1fr
    ) 7rem 5rem 6rem 6rem 8rem;
  gap: 1rem;
  align-items: center;
  min-width: 48rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8125rem;
  &:last-child {
    border-bottom: 0;
  }
  ${({ $selected, theme }) =>
    $selected ? `background: ${theme.colors.success}0d;` : ""}
`;
const RowHead = styled(Row)`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.7rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: ${({ theme }) => theme.colors.surfaceMuted};
`;
const Num = styled.span`
  text-align: right;
  font-variant-numeric: tabular-nums;
`;
const VendorName = styled.span`
  font-weight: 600;
`;

const qualityVariant = { low: "warning", medium: "info", high: "success" };

export function QuotationComparisonScreen() {
  const searchParams = useSearchParams();
  const highlightedRequestId = searchParams.get("purchaseRequestId");
  const { data: requests = [] } = useAllPurchaseRequests();
  const { data: quotations = [] } = useAllQuotations();
  const groups = useMemo(() => {
    const byRequest = new Map();
    quotations.forEach((quote) => {
      const bucket = byRequest.get(quote.purchaseRequestId) ?? [];
      bucket.push(quote);
      byRequest.set(quote.purchaseRequestId, bucket);
    });
    return Array.from(byRequest.entries())
      .map(([purchaseRequestId, quotes]) => ({
        purchaseRequestId,
        request: requests.find((record) => record.id === purchaseRequestId),
        quotes,
      }))
      .filter((group) => group.request)
      .sort((first, second) =>
        first.purchaseRequestId.localeCompare(second.purchaseRequestId),
      );
  }, [quotations, requests]);

  return (
    <Root>
      <PageHeader
        description="Vendor RFQ responses compared side by side per purchase request. The selected vendor is highlighted before a purchase order is raised."
        eyebrow="Procurement"
        title="Quotations & Comparison"
      />
      {groups.length === 0 ? (
        <EmptyState
          description="No purchase request currently has vendor quotations recorded."
          icon={<FileSearch aria-hidden="true" strokeWidth={1.75} />}
          title="No quotations yet"
        />
      ) : (
        groups.map((group) => (
          <Panel
            $highlighted={group.purchaseRequestId === highlightedRequestId}
            id={group.purchaseRequestId}
            key={group.purchaseRequestId}
          >
            <PanelHeader>
              <PanelTitle>
                <Badge variant="outline">{group.purchaseRequestId}</Badge>
                {group.request.projectName}
              </PanelTitle>
              <PanelMeta>
                Required by {formatDate(group.request.requiredDeliveryDate)}
              </PanelMeta>
            </PanelHeader>
            <TableWrap>
              <RowHead>
                <span>Vendor</span>
                <span>Material</span>
                <Num>Unit price</Num>
                <Num>Tax</Num>
                <Num>Delivery</Num>
                <span>Quality</span>
                <span>Status</span>
              </RowHead>
              {group.quotes.map((quote) => {
                const vendor = getVendorById(quote.vendorId);
                const material = group.request.materials.find(
                  (entry) => entry.materialCode === quote.materialCode,
                );
                return (
                  <Row $selected={quote.status === "selected"} key={quote.id}>
                    <VendorName>{vendor?.name ?? quote.vendorId}</VendorName>
                    <span>{material?.materialName ?? quote.materialCode}</span>
                    <Num>{formatCurrency(quote.unitPrice)}</Num>
                    <Num>{quote.taxPercent}%</Num>
                    <Num>{quote.deliveryDays}d</Num>
                    <span>
                      <Badge variant={qualityVariant[quote.qualityRating]}>
                        {quote.qualityRating}
                      </Badge>
                    </span>
                    <span>
                      <Badge
                        variant={
                          quote.status === "selected" ? "success" : "muted"
                        }
                      >
                        {quote.status}
                      </Badge>
                    </span>
                  </Row>
                );
              })}
            </TableWrap>
          </Panel>
        ))
      )}
    </Root>
  );
}

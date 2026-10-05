"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, FileSearch, Plus, Trophy } from "lucide-react";
import styled from "styled-components";

import { PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { hasPermission } from "@/config/permissions";
import { useCurrentUser } from "@/features/profile";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getMaterialByCode } from "@/lib/mock-data/materials";
import {
  useAllQuotations,
  useDeselectQuotationLine,
  useSelectQuotationLine,
} from "../hooks/use-quotations";
import { useAllPurchaseOrders } from "../hooks/use-purchase-orders";
import { useAllPurchaseRequests } from "../hooks/use-purchase-requests";
import {
  compareQuotationLines,
  isQuotationExpired,
} from "../lib/quotation-metrics";
import { SupplierSelectionSummary } from "./supplier-selection-summary";
import { useVendorLookup } from "@/features/vendors";

const Root = styled.div`
  display: grid;
  max-width: 84rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const RequestPanel = styled.section`
  display: grid;
  gap: 1.25rem;
  border: 1px solid
    ${({ theme, $highlighted }) =>
      $highlighted ? theme.colors.primary : theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  padding: 1.25rem;
`;
const RequestHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;
const RequestTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.875rem;
  font-weight: 650;
`;
const RequestMeta = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  font-weight: 500;
`;
const ItemPanel = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
`;
const ItemHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  font-size: 0.84375rem;
  font-weight: 650;
`;
const SupplierGrid = styled.div`
  display: grid;
  gap: 1px;
  background: ${({ theme }) => theme.colors.border};
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
`;
const SupplierCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 1rem;
  background: ${({ theme, $selected }) =>
    $selected ? `${theme.colors.success}0d` : theme.colors.card};
`;
const SupplierName = styled.div`
  font-size: 0.875rem;
  font-weight: 650;
`;
const SupplierMeta = styled.div`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.6875rem;
`;
const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
`;
const DefinitionGrid = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem 0.75rem;
  margin: 0;
  font-size: 0.75rem;
  dt {
    color: ${({ theme }) => theme.colors.mutedForeground};
  }
  dd {
    margin: 0;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
`;
function SupplierBadges({ badges, quoteId }) {
  return (
    <BadgeRow>
      {badges.recommendedId === quoteId ? (
        <Badge variant="success">
          <Trophy aria-hidden="true" strokeWidth={1.75} />
          Recommended
        </Badge>
      ) : null}
      {badges.lowestRateId === quoteId ? (
        <Badge variant="outline">Lowest rate</Badge>
      ) : null}
      {badges.bestMoqId === quoteId ? (
        <Badge variant="outline">Best MOQ</Badge>
      ) : null}
      {badges.fastestId === quoteId ? (
        <Badge variant="outline">Fastest delivery</Badge>
      ) : null}
    </BadgeRow>
  );
}

function quoteStatusLabel(quote, expired) {
  if (expired) return "Expired";
  if (quote.status === "rejected") return "Rejected";
  return "Valid Quote";
}

function ItemComparisonPanel({ canSelect, materialCode, quotes }) {
  const { getVendor } = useVendorLookup();
  const selectMutation = useSelectQuotationLine();
  const deselectMutation = useDeselectQuotationLine();
  const material = getMaterialByCode(materialCode);
  const badges = compareQuotationLines(quotes);
  return (
    <ItemPanel>
      <ItemHeader>
        <span>{material?.name ?? materialCode}</span>
        <RequestMeta>
          {quotes.length} quotation{quotes.length === 1 ? "" : "s"}
        </RequestMeta>
      </ItemHeader>
      <SupplierGrid>
        {quotes.map((quote) => {
          const vendor = getVendor(quote.vendorId);
          const expired = isQuotationExpired(quote);
          const selected = quote.status === "selected";
          return (
            <SupplierCard $selected={selected} key={quote.id}>
              <div>
                <SupplierName>{vendor?.name ?? quote.vendorId}</SupplierName>
                <SupplierMeta>
                  {quote.quotationNumber} · {formatDate(quote.quotationDate)}
                </SupplierMeta>
              </div>
              <BadgeRow>
                <Badge
                  variant={
                    selected
                      ? "success"
                      : quote.status === "rejected"
                        ? "muted"
                        : "outline"
                  }
                >
                  {quoteStatusLabel(quote, expired)}
                </Badge>
              </BadgeRow>
              <SupplierBadges badges={badges} quoteId={quote.id} />
              <DefinitionGrid>
                <dt>Rate</dt>
                <dd>
                  {formatCurrency(quote.unitPrice)}
                  {quote.taxIncluded ? " (incl. tax)" : ""}
                </dd>
                <dt>Minimum Order Quantity</dt>
                <dd>{quote.moq > 0 ? quote.moq : "—"}</dd>
              </DefinitionGrid>
              {canSelect && selected ? (
                <Button
                  disabled={deselectMutation.isPending}
                  onClick={() => deselectMutation.mutate(quote.id)}
                  size="sm"
                  variant="outline"
                >
                  <CheckCircle2 aria-hidden="true" strokeWidth={1.75} />
                  Selected — undo
                </Button>
              ) : null}
              {canSelect && !selected ? (
                <Button
                  disabled={
                    selectMutation.isPending || quote.status === "rejected"
                  }
                  onClick={() => selectMutation.mutate(quote.id)}
                  size="sm"
                >
                  Select this supplier
                </Button>
              ) : null}
            </SupplierCard>
          );
        })}
      </SupplierGrid>
    </ItemPanel>
  );
}

export function QuotationComparisonScreen() {
  const searchParams = useSearchParams();
  const highlightedRequestId = searchParams.get("purchaseRequestId");
  const currentUser = useCurrentUser();
  const canSelect = Boolean(
    currentUser && hasPermission(currentUser.role, "procurement:approve"),
  );
  const canManage = Boolean(
    currentUser && hasPermission(currentUser.role, "procurement:manage"),
  );
  const { data: requests = [] } = useAllPurchaseRequests();
  const { data: quotations = [] } = useAllQuotations();
  const { data: purchaseOrders = [] } = useAllPurchaseOrders();
  const groups = useMemo(() => {
    const byRequest = new Map();
    quotations.forEach((quote) => {
      const bucket = byRequest.get(quote.purchaseRequestId) ?? [];
      bucket.push(quote);
      byRequest.set(quote.purchaseRequestId, bucket);
    });
    return Array.from(byRequest.entries())
      .map(([purchaseRequestId, quotes]) => {
        const request = requests.find(
          (record) => record.id === purchaseRequestId,
        );
        const byMaterial = new Map();
        quotes.forEach((quote) => {
          const bucket = byMaterial.get(quote.materialCode) ?? [];
          bucket.push(quote);
          byMaterial.set(quote.materialCode, bucket);
        });
        return {
          purchaseRequestId,
          request,
          quotes,
          items: Array.from(byMaterial.entries()).map(
            ([materialCode, materialQuotes]) => ({
              materialCode,
              quotes: materialQuotes,
            }),
          ),
        };
      })
      .filter((group) => group.request)
      .sort((first, second) =>
        highlightedRequestId === first.purchaseRequestId
          ? -1
          : highlightedRequestId === second.purchaseRequestId
            ? 1
            : first.purchaseRequestId.localeCompare(second.purchaseRequestId),
      );
  }, [highlightedRequestId, quotations, requests]);

  return (
    <Root>
      <PageHeader
        description={
          canSelect
            ? "Item-wise vendor rates, side by side. Select a supplier per item — different items on the same request can go to different suppliers."
            : "Item-wise vendor rates, side by side, as recorded by the project team. Selecting the winning supplier and placing the order is HO Procurement's step."
        }
        eyebrow="Procurement"
        title="Item-Wise Quotation Comparison"
      />
      {groups.length === 0 ? (
        <EmptyState
          action={
            <Button asChild variant="outline">
              <Link href="/procurement/quotations/new">
                <Plus aria-hidden="true" strokeWidth={1.75} />
                Record a quotation
              </Link>
            </Button>
          }
          description="No purchase request currently has vendor quotations recorded."
          icon={<FileSearch aria-hidden="true" strokeWidth={1.75} />}
          title="No quotations yet"
        />
      ) : (
        groups.map((group) => (
          <RequestPanel
            $highlighted={group.purchaseRequestId === highlightedRequestId}
            id={group.purchaseRequestId}
            key={group.purchaseRequestId}
          >
            <RequestHeader>
              <RequestTitle>
                <Badge variant="outline">{group.purchaseRequestId}</Badge>
                {group.request.projectName}
              </RequestTitle>
              <div>
                <RequestMeta>
                  Required by {formatDate(group.request.requiredDeliveryDate)}
                </RequestMeta>
                {canManage ? (
                  <Button asChild size="sm" variant="ghost">
                    <Link
                      href={`/procurement/quotations/new?purchaseRequestId=${group.purchaseRequestId}`}
                    >
                      <Plus aria-hidden="true" strokeWidth={1.75} />
                      Add quotation
                    </Link>
                  </Button>
                ) : null}
              </div>
            </RequestHeader>
            {group.items.map((item) => (
              <ItemComparisonPanel
                canSelect={canSelect}
                key={item.materialCode}
                materialCode={item.materialCode}
                quotes={item.quotes}
              />
            ))}
            <SupplierSelectionSummary
              canCreatePo={canSelect}
              materials={group.request.materials}
              purchaseOrders={purchaseOrders}
              purchaseRequestId={group.purchaseRequestId}
              quotes={group.quotes}
            />
          </RequestPanel>
        ))
      )}
    </Root>
  );
}

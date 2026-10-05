"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { AlertTriangle, ArrowLeft, Trash2 } from "lucide-react";
import styled from "styled-components";

import { AccessDeniedState, ConfirmationDialog, PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { hasPermission, ROLE_LABELS } from "@/config/permissions";
import { useAllMaterials } from "@/features/materials";
import { useCurrentUser } from "@/features/profile";
import { formatCurrency } from "@/lib/formatters";
import { getMaterialByCode } from "@/lib/mock-data/materials";
import { useAllPurchaseRequests } from "../hooks/use-purchase-requests";
import {
  useAllPurchaseOrders,
  useCreatePurchaseOrder,
} from "../hooks/use-purchase-orders";
import { useAllQuotations } from "../hooks/use-quotations";
import { calculateNetRate, isQuotationExpired } from "../lib/quotation-metrics";
import { purchaseOrderInputSchema } from "../schemas/procurement.schema";
import { useVendorLookup } from "@/features/vendors";

const Root = styled.div`
  display: grid;
  max-width: 60rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const BackLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border: none;
  background: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
  }
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`;
const Form = styled.form`
  display: grid;
  gap: 1.5rem;
`;
const Panel = styled.section`
  display: grid;
  gap: 1.25rem;
  padding: 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const PanelTitle = styled.h2`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 650;
`;
const DefinitionGrid = styled.dl`
  display: grid;
  gap: 1rem;
  margin: 0;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  dt {
    color: ${({ theme }) => theme.colors.mutedForeground};
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  dd {
    margin: 0.25rem 0 0;
    font-size: 0.9375rem;
    font-weight: 600;
  }
`;
const LineCard = styled.div`
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceMuted}55;
`;
const LineGrid = styled.div`
  display: grid;
  gap: 0.75rem;
  align-items: end;
  grid-template-columns: minmax(0, 1.6fr) repeat(3, minmax(0, 1fr)) auto;
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;
const Field = styled.div`
  display: grid;
  gap: 0.375rem;
  min-width: 0;
`;
const MaterialLabel = styled.div`
  display: flex;
  height: 2.25rem;
  align-items: center;
  padding: 0 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.muted};
  font-size: 0.875rem;
  font-weight: 600;
`;
const TotalsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem 0.75rem;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  &:last-child {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    margin-top: 0.25rem;
    padding-top: 0.75rem;
    font-size: 1rem;
    font-weight: 650;
  }
`;
const WarningBanner = styled.div`
  display: flex;
  gap: 0.625rem;
  padding: 0.875rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.warning}55;
  background: ${({ theme }) => theme.colors.warning}12;
  color: ${({ theme }) => theme.colors.warning};
  font-size: 0.8125rem;
  svg {
    flex: 0 0 auto;
    width: 1rem;
    height: 1rem;
    margin-top: 0.125rem;
  }
`;
const WarningList = styled.ul`
  margin: 0.5rem 0 0;
  padding-left: 1.1rem;
`;
const SubmitError = styled.div`
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.danger}40;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.danger}0d;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.875rem;
`;
const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

function roundToTwo(value) {
  return Math.round(value * 100) / 100;
}

export function PurchaseOrderCreateScreen() {
  const { getVendor, isPending: vendorsPending } = useVendorLookup();
  const router = useRouter();
  const searchParams = useSearchParams();
  const purchaseRequestId = searchParams.get("purchaseRequestId");
  const vendorId = searchParams.get("vendorId");
  const currentUser = useCurrentUser();
  const { data: requests = [] } = useAllPurchaseRequests();
  const { data: quotations = [] } = useAllQuotations();
  const { data: allOrders = [] } = useAllPurchaseOrders();
  const createPurchaseOrder = useCreatePurchaseOrder();
  const [submitError, setSubmitError] = useState(null);
  // Live catalogue first: items added through Raise Indent aren't in the built-in list.
  const { data: liveMaterials, isPending: materialsPending } = useAllMaterials();

  const request = requests.find((record) => record.id === purchaseRequestId);
  const vendor = getVendor(vendorId);
  const selectedLines = quotations.filter(
    (quote) =>
      quote.purchaseRequestId === purchaseRequestId &&
      quote.vendorId === vendorId &&
      quote.status === "selected",
  );

  const defaultItems = useMemo(
    () =>
      selectedLines.map((quote) => {
        const material =
          liveMaterials?.find((entry) => entry.code === quote.materialCode) ??
          getMaterialByCode(quote.materialCode);
        const requirement = request?.materials.find(
          (entry) => entry.materialCode === quote.materialCode,
        );
        const discountedRate = roundToTwo(calculateNetRate(quote));
        return {
          quotationLineId: quote.id,
          materialCode: quote.materialCode,
          materialName: material?.name ?? quote.materialCode,
          unit: material?.unit ?? "",
          orderedQuantity: String(requirement?.requiredQuantity ?? 1),
          unitPrice: String(discountedRate),
          taxPercent: String(quote.taxPercent),
        };
      }),
    // Re-derived when the request/quotation data arrives (a reload or direct
    // link starts with an empty cache).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [purchaseRequestId, vendorId, quotations, requests, liveMaterials],
  );

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm({
    defaultValues: {
      sourceIndentId: request?.sourceIndentId ?? null,
      vendorId: vendorId ?? "",
      projectId: request?.projectId ?? "",
      termsNote: "",
      items: defaultItems,
    },
    resolver: zodResolver(purchaseOrderInputSchema),
  });
  // Fill the form exactly once, as soon as the selected quotation lines are
  // known — never again, so it can't overwrite what the user has edited.
  const formFilledRef = useRef(false);
  useEffect(() => {
    if (formFilledRef.current || materialsPending || !request || defaultItems.length === 0) {
      return;
    }
    formFilledRef.current = true;
    reset({
      sourceIndentId: request.sourceIndentId ?? null,
      vendorId: vendorId ?? "",
      projectId: request.projectId ?? "",
      termsNote: "",
      items: defaultItems,
    });
  }, [request, defaultItems, vendorId, reset, materialsPending]);
  const { fields, remove } = useFieldArray({ control, name: "items" });
  const watchedItemsRaw = useWatch({ control, name: "items" });
  const watchedItems = useMemo(() => watchedItemsRaw ?? [], [watchedItemsRaw]);

  const totals = useMemo(() => {
    return watchedItems.reduce(
      (acc, item) => {
        const qty = Number(item.orderedQuantity) || 0;
        const rate = Number(item.unitPrice) || 0;
        const tax = Number(item.taxPercent) || 0;
        const subtotal = qty * rate;
        const taxAmount = subtotal * (tax / 100);
        acc.subtotal += subtotal;
        acc.tax += taxAmount;
        acc.grandTotal += subtotal + taxAmount;
        return acc;
      },
      { subtotal: 0, tax: 0, grandTotal: 0 },
    );
  }, [watchedItems]);

  const warnings = useMemo(() => {
    const list = [];
    watchedItems.forEach((item) => {
      const quote = selectedLines.find(
        (line) => line.id === item.quotationLineId,
      );
      const requirement = request?.materials.find(
        (entry) => entry.materialCode === item.materialCode,
      );
      const qty = Number(item.orderedQuantity) || 0;
      const rate = Number(item.unitPrice) || 0;
      if (quote && qty < quote.moq) {
        list.push(
          `${item.materialName}: quantity (${qty}) is below the quoted MOQ of ${quote.moq}.`,
        );
      }
      if (requirement && qty > requirement.requiredQuantity) {
        list.push(
          `${item.materialName}: quantity (${qty}) exceeds the indent requirement of ${requirement.requiredQuantity}.`,
        );
      }
      if (quote) {
        const quotedRate = roundToTwo(calculateNetRate(quote));
        if (rate !== quotedRate) {
          list.push(
            `${item.materialName}: rate (${formatCurrency(rate)}) differs from the quoted rate of ${formatCurrency(quotedRate)}.`,
          );
        }
        if (isQuotationExpired(quote)) {
          list.push(
            `${item.materialName}: the source quotation ${quote.quotationNumber} has expired.`,
          );
        }
      }
      const duplicate = allOrders.some(
        (order) =>
          order.sourceIndentId &&
          order.sourceIndentId === request?.sourceIndentId &&
          !["cancelled", "rejected"].includes(order.status) &&
          order.items.some((entry) => entry.materialCode === item.materialCode),
      );
      if (duplicate) {
        list.push(
          `${item.materialName}: another active PO already covers this material for indent ${request?.sourceIndentId}.`,
        );
      }
    });
    return list;
  }, [allOrders, request, selectedLines, watchedItems]);

  function onInvalid() {
    setSubmitError(
      "Some order details are missing or invalid — check the quantity, rate and tax on each item.",
    );
  }

  function onSubmit(values) {
    setSubmitError(null);
    createPurchaseOrder.mutate(
      {
        ...values,
        approver: currentUser.name,
        role: ROLE_LABELS[currentUser.role] ?? currentUser.role,
      },
      {
        onSuccess: (order) =>
          router.push(`/procurement/purchase-orders/${order.id}`),
        onError: (error) =>
          setSubmitError(
            error instanceof Error
              ? error.message
              : "The purchase order could not be created. Please try again.",
          ),
      },
    );
  }

  const canCreatePo = Boolean(
    currentUser && hasPermission(currentUser.role, "procurement:approve"),
  );
  if (!canCreatePo) {
    return (
      <AccessDeniedState
        pageName="Create Purchase Order"
        roleLabel={currentUser?.role ? ROLE_LABELS[currentUser.role] : undefined}
      />
    );
  }

  if ((vendorsPending && !vendor) || materialsPending) {
    return <LoadingState label="Loading purchase order" variant="page" />;
  }
  if (!request || !vendor || selectedLines.length === 0) {
    return (
      <EmptyState
        action={
          <Button
            onClick={() => router.push("/procurement/quotations/compare")}
            variant="outline"
          >
            Back to comparison
          </Button>
        }
        description="Select at least one supplier quotation line for this request before creating a purchase order."
        title="No PO-ready lines found"
      />
    );
  }

  return (
    <Root>
      <div>
        <BackLink onClick={() => router.back()} type="button">
          <ArrowLeft aria-hidden="true" />
          Back
        </BackLink>
      </div>
      <PageHeader
        description="Pre-filled from the selected quotation lines for this supplier. Quantities, rates and tax remain editable before the order is submitted for approval."
        eyebrow="Procurement"
        title={`Create PO — ${vendor.name}`}
      />
      <Form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <Panel>
          <PanelTitle>Order header</PanelTitle>
          <DefinitionGrid>
            <div>
              <dt>Supplier</dt>
              <dd>{vendor.name}</dd>
            </div>
            <div>
              <dt>Project</dt>
              <dd>{request.projectName}</dd>
            </div>
            <div>
              <dt>Reference indent</dt>
              <dd>{request.sourceIndentId ?? "—"}</dd>
            </div>
            <div>
              <dt>Purchase request</dt>
              <dd>{request.id}</dd>
            </div>
          </DefinitionGrid>
          <Field>
            <Label htmlFor="po-terms">Terms note</Label>
            <Textarea
              id="po-terms"
              placeholder="Payment terms, delivery terms, or other notes for this order"
              rows={2}
              {...register("termsNote")}
            />
          </Field>
        </Panel>
        <Panel>
          <PanelTitle>Order items</PanelTitle>
          {fields.map((field, index) => (
            <LineCard key={field.id}>
              <LineGrid>
                <Field>
                  <Label>Material</Label>
                  <MaterialLabel>{field.materialName}</MaterialLabel>
                </Field>
                <Field>
                  <Label htmlFor={`po-qty-${index}`}>
                    Quantity ({field.unit})
                  </Label>
                  <Input
                    aria-invalid={Boolean(
                      errors.items?.[index]?.orderedQuantity,
                    )}
                    id={`po-qty-${index}`}
                    min="0"
                    step="any"
                    type="number"
                    {...register(`items.${index}.orderedQuantity`)}
                  />
                </Field>
                <Field>
                  <Label htmlFor={`po-rate-${index}`}>Rate</Label>
                  <Input
                    aria-invalid={Boolean(errors.items?.[index]?.unitPrice)}
                    id={`po-rate-${index}`}
                    min="0"
                    step="any"
                    type="number"
                    {...register(`items.${index}.unitPrice`)}
                  />
                </Field>
                <Field>
                  <Label htmlFor={`po-tax-${index}`}>Tax %</Label>
                  <Input
                    aria-invalid={Boolean(errors.items?.[index]?.taxPercent)}
                    id={`po-tax-${index}`}
                    min="0"
                    step="any"
                    type="number"
                    {...register(`items.${index}.taxPercent`)}
                  />
                </Field>
                <Button
                  aria-label="Remove line"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </LineGrid>
            </LineCard>
          ))}
          <TotalsRow>
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </TotalsRow>
          <TotalsRow>
            <span>Tax</span>
            <span>{formatCurrency(totals.tax)}</span>
          </TotalsRow>
          <TotalsRow>
            <span>Grand total</span>
            <span>{formatCurrency(totals.grandTotal)}</span>
          </TotalsRow>
        </Panel>
        {warnings.length > 0 ? (
          <WarningBanner role="alert">
            <AlertTriangle aria-hidden="true" strokeWidth={1.75} />
            <div>
              This order has {warnings.length} warning
              {warnings.length === 1 ? "" : "s"} that need explicit confirmation
              before it can be submitted.
              <WarningList>
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </WarningList>
            </div>
          </WarningBanner>
        ) : null}
        {submitError ? <SubmitError role="alert">{submitError}</SubmitError> : null}
        <Actions>
          <Button onClick={() => router.back()} type="button" variant="outline">
            Cancel
          </Button>
          {warnings.length > 0 ? (
            <ConfirmationDialog
              confirmLabel="Create anyway"
              description="Review the warnings above. Creating this order will submit it for approval despite the flagged issues."
              destructive
              onConfirm={() => handleSubmit(onSubmit, onInvalid)()}
              pending={createPurchaseOrder.isPending}
              title="Create PO despite warnings?"
              trigger={<Button type="button">Review & Create PO</Button>}
            />
          ) : (
            <Button disabled={createPurchaseOrder.isPending} type="submit">
              Create Purchase Order
            </Button>
          )}
        </Actions>
      </Form>
    </Root>
  );
}

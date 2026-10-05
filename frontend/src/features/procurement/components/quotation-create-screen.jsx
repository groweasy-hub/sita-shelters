"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Paperclip, Plus } from "lucide-react";
import styled from "styled-components";

import { AccessDeniedState, ConfirmationDialog, PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { hasPermission, ROLE_LABELS } from "@/config/permissions";
import { useCurrentUser } from "@/features/profile";
import { formatCurrency } from "@/lib/formatters";
import {
  useAllVendors,
  useCreateVendor,
  VendorCapabilityPicker,
} from "@/features/vendors";
import { QUOTATION_QUALITY_VALUES } from "../constants/procurement.constants";
import { useAllPurchaseOrders } from "../hooks/use-purchase-orders";
import { useAllPurchaseRequests } from "../hooks/use-purchase-requests";
import { calculateEffectiveRate, calculateNetRate } from "../lib/quotation-metrics";
import { useCreateQuotation } from "../hooks/use-quotations";
import {
  quotationInputDefaults,
  quotationInputSchema,
} from "../schemas/procurement.schema";

const Root = styled.div`
  display: grid;
  max-width: 76rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const Form = styled.form`
  display: grid;
  gap: 1.5rem;
  /* Dropdowns default to fit-content; in a form they should fill their field. */
  [data-slot="select-trigger"] {
    width: 100%;
    min-width: 0;
  }
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
const FieldGrid = styled.div`
  display: grid;
  align-items: start;
  gap: 1.25rem 1rem;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
`;
const Field = styled.div`
  display: grid;
  align-content: start;
  gap: 0.375rem;
  min-width: 0;
`;
const FullWidthField = styled(Field)`
  grid-column: 1 / -1;
`;
const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.75rem;
`;
const Hint = styled.span`
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;
const SupplierRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  > *:first-child {
    flex: 1 1 0;
    min-width: 0;
  }
  > button {
    flex: 0 0 auto;
  }
`;
const DialogField = styled.div`
  display: grid;
  gap: 0.375rem;
  margin-top: 0.75rem;
  text-align: left;
`;

function AddVendorDialog({ onCreated }) {
  const createVendor = useCreateVendor();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [address, setAddress] = useState("");
  const [materialCategories, setMaterialCategories] = useState([]);
  const [serverError, setServerError] = useState(null);

  function reset() {
    setName("");
    setCode("");
    setType("");
    setGstNumber("");
    setAddress("");
    setMaterialCategories([]);
    setServerError(null);
  }

  return (
    <ConfirmationDialog
      confirmDisabled={!name.trim() || !type.trim() || !gstNumber.trim() || !address.trim()}
      confirmLabel="Add supplier"
      description="Register a new vendor so it can be selected for this — and future — quotations."
      errorMessage={serverError ?? "The supplier could not be added. Please try again."}
      onConfirm={async () => {
        setServerError(null);
        const vendor = await createVendor.mutateAsync({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          type: type.trim(),
          gstNumber: gstNumber.trim(),
          address: address.trim(),
          materialCategories,
        });
        onCreated(vendor.id);
      }}
      onConfirmError={(error) =>
        setServerError(error instanceof Error ? error.message : null)
      }
      onOpenChange={(open) => {
        if (!open) reset();
      }}
      pending={createVendor.isPending}
      title="Add a new supplier"
      trigger={
        <Button aria-label="Add new supplier" size="icon" type="button" variant="outline">
          <Plus aria-hidden="true" strokeWidth={1.75} />
        </Button>
      }
    >
      <DialogField>
        <Label htmlFor="new-vendor-name">Vendor name</Label>
        <Input id="new-vendor-name" onChange={(e) => setName(e.target.value)} value={name} />
      </DialogField>
      <DialogField>
        <Label htmlFor="new-vendor-code">Vendor code (optional)</Label>
        <Input
          id="new-vendor-code"
          onChange={(e) => setCode(e.target.value)}
          placeholder="Leave blank to auto-generate, e.g. VND-0012"
          value={code}
        />
      </DialogField>
      <DialogField>
        <Label htmlFor="new-vendor-type">Type</Label>
        <Input
          id="new-vendor-type"
          onChange={(e) => setType(e.target.value)}
          placeholder="e.g. Manufacturer, Distributor"
          value={type}
        />
      </DialogField>
      <DialogField>
        <Label htmlFor="new-vendor-gst">GST number</Label>
        <Input id="new-vendor-gst" onChange={(e) => setGstNumber(e.target.value)} value={gstNumber} />
      </DialogField>
      <DialogField>
        <Label htmlFor="new-vendor-address">Address</Label>
        <Textarea
          id="new-vendor-address"
          onChange={(e) => setAddress(e.target.value)}
          rows={2}
          value={address}
        />
      </DialogField>
      <DialogField>
        <Label>Material supply capability (optional)</Label>
        <VendorCapabilityPicker
          onChange={setMaterialCategories}
          value={materialCategories}
        />
        <Hint>Pick every category this supplier can provide. You can change it later.</Hint>
      </DialogField>
    </ConfirmationDialog>
  );
}

export function QuotationCreateScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useCurrentUser();
  const { data: requests = [] } = useAllPurchaseRequests();
  const { data: purchaseOrders = [] } = useAllPurchaseOrders();
  const { data: vendors = [] } = useAllVendors();
  const createQuotation = useCreateQuotation();
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm({
    defaultValues: {
      ...quotationInputDefaults,
      purchaseRequestId: searchParams.get("purchaseRequestId") ?? "",
    },
    resolver: zodResolver(quotationInputSchema),
  });
  const watchedRequestId = useWatch({ control, name: "purchaseRequestId" });
  const [watchedRate, watchedDiscount, watchedTax, watchedTaxIncluded] = useWatch({
    control,
    name: ["unitPrice", "discountPercent", "taxPercent", "taxIncluded"],
  });
  const rateSummary = (() => {
    const unitPrice = Number(watchedRate);
    if (!(unitPrice > 0)) return null;
    const quote = {
      unitPrice,
      discountPercent: Number(watchedDiscount) || 0,
      taxPercent: Number(watchedTax) || 0,
      taxIncluded: Boolean(watchedTaxIncluded),
    };
    return {
      net: calculateNetRate(quote),
      landed: calculateEffectiveRate(quote),
    };
  })();
  // A just-added supplier is selected only once it's really in the dropdown's
  // list — the dropdown resets any value it doesn't (yet) have an option for.
  const [pendingVendorId, setPendingVendorId] = useState(null);
  useEffect(() => {
    if (!pendingVendorId || !vendors.some((vendor) => vendor.id === pendingVendorId)) {
      return undefined;
    }
    const frame = requestAnimationFrame(() => {
      setValue("vendorId", pendingVendorId, { shouldValidate: true });
      setPendingVendorId(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [pendingVendorId, vendors, setValue]);
  const selectedRequest = requests.find(
    (record) => record.id === watchedRequestId,
  );
  // Materials that already have a purchase order raised against this
  // indent — no more quotations are needed for them, so they're excluded
  // from the item picker rather than inviting a duplicate order.
  const orderedMaterialCodes = new Set(
    purchaseOrders
      .filter(
        (order) =>
          order.sourceIndentId &&
          order.sourceIndentId === selectedRequest?.sourceIndentId &&
          order.status !== "cancelled" &&
          order.status !== "rejected",
      )
      .flatMap((order) => order.items.map((item) => item.materialCode)),
  );
  const availableMaterials =
    selectedRequest?.materials.filter(
      (material) => !orderedMaterialCodes.has(material.materialCode),
    ) ?? [];

  function onSubmit(values) {
    createQuotation.mutate(values, {
      onSuccess: () =>
        router.push(
          `/procurement/quotations/compare?purchaseRequestId=${values.purchaseRequestId}`,
        ),
    });
  }

  const canRecordQuotation = Boolean(
    currentUser && hasPermission(currentUser.role, "procurement:manage"),
  );
  if (!canRecordQuotation) {
    return (
      <AccessDeniedState
        pageName="Record Quotation"
        roleLabel={currentUser?.role ? ROLE_LABELS[currentUser.role] : undefined}
      />
    );
  }

  return (
    <Root>
      <PageHeader
        description="Record a supplier's rate for one item on a purchase request. Up to three quotations per item can be captured for comparison — none are auto-selected."
        eyebrow="Procurement"
        title="Record Quotation"
      />
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Panel>
          <PanelTitle>Request & item</PanelTitle>
          <FieldGrid>
            <Field>
              <Label htmlFor="quotation-request">Project</Label>
              <Controller
                control={control}
                name="purchaseRequestId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      aria-label="Project"
                      id="quotation-request"
                    >
                      <SelectValue placeholder="Select the project the indent was raised for" />
                    </SelectTrigger>
                    <SelectContent>
                      {requests.map((request) => (
                        <SelectItem key={request.id} value={request.id}>
                          {request.projectName} ({request.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.purchaseRequestId ? (
                <ErrorText>{errors.purchaseRequestId.message}</ErrorText>
              ) : null}
            </Field>
            <Field>
              <Label htmlFor="quotation-material">Item</Label>
              <Controller
                control={control}
                name="materialCode"
                render={({ field }) => (
                  <Select
                    disabled={!selectedRequest}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger aria-label="Item" id="quotation-material">
                      <SelectValue placeholder="Select an item" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMaterials.map((material) => (
                        <SelectItem
                          key={material.materialCode}
                          value={material.materialCode}
                        >
                          {material.materialName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.materialCode ? (
                <ErrorText>{errors.materialCode.message}</ErrorText>
              ) : selectedRequest && availableMaterials.length === 0 ? (
                <Hint>Every item on this project&apos;s request already has a purchase order.</Hint>
              ) : (
                <Hint>Only items without a purchase order yet are shown.</Hint>
              )}
            </Field>
            <Field>
              <Label htmlFor="quotation-vendor">Supplier</Label>
              <Controller
                control={control}
                name="vendorId"
                render={({ field }) => (
                  <SupplierRow>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger aria-label="Supplier" id="quotation-vendor">
                        <SelectValue placeholder="Select a supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <AddVendorDialog
                      onCreated={setPendingVendorId}
                    />
                  </SupplierRow>
                )}
              />
              {errors.vendorId ? (
                <ErrorText>{errors.vendorId.message}</ErrorText>
              ) : (
                <Hint>
                  Re-ordering? Pick an existing supplier, or add a new one if
                  you&apos;re sourcing from somewhere new.
                </Hint>
              )}
            </Field>
            <Field>
              <Label htmlFor="quotation-quality">Quality rating</Label>
              <Controller
                control={control}
                name="qualityRating"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      aria-label="Quality rating"
                      id="quotation-quality"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUOTATION_QUALITY_VALUES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value.charAt(0).toUpperCase() + value.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </FieldGrid>
        </Panel>
        <Panel>
          <PanelTitle>Commercials</PanelTitle>
          <FieldGrid>
            <Field>
              <Label htmlFor="quotation-number">Quotation number</Label>
              <Input
                aria-invalid={Boolean(errors.quotationNumber)}
                id="quotation-number"
                placeholder="e.g. VND/QT/2026/0001"
                {...register("quotationNumber")}
              />
              {errors.quotationNumber ? (
                <ErrorText>{errors.quotationNumber.message}</ErrorText>
              ) : null}
            </Field>
            <Field>
              <Label htmlFor="quotation-date">Quotation date</Label>
              <Input
                aria-invalid={Boolean(errors.quotationDate)}
                id="quotation-date"
                type="date"
                {...register("quotationDate")}
              />
              {errors.quotationDate ? (
                <ErrorText>{errors.quotationDate.message}</ErrorText>
              ) : (
                <Hint>Date printed on the supplier&apos;s quotation.</Hint>
              )}
            </Field>
            <Field>
              <Label htmlFor="quotation-rate">Rate (per unit)</Label>
              <Input
                aria-invalid={Boolean(errors.unitPrice)}
                id="quotation-rate"
                min="0"
                placeholder="e.g. 325"
                step="any"
                type="number"
                {...register("unitPrice")}
              />
              {errors.unitPrice ? (
                <ErrorText>{errors.unitPrice.message}</ErrorText>
              ) : (
                <Hint>
                  {watchedTaxIncluded
                    ? "Price for one unit, tax included."
                    : "Price for one unit, before tax."}
                </Hint>
              )}
            </Field>
            <Field>
              <Label htmlFor="quotation-tax-mode">Tax</Label>
              <Controller
                control={control}
                name="taxIncluded"
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(value === "included")}
                    value={field.value ? "included" : "extra"}
                  >
                    <SelectTrigger aria-label="Tax" id="quotation-tax-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="extra">Extra — added on top of the rate</SelectItem>
                      <SelectItem value="included">Included in the rate</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <Hint>Some suppliers quote an all-in price per unit.</Hint>
            </Field>
            <Field>
              <Label htmlFor="quotation-tax">Tax %</Label>
              <Input
                aria-invalid={Boolean(errors.taxPercent)}
                id="quotation-tax"
                min="0"
                placeholder="e.g. 18"
                step="any"
                type="number"
                {...register("taxPercent")}
              />
              {errors.taxPercent ? (
                <ErrorText>{errors.taxPercent.message}</ErrorText>
              ) : watchedTaxIncluded ? (
                <Hint>How much of the rate is tax, so it can be shown separately.</Hint>
              ) : null}
            </Field>
            <Field>
              <Label htmlFor="quotation-discount">Discount %</Label>
              <Input
                id="quotation-discount"
                min="0"
                placeholder="e.g. 5 (blank if none)"
                step="any"
                type="number"
                {...register("discountPercent")}
              />
            </Field>
            <Field>
              <Label htmlFor="quotation-moq">MOQ (optional)</Label>
              <Input
                aria-invalid={Boolean(errors.moq)}
                id="quotation-moq"
                min="0"
                placeholder="e.g. 100 (blank if none)"
                step="any"
                type="number"
                {...register("moq")}
              />
              {errors.moq ? <ErrorText>{errors.moq.message}</ErrorText> : null}
            </Field>
            {rateSummary ? (
              <FullWidthField>
                <Hint aria-live="polite">
                  Works out to <strong>{formatCurrency(rateSummary.landed)}</strong> per
                  unit including tax
                  {" "}(<strong>{formatCurrency(rateSummary.net)}</strong> before tax).
                </Hint>
              </FullWidthField>
            ) : null}
            <FullWidthField>
              <Label htmlFor="quotation-document">
                Quotation document (optional)
              </Label>
              <Input
                id="quotation-document"
                placeholder="No file attached"
                {...register("documentName")}
              />
              <Hint>
                <Paperclip
                  aria-hidden="true"
                  size={12}
                  strokeWidth={1.75}
                  style={{
                    display: "inline",
                    verticalAlign: "-2px",
                    marginRight: "0.25rem",
                  }}
                />
                File attachment is not required unless configuration requires
                it.
              </Hint>
            </FullWidthField>
          </FieldGrid>
        </Panel>
        <Actions>
          <Button
            onClick={() => router.push("/procurement/quotations")}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={createQuotation.isPending} type="submit">
            Save Quotation
          </Button>
        </Actions>
      </Form>
    </Root>
  );
}

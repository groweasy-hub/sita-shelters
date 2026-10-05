"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import styled from "styled-components";

import { PageHeader } from "@/components/shared";
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
import { EmptyState } from "@/components/feedback/empty-state";
import { hasPermission, ROLE_LABELS } from "@/config/permissions";
import { AccessDeniedState } from "@/components/shared/access-denied";
import { useCurrentUser } from "@/features/profile";
import { useAllPurchaseOrders } from "@/features/procurement";
import { inwardInputSchema } from "../schemas/inward.schema";
import { useCreateInwardRecord } from "../hooks/use-inward";
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
const FieldGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
`;
const Field = styled.div`
  display: grid;
  gap: 0.375rem;
  min-width: 0;
`;
const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.75rem;
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
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 0.6fr) minmax(0, 1fr) minmax(0, 1fr);
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
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
const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const ELIGIBLE_STATUSES = new Set(["released", "partially-delivered"]);

function toDatetimeLocalValue(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function InwardEntryForm({ order, recordedById, router }) {
  const { getVendor } = useVendorLookup();
  const createInward = useCreateInwardRecord();
  const vendor = getVendor(order.vendorId);
  const defaultLines = useMemo(
    () =>
      order.items.map((item) => ({
        materialCode: item.materialCode,
        materialName: item.materialName,
        unit: item.unit,
        orderedQuantity: item.orderedQuantity,
        receivedQuantity: item.orderedQuantity,
        damagedQuantity: 0,
        missingQuantity: 0,
      })),
    [order],
  );
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm({
    defaultValues: {
      purchaseOrderId: order.id,
      vehicleNumber: "",
      driverName: "",
      transporterName: "",
      invoiceNumber: "",
      deliveryChallanNumber: "",
      receivedAt: toDatetimeLocalValue(new Date()),
      lines: defaultLines,
    },
    resolver: zodResolver(inwardInputSchema),
  });
  const { fields } = useFieldArray({ control, name: "lines" });

  function onSubmit(values) {
    createInward.mutate(
      {
        ...values,
        vendorId: order.vendorId,
        projectId: order.projectId,
        recordedById,
      },
      {
        onSuccess: (record) => router.push(`/inward/${record.id}`),
      },
    );
  }

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Panel>
        <PanelTitle>Delivery details</PanelTitle>
        <FieldGrid>
          <Field>
            <Label>Supplier</Label>
            <MaterialLabel>{vendor?.name ?? order.vendorId}</MaterialLabel>
          </Field>
          <Field>
            <Label>Project</Label>
            <MaterialLabel>{order.projectName}</MaterialLabel>
          </Field>
          <Field>
            <Label htmlFor="inward-received-at">Received date &amp; time</Label>
            <Input
              id="inward-received-at"
              type="datetime-local"
              {...register("receivedAt")}
            />
            {errors.receivedAt ? (
              <ErrorText>{errors.receivedAt.message}</ErrorText>
            ) : null}
          </Field>
          <Field>
            <Label htmlFor="inward-vehicle">Vehicle number</Label>
            <Input id="inward-vehicle" {...register("vehicleNumber")} />
            {errors.vehicleNumber ? (
              <ErrorText>{errors.vehicleNumber.message}</ErrorText>
            ) : null}
          </Field>
          <Field>
            <Label htmlFor="inward-driver">Driver name</Label>
            <Input id="inward-driver" {...register("driverName")} />
            {errors.driverName ? (
              <ErrorText>{errors.driverName.message}</ErrorText>
            ) : null}
          </Field>
          <Field>
            <Label htmlFor="inward-transporter">Transporter</Label>
            <Input id="inward-transporter" {...register("transporterName")} />
            {errors.transporterName ? (
              <ErrorText>{errors.transporterName.message}</ErrorText>
            ) : null}
          </Field>
          <Field>
            <Label htmlFor="inward-invoice">Invoice number</Label>
            <Input id="inward-invoice" {...register("invoiceNumber")} />
            {errors.invoiceNumber ? (
              <ErrorText>{errors.invoiceNumber.message}</ErrorText>
            ) : null}
          </Field>
          <Field>
            <Label htmlFor="inward-challan">Delivery challan number</Label>
            <Input
              id="inward-challan"
              {...register("deliveryChallanNumber")}
            />
            {errors.deliveryChallanNumber ? (
              <ErrorText>{errors.deliveryChallanNumber.message}</ErrorText>
            ) : null}
          </Field>
        </FieldGrid>
      </Panel>
      <Panel>
        <PanelTitle>Received items</PanelTitle>
        {fields.map((field, index) => (
          <LineCard key={field.id}>
            <LineGrid>
              <Field>
                <Label>Item Description</Label>
                <MaterialLabel>{field.materialName}</MaterialLabel>
              </Field>
              <Field>
                <Label>UOM</Label>
                <MaterialLabel>{field.unit}</MaterialLabel>
              </Field>
              <Field>
                <Label htmlFor={`inward-received-${index}`}>Received</Label>
                <Input
                  id={`inward-received-${index}`}
                  min="0"
                  step="any"
                  type="number"
                  {...register(`lines.${index}.receivedQuantity`)}
                />
              </Field>
              <Field>
                <Label>PO Qty</Label>
                <MaterialLabel>{field.orderedQuantity}</MaterialLabel>
              </Field>
            </LineGrid>
          </LineCard>
        ))}
      </Panel>
      <Actions>
        <Button onClick={() => router.back()} type="button" variant="outline">
          Cancel
        </Button>
        <Button disabled={createInward.isPending} type="submit">
          Record Inward Entry
        </Button>
      </Actions>
    </Form>
  );
}

export function InwardCreateScreen() {
  const { getName } = useVendorLookup();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useCurrentUser();
  const { data: allOrders = [] } = useAllPurchaseOrders();
  const eligibleOrders = useMemo(
    () => allOrders.filter((order) => ELIGIBLE_STATUSES.has(order.status)),
    [allOrders],
  );
  const [purchaseOrderId, setPurchaseOrderId] = useState(
    searchParams.get("purchaseOrderId") ?? "",
  );

  const canRecordInward = Boolean(
    currentUser && hasPermission(currentUser.role, "inward:manage"),
  );
  if (!canRecordInward) {
    return (
      <AccessDeniedState
        pageName="Record Inward Entry"
        roleLabel={currentUser?.role ? ROLE_LABELS[currentUser.role] : undefined}
      />
    );
  }

  const order = eligibleOrders.find((entry) => entry.id === purchaseOrderId);

  return (
    <Root>
      <div>
        <BackLink onClick={() => router.back()} type="button">
          <ArrowLeft aria-hidden="true" />
          Back
        </BackLink>
      </div>
      <PageHeader
        description="Log a delivery against a released purchase order. The entry starts as Pending QC — quality control decides accept or reject separately."
        eyebrow="Goods inward"
        title="Record Inward Entry"
      />
      <Panel>
        <PanelTitle>Purchase order</PanelTitle>
        {eligibleOrders.length === 0 ? (
          <EmptyState
            compact
            description="No released purchase order currently has a pending delivery to receive against."
            title="Nothing to receive"
          />
        ) : (
          <Field>
            <Label htmlFor="inward-po-select">Select a released PO</Label>
            <Select onValueChange={setPurchaseOrderId} value={purchaseOrderId}>
              <SelectTrigger id="inward-po-select">
                <SelectValue placeholder="Choose a purchase order" />
              </SelectTrigger>
              <SelectContent>
                {eligibleOrders.map((entry) => (
                  <SelectItem key={entry.id} value={entry.id}>
                    {entry.id} · {getName(entry.vendorId)} ·{" "}
                    {entry.projectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      </Panel>
      {order ? (
        <InwardEntryForm
          key={order.id}
          order={order}
          recordedById={currentUser.id}
          router={router}
        />
      ) : null}
    </Root>
  );
}

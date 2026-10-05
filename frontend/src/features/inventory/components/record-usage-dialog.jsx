"use client";

import { useState } from "react";
import { ClipboardMinus } from "lucide-react";
import styled from "styled-components";

import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasPermission } from "@/config/permissions";
import { inProjectScope, useCurrentUser, useProjectScope } from "@/features/profile";
import { formatQuantity } from "@/lib/formatters";
import { useRecordStockUsage } from "../hooks/use-inventory-usage";

const Field = styled.div`
  display: grid;
  gap: 0.375rem;
  margin-top: 0.75rem;
  text-align: left;
`;
const Summary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.muted};
  font-size: 0.8125rem;
  text-align: left;
  strong {
    font-variant-numeric: tabular-nums;
  }
`;
const Stop = styled.span`
  display: inline-flex;
`;

function UsageForm({ item }) {
  const mutation = useRecordStockUsage();
  const [quantity, setQuantity] = useState("");
  const [activity, setActivity] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  const used = Number(quantity);
  const invalid =
    !(used > 0) ||
    used > item.availableQuantity + 1e-6 ||
    activity.trim().length === 0 ||
    location.trim().length === 0;
  const remaining = used > 0 ? Math.max(0, item.availableQuantity - used) : item.availableQuantity;

  return (
    <ConfirmationDialog
      confirmDisabled={invalid}
      confirmLabel="Update stock"
      description={`Record how much of ${item.materialName} has been used at ${item.projectName}. It is taken out of the store's stock straight away.`}
      errorMessage={error || undefined}
      onConfirm={() => {
        setError("");
        return mutation.mutateAsync({
          projectId: item.projectId,
          materialCode: item.materialCode,
          quantityConsumed: used,
          activity: activity.trim(),
          location: location.trim(),
        });
      }}
      onConfirmError={(failure) =>
        setError(failure?.message ?? "The usage could not be recorded")
      }
      onOpenChange={(open) => {
        if (!open) {
          setQuantity("");
          setActivity("");
          setLocation("");
          setError("");
        }
      }}
      pending={mutation.isPending}
      title="Record usage"
      trigger={
        <Button size="sm" variant="outline">
          <ClipboardMinus aria-hidden="true" strokeWidth={1.75} />
          Record usage
        </Button>
      }
    >
      <Summary>
        <span>
          In store: <strong>{formatQuantity(item.availableQuantity, item.unit)}</strong>
        </span>
        <span>
          After this: <strong>{formatQuantity(remaining, item.unit)}</strong>
        </span>
      </Summary>
      <Field>
        <Label htmlFor={`usage-qty-${item.id}`}>
          Quantity used ({item.unit}) — up to {item.availableQuantity}
        </Label>
        <Input
          id={`usage-qty-${item.id}`}
          max={item.availableQuantity}
          min="0"
          onChange={(event) => setQuantity(event.target.value)}
          step="any"
          type="number"
          value={quantity}
        />
      </Field>
      <Field>
        <Label htmlFor={`usage-activity-${item.id}`}>Activity</Label>
        <Input
          id={`usage-activity-${item.id}`}
          onChange={(event) => setActivity(event.target.value)}
          placeholder="e.g. Slab casting - Tower A 2nd floor"
          value={activity}
        />
      </Field>
      <Field>
        <Label htmlFor={`usage-location-${item.id}`}>Location</Label>
        <Input
          id={`usage-location-${item.id}`}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="e.g. Tower A - 2nd Floor"
          value={location}
        />
      </Field>
    </ConfirmationDialog>
  );
}

/**
 * The store manager's "Record usage" action on a stock row. Shown only to
 * someone allowed to issue material and log consumption, for a site they are
 * assigned to, and while the store still holds some of the item.
 */
export function RecordUsageAction({ item }) {
  const currentUser = useCurrentUser();
  const { scopeProjectIds } = useProjectScope();
  const allowed =
    currentUser &&
    hasPermission(currentUser.role, "consumption:manage") &&
    hasPermission(currentUser.role, "material-issues:manage") &&
    inProjectScope(scopeProjectIds, item.projectId);
  if (!allowed || !(item.availableQuantity > 0)) return null;
  // The row itself is clickable, and the dialog is portalled but still bubbles to it.
  return (
    <Stop onClick={(event) => event.stopPropagation()}>
      <UsageForm item={item} />
    </Stop>
  );
}

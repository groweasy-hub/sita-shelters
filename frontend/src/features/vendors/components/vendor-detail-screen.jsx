"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Mail, Pencil, Phone, Star, X } from "lucide-react";
import styled from "styled-components";

import { KpiCard, KpiGrid, PageHeader, StatusBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { hasPermission } from "@/config/permissions";
import { useCurrentUser } from "@/features/profile";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { MATERIAL_CATEGORY_OPTIONS } from "@/lib/mock-data/material-categories";
import { getMaterialsByCategory } from "@/lib/mock-data/materials";
import { normalizeCapabilities } from "../constants/vendors.constants";
import { useUpdateVendorCapabilities, useVendor } from "../hooks/use-vendors";
import { VendorCapabilityPicker } from "./capability-picker";

const Root = styled.div`
  display: grid;
  max-width: 84rem;
  margin: 0 auto;
  gap: 1.5rem;
`;
const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
  }
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`;
const Grid = styled.div`
  display: grid;
  gap: 1.5rem;
  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  }
`;
const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;
const PanelHeader = styled.header`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.875rem;
  font-weight: 650;
`;
const DefinitionGrid = styled.dl`
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
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
const ContactRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child {
    border-bottom: 0;
  }
`;
const ContactMeta = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
  svg {
    width: 0.75rem;
    height: 0.75rem;
    margin-right: 0.25rem;
    vertical-align: -1px;
  }
`;
const CapabilityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  gap: 0.75rem;
  padding: 1.25rem;
`;
const CapabilityChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.8125rem;
  color: ${({ theme, $supported }) =>
    $supported ? theme.colors.foreground : theme.colors.mutedForeground};
  svg {
    width: 0.875rem;
    height: 0.875rem;
    color: ${({ theme, $supported }) =>
      $supported ? theme.colors.success : theme.colors.mutedForeground};
  }
`;
const PanelTop = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-right: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  > * {
    border-bottom: 0;
  }
`;
const EditArea = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
`;
const EditActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;
const FormNote = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const ErrorNote = styled(FormNote)`
  color: ${({ theme }) => theme.colors.danger};
`;
const ScorecardNote = styled.p`
  margin: -0.5rem 0 0;
  color: ${({ theme }) => theme.colors.mutedForeground};
  font-size: 0.75rem;
`;
const MaterialRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8125rem;
  &:last-child {
    border-bottom: 0;
  }
`;

const NO_DATA = "—";
function percentOrDash(value) {
  return value === null || value === undefined ? NO_DATA : formatPercent(value);
}

export function VendorDetailScreen({ vendorId }) {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const { data: vendor } = useVendor(vendorId);
  const updateCapabilities = useUpdateVendorCapabilities();
  const [editingCapabilities, setEditingCapabilities] = useState(false);
  const [draftCategories, setDraftCategories] = useState([]);
  const canManageVendors = Boolean(
    currentUser && hasPermission(currentUser.role, "vendors:manage"),
  );
  if (!vendor) {
    return (
      <EmptyState
        action={
          <Button onClick={() => router.push("/vendors")} variant="outline">
            Back to vendors
          </Button>
        }
        description="This vendor may have been removed from the master list."
        title="Vendor not found"
      />
    );
  }
  // Absent on a vendor cached before this field existed; treat as "no data yet".
  const basis = vendor.performanceBasis ?? { deliveries: 0, inspectedQuantity: 0 };
  const capabilities = normalizeCapabilities(vendor.materialCategories);
  const suppliedMaterials = capabilities.flatMap((category) =>
    getMaterialsByCategory(category).filter((material) =>
      material.approvedVendorIds.includes(vendor.id),
    ),
  );
  return (
    <Root>
      <div>
        <BackLink href="/vendors">
          <ArrowLeft aria-hidden="true" />
          Back to vendors
        </BackLink>
      </div>
      <PageHeader
        description={vendor.address}
        eyebrow={vendor.type}
        meta={
          <>
            <Badge variant="outline">{vendor.code}</Badge>
            <StatusBadge status={vendor.status} />
          </>
        }
        title={vendor.name}
      />
      <KpiGrid>
        <KpiCard
          icon={Star}
          label="Rating"
          value={vendor.rating === null ? NO_DATA : vendor.rating.toFixed(1)}
        />
        <KpiCard
          label="Delivery performance"
          value={percentOrDash(vendor.deliveryPerformance)}
        />
        <KpiCard
          label="Quality acceptance rate"
          value={percentOrDash(vendor.qualityAcceptanceRate)}
        />
        <KpiCard
          label="Rejection rate"
          tone={vendor.rejectionRate > 0.05 ? "warning" : undefined}
          value={percentOrDash(vendor.rejectionRate)}
        />
      </KpiGrid>
      <ScorecardNote>
        Calculated automatically from this vendor&apos;s deliveries and quality
        checks
        {basis.deliveries > 0
          ? ` — ${basis.deliveries} ${basis.deliveries === 1 ? "delivery" : "deliveries"} and ${basis.inspectedQuantity} units inspected so far.`
          : ". No deliveries have been received from this vendor yet."}
      </ScorecardNote>
      <Grid>
        <Panel>
          <PanelHeader>Company information</PanelHeader>
          <DefinitionGrid>
            <div>
              <dt>GST number</dt>
              <dd>{vendor.gstNumber}</dd>
            </div>
            <div>
              <dt>Vendor type</dt>
              <dd>{vendor.type}</dd>
            </div>
            <div>
              <dt>Price competitiveness</dt>
              <dd>{vendor.priceCompetitiveness || "—"}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{vendor.address}</dd>
            </div>
          </DefinitionGrid>
          <PanelHeader as="div">Contacts</PanelHeader>
          {vendor.contacts.map((contact) => (
            <ContactRow key={contact.email}>
              <div>
                <strong>{contact.name}</strong>
                <ContactMeta>
                  <span>{contact.role}</span>
                  <span>
                    <Phone aria-hidden="true" />
                    {contact.phone}
                  </span>
                  <span>
                    <Mail aria-hidden="true" />
                    {contact.email}
                  </span>
                </ContactMeta>
              </div>
            </ContactRow>
          ))}
        </Panel>
        <Panel>
          <PanelTop>
            <PanelHeader>Material supply capability</PanelHeader>
            {canManageVendors && !editingCapabilities ? (
              <Button
                onClick={() => {
                  setDraftCategories(capabilities);
                  updateCapabilities.reset();
                  setEditingCapabilities(true);
                }}
                size="sm"
                variant="outline"
              >
                <Pencil aria-hidden="true" />
                Edit
              </Button>
            ) : null}
          </PanelTop>
          {editingCapabilities ? (
            <EditArea>
              <FormNote>
                Select every category this vendor can supply — you can pick
                more than one.
              </FormNote>
              <VendorCapabilityPicker
                disabled={updateCapabilities.isPending}
                onChange={setDraftCategories}
                value={draftCategories}
              />
              {updateCapabilities.isError ? (
                <ErrorNote role="alert">
                  {updateCapabilities.error?.message ??
                    "The capability could not be saved. Please try again."}
                </ErrorNote>
              ) : null}
              <EditActions>
                <Button
                  disabled={updateCapabilities.isPending}
                  onClick={() => setEditingCapabilities(false)}
                  size="sm"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  disabled={updateCapabilities.isPending}
                  onClick={() =>
                    updateCapabilities.mutate(
                      { vendorId: vendor.id, materialCategories: draftCategories },
                      { onSuccess: () => setEditingCapabilities(false) },
                    )
                  }
                  size="sm"
                >
                  {updateCapabilities.isPending ? "Saving…" : "Save capability"}
                </Button>
              </EditActions>
            </EditArea>
          ) : (
            <CapabilityGrid>
              {MATERIAL_CATEGORY_OPTIONS.map((category) => {
                const supported = capabilities.includes(category.id);
                return (
                  <CapabilityChip $supported={supported} key={category.id}>
                    {supported ? (
                      <Check aria-hidden="true" />
                    ) : (
                      <X aria-hidden="true" />
                    )}
                    {category.name}
                  </CapabilityChip>
                );
              })}
            </CapabilityGrid>
          )}
        </Panel>
      </Grid>
      <Panel>
        <PanelHeader>Materials supplied</PanelHeader>
        {suppliedMaterials.length ? (
          suppliedMaterials.map((material) => (
            <MaterialRow key={material.id}>
              <Link href={`/materials/${material.id}`}>{material.name}</Link>
              <span>{formatCurrency(material.lastPurchasePrice)}</span>
            </MaterialRow>
          ))
        ) : (
          <EmptyState
            compact
            description="No catalogued material currently lists this vendor as approved."
            title="No materials linked"
          />
        )}
      </Panel>
    </Root>
  );
}

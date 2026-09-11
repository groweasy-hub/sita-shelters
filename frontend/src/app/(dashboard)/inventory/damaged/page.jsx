"use client";

import styled from "styled-components";

import { DamagedStockScreen } from "@/features/damaged-stock";
import { InventoryScreen } from "@/features/inventory";

const Stack = styled.div`
  display: grid;
  gap: 2.5rem;
`;

export default function DamagedStockPage() {
  return (
    <Stack>
      <InventoryScreen
        description="Live inventory positions currently flagged damaged, awaiting write-off, vendor return or claim processing."
        eyebrow="Stock control"
        forcedStatus="damaged"
        title="Damaged Stock"
      />
      <DamagedStockScreen />
    </Stack>
  );
}

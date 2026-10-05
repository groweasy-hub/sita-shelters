import { InventoryScreen } from "@/features/inventory";

export default function LowStockPage() {
  return (
    <InventoryScreen
      description="Materials at or below their reorder level across every project. Raise an indent or transfer from a project with excess stock."
      eyebrow="Stock control"
      forcedStatus="low-stock"
      title="Low Stock"
    />
  );
}

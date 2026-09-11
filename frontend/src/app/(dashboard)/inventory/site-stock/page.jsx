import { InventoryScreen } from "@/features/inventory";

export default function SiteStockPage() {
  return (
    <InventoryScreen
      description="Stock physically held at each project, scoped to the active project selection."
      eyebrow="Stock control"
      title="Site Stock"
    />
  );
}

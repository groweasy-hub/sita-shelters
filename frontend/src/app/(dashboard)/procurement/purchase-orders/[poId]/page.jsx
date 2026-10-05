import { PurchaseOrderDetailScreen } from "@/features/procurement";

export default async function PurchaseOrderDetailPage({ params }) {
  const { poId } = await params;
  return <PurchaseOrderDetailScreen poId={poId} />;
}

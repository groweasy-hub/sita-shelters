import { TransferDetailScreen } from "@/features/stock-transfers";

export default async function StockTransferDetailPage({ params }) {
  const { transferId } = await params;
  return <TransferDetailScreen transferId={transferId} />;
}

import { ReturnDetailScreen } from "@/features/returns";

export default async function ReturnDetailPage({ params }) {
  const { returnId } = await params;
  return <ReturnDetailScreen returnId={returnId} />;
}

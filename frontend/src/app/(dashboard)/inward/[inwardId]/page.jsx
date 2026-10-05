import { InwardDetailScreen } from "@/features/inward";

export default async function InwardDetailPage({ params }) {
  const { inwardId } = await params;
  return <InwardDetailScreen inwardId={inwardId} />;
}

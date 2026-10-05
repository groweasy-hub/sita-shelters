import { QcDetailScreen } from "@/features/quality-control";

export default async function QcDetailPage({ params }) {
  const { qcId } = await params;
  return <QcDetailScreen qcId={qcId} />;
}

import { MaterialDetailScreen } from "@/features/materials";

export default async function MaterialDetailPage({ params }) {
  const { materialId } = await params;
  return <MaterialDetailScreen materialId={materialId} />;
}

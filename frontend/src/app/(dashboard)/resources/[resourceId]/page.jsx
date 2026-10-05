import { ResourceDetailScreen } from "@/features/resources";

export default async function ResourceDetailPage({ params }) {
  const { resourceId } = await params;
  return <ResourceDetailScreen resourceId={resourceId} />;
}

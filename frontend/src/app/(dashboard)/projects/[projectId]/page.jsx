import { ProjectDetailScreen } from "@/features/projects";

export default async function ProjectDetailPage({ params }) {
  const { projectId } = await params;
  return <ProjectDetailScreen projectId={projectId} />;
}

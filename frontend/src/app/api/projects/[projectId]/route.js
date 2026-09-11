import { projectSchema } from "@/features/projects/schemas/projects.schema";
import { getProjectById } from "@/lib/mock-data/projects";

export const dynamic = "force-dynamic";

function json(body, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");
  return Response.json(body, { ...init, headers });
}

export async function GET(_request, { params }) {
  const { projectId } = await params;
  if (
    typeof projectId !== "string" ||
    projectId.trim().length === 0 ||
    projectId.length > 128
  ) {
    return json({ error: "A valid project id is required" }, { status: 400 });
  }

  const project = getProjectById(projectId);
  if (!project) {
    return json({ error: "Project not found" }, { status: 404 });
  }
  return json(projectSchema.parse(project));
}

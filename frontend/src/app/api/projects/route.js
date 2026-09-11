import {
  createProjectInputSchema,
  projectSchema,
  projectsSchema,
} from "@/features/projects/schemas/projects.schema";
import { PROJECTS } from "@/lib/mock-data/projects";

export const dynamic = "force-dynamic";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function json(body, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");
  return Response.json(body, { ...init, headers });
}

function validationIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

function isCalendarDate(value) {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
  );
}

const projects = [...PROJECTS];

export function GET() {
  return json(projectsSchema.parse(projects));
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const result = createProjectInputSchema.safeParse(payload);
  if (!result.success) {
    return json(
      {
        error: "Project details are invalid",
        issues: validationIssues(result.error),
      },
      { status: 400 },
    );
  }
  if (
    !isCalendarDate(result.data.startDate) ||
    !isCalendarDate(result.data.estimatedCompletionDate)
  ) {
    return json(
      {
        error: "Project details are invalid",
        issues: [
          {
            field: "startDate",
            message: "Start and completion dates must be valid ISO dates",
          },
        ],
      },
      { status: 400 },
    );
  }

  const code = result.data.code.toLocaleUpperCase();
  if (projects.some((project) => project.code.toLocaleUpperCase() === code)) {
    return json({ error: `A project with code ${code} already exists` }, { status: 409 });
  }

  const project = projectSchema.parse({
    ...result.data,
    id: crypto.randomUUID(),
    code,
    location: result.data.address.city,
  });
  projects.unshift(project);
  return json(project, { status: 201 });
}

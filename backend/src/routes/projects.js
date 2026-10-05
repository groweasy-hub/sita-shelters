import { Router } from "express";
import { z } from "zod";

import { resolveSessionUser } from "../auth/resolve-session.js";
import { requirePermission } from "../middleware/require-permission.js";
import {
  createProject,
  getProject,
  listProjects,
  listProjectsForUser,
  updateProjectProgress,
} from "../repositories/projects.js";

export const projectsRouter = Router();

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
function isCalendarDate(value) {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

const addressSchema = z.object({
  line1: z.string().trim().min(1),
  line2: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  postalCode: z.string().trim().min(1),
  country: z.string().trim().min(1).default("India"),
});
const createProjectInputSchema = z.object({
  // No `code` here — it's generated automatically (SS-001, SS-002, ...) in
  // `repositories/projects.js`'s `createProject`.
  name: z.string().trim().min(1).max(255),
  status: z.enum(["planning", "active", "on-hold", "completed"]),
  // Nullable: a project can exist before its manager does — see
  // `repositories/users.js`'s `createUser`, which sets this once a
  // project-manager is created and assigned to the project.
  projectManagerId: z.string().trim().min(1).nullable().default(null),
  startDate: z.string().trim().min(1),
  estimatedCompletionDate: z.string().trim().min(1),
  progressPercent: z.coerce.number().int().min(0).max(100).default(0),
  description: z.string().trim().min(1).max(2000),
  address: addressSchema,
});
const updateProjectProgressInputSchema = z.object({
  status: z.enum(["planning", "active", "on-hold", "completed"]),
  progressPercent: z.coerce.number().int().min(0).max(100),
});

function validationIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

projectsRouter.get("/", requirePermission("projects:view"), async (req, res) => {
  try {
    res.json(await listProjects());
  } catch (error) {
    console.error("Projects API error", error);
    res.status(500).json({ error: "The project request could not be completed" });
  }
});

// Any signed-in user, whatever their permissions: this is the picker list
// ("which projects can I work against?"), not the Projects module itself,
// so roles without `projects:view` (site engineer, store manager, …) can
// still choose from their assigned projects. Declared before "/:projectId".
projectsRouter.get("/mine", async (req, res) => {
  try {
    const user = await resolveSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    res.json(await listProjectsForUser(user));
  } catch (error) {
    console.error("My projects API error", error);
    res.status(500).json({ error: "The project request could not be completed" });
  }
});

projectsRouter.get("/:projectId", requirePermission("projects:view"), async (req, res) => {
  try {
    const project = await getProject(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    console.error("Project detail API error", error);
    res.status(500).json({ error: "The project request could not be completed" });
  }
});

projectsRouter.post("/", requirePermission("projects:manage"), async (req, res) => {
  const result = createProjectInputSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Project details are invalid",
      issues: validationIssues(result.error),
    });
  }
  if (
    !isCalendarDate(result.data.startDate) ||
    !isCalendarDate(result.data.estimatedCompletionDate)
  ) {
    return res.status(400).json({
      error: "Project details are invalid",
      issues: [
        {
          field: "startDate",
          message: "Start and completion dates must be valid ISO dates",
        },
      ],
    });
  }

  try {
    const project = await createProject(result.data);
    res.status(201).json(project);
  } catch (error) {
    console.error("Project create API error", error);
    res.status(500).json({ error: "The project request could not be completed" });
  }
});

projectsRouter.patch(
  "/:projectId/progress",
  requirePermission("projects:manage"),
  async (req, res) => {
    const result = updateProjectProgressInputSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Project details are invalid",
        issues: validationIssues(result.error),
      });
    }
    try {
      const project = await updateProjectProgress(req.params.projectId, result.data);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Project progress update API error", error);
      res.status(500).json({ error: "The project could not be updated" });
    }
  },
);

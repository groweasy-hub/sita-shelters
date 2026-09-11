import { inventoryService } from "@/features/inventory";
import { getMaterialByCode } from "@/lib/mock-data/materials";
import { PROJECTS } from "@/lib/mock-data/projects";
import {
  createProjectInputSchema,
  projectSchema,
  projectSummariesSchema,
  projectSummarySchema,
  projectsSchema,
} from "../schemas/projects.schema";

const mockProjects = projectsSchema.parse(PROJECTS);

function hashSeed(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Converts the persisted project record into the read model used by project
 * cards and details. The persistence adapter deliberately owns no UI metrics.
 */
export function summarizeProject(project) {
  const parsedProject = projectSchema.parse(project);
  const inventoryRows = inventoryService
    .listAll()
    .filter((item) => item.projectId === parsedProject.id);
  const inventoryValue = inventoryRows.reduce((total, row) => {
    const material = getMaterialByCode(row.materialCode);
    return total + row.availableQuantity * (material?.lastPurchasePrice ?? 0);
  }, 0);
  const lowStockAlerts = inventoryRows.filter(
    (row) =>
      row.status === "low-stock" || row.availableQuantity < row.reorderLevel,
  ).length;
  const seed = hashSeed(parsedProject.id);
  return projectSummarySchema.parse({
    ...parsedProject,
    inventoryValue,
    lowStockAlerts,
    activeIndents: 2 + (seed % 9),
    pendingProcurement: 1 + ((seed >>> 3) % 6),
  });
}

export function summarizeProjects(projects) {
  return projectSummariesSchema.parse(
    projectsSchema.parse(projects).map(summarizeProject),
  );
}

export class ProjectsServiceError extends Error {
  constructor(message, { cause, issues, status } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = "ProjectsServiceError";
    this.status = status;
    this.issues = issues;
  }
}

async function requestJson(path, init) {
  let response;
  try {
    response = await fetch(path, {
      cache: "no-store",
      ...init,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });
  } catch (cause) {
    throw new ProjectsServiceError(
      "Unable to connect to project storage. Please try again.",
      { cause },
    );
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    // A useful status-based message is returned below for an invalid body.
  }

  if (!response.ok) {
    throw new ProjectsServiceError(
      typeof body?.error === "string"
        ? body.error
        : `The project request failed (${response.status})`,
      {
        issues: Array.isArray(body?.issues) ? body.issues : undefined,
        status: response.status,
      },
    );
  }
  if (body === null) {
    throw new ProjectsServiceError(
      "Project storage returned an invalid response. Please try again.",
      { status: response.status },
    );
  }
  return body;
}

/** Browser-safe adapter for the durable projects API. */
export const apiProjectsAdapter = {
  list() {
    return requestJson("/api/projects");
  },
  async get(projectId) {
    try {
      return await requestJson(`/api/projects/${encodeURIComponent(projectId)}`);
    } catch (error) {
      if (error instanceof ProjectsServiceError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },
  create(input) {
    return requestJson("/api/projects", {
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  },
};

function createMockProjectId(name) {
  const baseId =
    name
      .toLocaleLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "project";
  let id = baseId;
  let suffix = 2;
  while (mockProjects.some((project) => project.id === id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }
  return id;
}

/** In-memory base-record adapter retained for injected unit tests and demos. */
export const mockProjectsAdapter = {
  listSnapshot() {
    return projectsSchema.parse(mockProjects);
  },
  list() {
    return Promise.resolve(this.listSnapshot());
  },
  getSnapshot(projectId) {
    return (
      mockProjects.find((candidate) => candidate.id === projectId) ?? null
    );
  },
  get(projectId) {
    return Promise.resolve(this.getSnapshot(projectId));
  },
  create(input) {
    const normalizedCode = input.code.toLocaleUpperCase();
    if (
      mockProjects.some(
        (project) => project.code.toLocaleUpperCase() === normalizedCode,
      )
    ) {
      return Promise.reject(
        new ProjectsServiceError(
          `A project with code ${normalizedCode} already exists`,
          { status: 409 },
        ),
      );
    }
    const project = projectSchema.parse({
      ...input,
      id: createMockProjectId(input.name),
      code: normalizedCode,
      location: input.address.city,
    });
    mockProjects.unshift(project);
    return Promise.resolve(project);
  },
};

export function createProjectsService(adapter) {
  return {
    listSnapshot() {
      if (typeof adapter.listSnapshot !== "function") {
        return undefined;
      }
      return summarizeProjects(adapter.listSnapshot());
    },
    async list() {
      return summarizeProjects(await adapter.list());
    },
    async get(projectId) {
      const project = await adapter.get(projectId);
      return project ? summarizeProject(project) : null;
    },
    getSnapshot(projectId) {
      if (typeof adapter.getSnapshot !== "function") {
        return undefined;
      }
      const project = adapter.getSnapshot(projectId);
      return project ? summarizeProject(project) : null;
    },
    async create(payload) {
      const input = createProjectInputSchema.parse(payload);
      return summarizeProject(await adapter.create(input));
    },
  };
}

/**
 * `apiProjectsAdapter` calls `/api/projects`, which expects a
 * `backend/db/projects-repository.js` module that doesn't exist in this
 * checkout yet. Every other feature in this app runs on in-memory mock data
 * (see `src/lib/mock-data`), so the default service does the same here until
 * that backend is built — swap this back to `apiProjectsAdapter` then.
 */
export const projectsService = createProjectsService(mockProjectsAdapter);
export { projectSchema };

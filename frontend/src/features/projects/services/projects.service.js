import { indentsService } from "@/features/indents/services/indents.service";
import { inventoryService } from "@/features/inventory";
import { purchaseOrdersService } from "@/features/procurement/services/purchase-orders.service";
import { purchaseRequestsService } from "@/features/procurement/services/purchase-requests.service";
import { apiClient } from "@/lib/api-client";
import { PROJECTS } from "@/lib/mock-data/projects";
import { HttpError } from "@/services/http-client";
import {
  createProjectInputSchema,
  projectSchema,
  projectSummariesSchema,
  projectSummarySchema,
  projectsSchema,
  updateProjectProgressInputSchema,
} from "../schemas/projects.schema";

const mockProjects = projectsSchema.parse(PROJECTS);

/** Indents that are in flight: raised and not yet rejected or fully closed out. */
const ACTIVE_INDENT_STATUSES = new Set([
  "submitted",
  "under-review",
  "approved",
  "partially-fulfilled",
]);
/** Purchase orders still waiting on approval or delivery. */
const OPEN_PURCHASE_ORDER_STATUSES = new Set([
  "pending-approval",
  "approved",
  "released",
  "partially-delivered",
]);
/** Purchase requests that have been raised but not yet acted on. */
const OPEN_PURCHASE_REQUEST_STATUSES = new Set(["submitted", "approved"]);

/**
 * A role without access to a module gets a 403 from its API. That shouldn't
 * take the whole project list down — that module's count just isn't visible.
 */
async function listOrEmptyWhenForbidden(load) {
  try {
    return await load();
  } catch (error) {
    if (error?.status === 403) {
      return [];
    }
    throw error;
  }
}

/** Fetches, once, every record the project metrics are derived from. */
async function loadProjectMetricSources() {
  const [inventoryItems, indents, purchaseOrders, purchaseRequests] =
    await Promise.all([
      inventoryService.listAll(),
      listOrEmptyWhenForbidden(() => indentsService.listAll()),
      listOrEmptyWhenForbidden(() => purchaseOrdersService.listAll()),
      listOrEmptyWhenForbidden(() => purchaseRequestsService.listAll()),
    ]);
  return { inventoryItems, indents, purchaseOrders, purchaseRequests };
}

/**
 * Converts the persisted project record into the read model used by project
 * cards and details. The persistence adapter deliberately owns no UI metrics —
 * every figure here is counted from the project's real records, so a project
 * with no indents or procurement shows zero.
 */
export async function summarizeProject(project, sources) {
  const parsedProject = projectSchema.parse(project);
  const { inventoryItems, indents, purchaseOrders, purchaseRequests } =
    sources ?? (await loadProjectMetricSources());
  const inventoryRows = inventoryItems.filter(
    (item) => item.projectId === parsedProject.id,
  );
  // Valued by the backend at each material's current price.
  const inventoryValue = inventoryRows.reduce((total, row) => total + (row.stockValue ?? 0), 0);
  const lowStockAlerts = inventoryRows.filter(
    (row) =>
      row.status === "low-stock" ||
      (row.reorderLevel > 0 && row.availableQuantity < row.reorderLevel),
  ).length;

  const projectPurchaseOrders = purchaseOrders.filter(
    (order) => order.projectId === parsedProject.id,
  );
  const orderedIndentIds = new Set(
    projectPurchaseOrders.map((order) => order.sourceIndentId).filter(Boolean),
  );
  const activeIndents = indents.filter(
    (indent) =>
      indent.projectId === parsedProject.id &&
      ACTIVE_INDENT_STATUSES.has(indent.status),
  ).length;
  // Open orders, plus raised requests that haven't become an order yet
  // (counting both for the same indent would double-count one need).
  const pendingProcurement =
    projectPurchaseOrders.filter((order) =>
      OPEN_PURCHASE_ORDER_STATUSES.has(order.status),
    ).length +
    purchaseRequests.filter(
      (request) =>
        request.projectId === parsedProject.id &&
        OPEN_PURCHASE_REQUEST_STATUSES.has(request.status) &&
        !orderedIndentIds.has(request.sourceIndentId),
    ).length;

  return projectSummarySchema.parse({
    ...parsedProject,
    inventoryValue,
    lowStockAlerts,
    activeIndents,
    pendingProcurement,
  });
}

export async function summarizeProjects(projects) {
  const parsedProjects = projectsSchema.parse(projects);
  if (parsedProjects.length === 0) {
    return [];
  }
  const sources = await loadProjectMetricSources();
  const summaries = await Promise.all(
    parsedProjects.map((project) => summarizeProject(project, sources)),
  );
  return projectSummariesSchema.parse(summaries);
}

export class ProjectsServiceError extends Error {
  constructor(message, { cause, issues, status } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = "ProjectsServiceError";
    this.status = status;
    this.issues = issues;
  }
}

function toProjectsServiceError(error) {
  if (error instanceof HttpError) {
    return new ProjectsServiceError(
      typeof error.body?.error === "string"
        ? error.body.error
        : `The project request failed (${error.status})`,
      { issues: Array.isArray(error.body?.issues) ? error.body.issues : undefined, status: error.status },
    );
  }
  return new ProjectsServiceError("Unable to connect to project storage. Please try again.", {
    cause: error,
  });
}

/** Browser-safe adapter for the durable projects API. */
export const apiProjectsAdapter = {
  async list() {
    try {
      return await apiClient.get("/api/projects");
    } catch (error) {
      throw toProjectsServiceError(error);
    }
  },
  async get(projectId) {
    try {
      return await apiClient.get(`/api/projects/${encodeURIComponent(projectId)}`);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        return null;
      }
      throw toProjectsServiceError(error);
    }
  },
  async create(input) {
    try {
      return await apiClient.post("/api/projects", { body: input });
    } catch (error) {
      throw toProjectsServiceError(error);
    }
  },
  async updateProgress(projectId, input) {
    try {
      return await apiClient.patch(
        `/api/projects/${encodeURIComponent(projectId)}/progress`,
        { body: input },
      );
    } catch (error) {
      throw toProjectsServiceError(error);
    }
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
    // Mirrors the backend: code is generated, never supplied by the caller.
    const code = `SS-${String(mockProjects.length + 1).padStart(3, "0")}`;
    const project = projectSchema.parse({
      ...input,
      id: createMockProjectId(input.name),
      code,
      location: input.address.city,
    });
    mockProjects.unshift(project);
    return Promise.resolve(project);
  },
  updateProgress(projectId, { status, progressPercent }) {
    const index = mockProjects.findIndex((project) => project.id === projectId);
    if (index === -1) {
      return Promise.resolve(null);
    }
    mockProjects[index] = { ...mockProjects[index], status, progressPercent };
    return Promise.resolve(mockProjects[index]);
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
    async updateProgress(projectId, payload) {
      const input = updateProjectProgressInputSchema.parse(payload);
      const project = await adapter.updateProgress(projectId, input);
      return project ? summarizeProject(project) : null;
    },
  };
}

export const projectsService = createProjectsService(apiProjectsAdapter);
export { projectSchema };

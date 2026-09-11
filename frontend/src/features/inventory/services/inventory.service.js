import { PROJECTS } from "@/lib/mock-data/projects";
import { MATERIALS } from "@/lib/mock-data/materials";
import { getSubcategoryName } from "@/lib/mock-data/material-categories";
import {
  inventoryItemsSchema,
  inventoryListParamsSchema,
  inventoryListResultSchema,
} from "../schemas/inventory.schema";

/** Deterministic string hash so mock quantities are stable across renders. */
function hashSeed(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function mulberry32(seed) {
  let state = seed;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const activeProjects = PROJECTS.filter(
  (project) => project.status === "active" || project.status === "planning",
);
const STATUS_ROTATION = [
  "available",
  "available",
  "available",
  "reserved",
  "low-stock",
  "damaged",
  "under-inspection",
  "in-transit",
];
function buildInventoryItems() {
  const items = [];
  MATERIALS.forEach((material, materialIndex) => {
    const random = mulberry32(hashSeed(material.code));
    const projectCount = 2 + Math.floor(random() * 3);
    const shuffledProjects = [...activeProjects]
      .map((project) => ({
        project,
        sortKey: mulberry32(hashSeed(material.code + project.id))(),
      }))
      .sort((first, second) => first.sortKey - second.sortKey)
      .slice(0, Math.min(projectCount, activeProjects.length));
    shuffledProjects.forEach(({ project }, projectIndex) => {
      const rowSeed = mulberry32(hashSeed(`${material.code}:${project.id}`));
      const magnitude = material.reorderLevel * (0.4 + rowSeed() * 2.6);
      const statusRoll = rowSeed();
      const status =
        STATUS_ROTATION[Math.floor(statusRoll * STATUS_ROTATION.length)];
      const availableQuantity =
        status === "in-transit"
          ? 0
          : Math.round(
              (status === "low-stock"
                ? magnitude * 0.35
                : status === "damaged"
                  ? magnitude * 0.15
                  : magnitude) * 100,
            ) / 100;
      const reservedQuantity =
        status === "reserved"
          ? Math.round(availableQuantity * 0.4 * 100) / 100
          : Math.round(availableQuantity * (rowSeed() * 0.15) * 100) / 100;
      const dayOffset = Math.floor(rowSeed() * 30);
      const hourOffset = Math.floor(rowSeed() * 24);
      const updatedAt = new Date(
        Date.UTC(2026, 7, 5 + dayOffset, hourOffset, 0, 0),
      ).toISOString();
      items.push({
        id: `inv-${String(materialIndex).padStart(3, "0")}-${projectIndex}`,
        materialCode: material.code,
        materialName: material.name,
        category: getSubcategoryName(material.category, material.subcategory),
        projectId: project.id,
        projectName: project.name,
        unit: material.unit,
        availableQuantity,
        reservedQuantity,
        reorderLevel: material.reorderLevel,
        status,
        updatedAt,
      });
    });
  });
  return items;
}
const mockInventoryItems = inventoryItemsSchema.parse(buildInventoryItems());
function compareInventoryItems(first, second, field) {
  const firstValue = first[field];
  const secondValue = second[field];
  if (typeof firstValue === "number" && typeof secondValue === "number") {
    return firstValue - secondValue;
  }
  return String(firstValue).localeCompare(String(secondValue), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}
function matchesSearch(item, search) {
  if (!search) {
    return true;
  }
  const searchableText = [
    item.materialCode,
    item.materialName,
    item.category,
    item.projectName,
    item.unit,
    item.status.replaceAll("-", " "),
  ]
    .join(" ")
    .toLocaleLowerCase();
  return searchableText.includes(search.toLocaleLowerCase());
}
/**
 * Deterministic in-memory placeholder. Replace it with an HTTP implementation
 * of `InventoryAdapter`; the service and query hook need no transport changes.
 */
export const mockInventoryAdapter = {
  list(params, options) {
    options?.signal?.throwIfAborted();
    const filteredItems = mockInventoryItems.filter(
      (item) =>
        (params.projectId === null || item.projectId === params.projectId) &&
        (params.statuses.length === 0 ||
          params.statuses.includes(item.status)) &&
        matchesSearch(item, params.search),
    );
    const direction = params.sortDirection === "asc" ? 1 : -1;
    const sortedItems = [...filteredItems].sort(
      (first, second) =>
        compareInventoryItems(first, second, params.sortBy) * direction,
    );
    const start = (params.page - 1) * params.pageSize;
    return {
      items: sortedItems.slice(start, start + params.pageSize),
      total: sortedItems.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  },
  /** Non-paginated accessor used by cross-feature intelligence (indents, dashboard, reports). */
  listAll() {
    return mockInventoryItems;
  },
};
export function createInventoryService(adapter) {
  return {
    list(params = {}, options = {}) {
      const normalizedParams = inventoryListParamsSchema.parse(params);
      const result = adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return inventoryListResultSchema.parse(result);
    },
    listAll() {
      return adapter.listAll();
    },
  };
}
export const inventoryService = createInventoryService(mockInventoryAdapter);

import {
  resourceListParamsSchema,
  resourceListResultSchema,
  resourcesSchema,
} from "../schemas/resources.schema";

/**
 * Hand-authored, deterministic resource register spanning every category and
 * status the module needs to demonstrate. Unlike `materials`/`inventory`,
 * these are reusable physical assets — a water tanker or tower crane is
 * assigned, used, returned and reassigned, never consumed.
 */
const RESOURCES = [
  {
    id: "EXC-01",
    name: "Excavator (CAT 320D)",
    category: "machinery",
    specification: "20-tonne hydraulic excavator, 1.0 m³ bucket capacity",
    currentProjectId: "sita-heights",
    status: "assigned",
    assignedSince: "2026-07-01",
    lastMaintenanceDate: "2026-06-15",
    nextMaintenanceDueDate: "2026-09-15",
    dailyRentalCost: 18500,
  },
  {
    id: "EXC-02",
    name: "Excavator (JCB NXT)",
    category: "machinery",
    specification: "8-tonne mini hydraulic excavator, 0.3 m³ bucket",
    currentProjectId: "sita-enclave",
    status: "in-use",
    assignedSince: "2026-08-10",
    lastMaintenanceDate: "2026-07-20",
    nextMaintenanceDueDate: "2026-10-20",
    dailyRentalCost: 9500,
  },
  {
    id: "CM-01",
    name: "Concrete Mixer (10/7 Reversible)",
    category: "machinery",
    specification: "10/7 half-bag reversible drum mixer, diesel engine",
    currentProjectId: null,
    status: "available",
    assignedSince: null,
    lastMaintenanceDate: "2026-04-02",
    nextMaintenanceDueDate: "2026-10-02",
    dailyRentalCost: 1200,
  },
  {
    id: "CM-02",
    name: "Concrete Mixer (Self-loading 4m³)",
    category: "machinery",
    specification: "Self-loading transit mixer, 4 m³ drum capacity",
    currentProjectId: null,
    status: "under-maintenance",
    assignedSince: null,
    lastMaintenanceDate: "2026-08-20",
    nextMaintenanceDueDate: "2026-09-10",
    dailyRentalCost: 6500,
  },
  {
    id: "CM-03",
    name: "Concrete Mixer (10/7 Reversible)",
    category: "machinery",
    specification: "10/7 half-bag reversible drum mixer, diesel engine",
    currentProjectId: "sita-grove",
    status: "assigned",
    assignedSince: "2026-08-01",
    lastMaintenanceDate: "2026-06-01",
    nextMaintenanceDueDate: "2026-12-01",
    dailyRentalCost: 1200,
  },
  {
    id: "TC-01",
    name: "Tower Crane (Potain MC 85)",
    category: "machinery",
    specification: "Flat-top tower crane, 8-tonne max load, 50 m jib",
    currentProjectId: "sita-heights",
    status: "in-use",
    assignedSince: "2026-02-15",
    lastMaintenanceDate: "2026-08-01",
    nextMaintenanceDueDate: "2026-11-01",
    dailyRentalCost: 32000,
  },
  {
    id: "TC-02",
    name: "Tower Crane (Liebherr 132 EC-H)",
    category: "machinery",
    specification: "Luffing jib tower crane, 10-tonne max load",
    currentProjectId: "sita-enclave",
    status: "assigned",
    assignedSince: "2026-06-20",
    lastMaintenanceDate: "2026-05-05",
    nextMaintenanceDueDate: "2026-09-05",
    dailyRentalCost: 38000,
  },
  {
    id: "BH-01",
    name: "Backhoe Loader (JCB 3DX)",
    category: "machinery",
    specification: "4-in-1 bucket backhoe loader",
    currentProjectId: null,
    status: "available",
    assignedSince: null,
    lastMaintenanceDate: "2026-07-18",
    nextMaintenanceDueDate: "2027-01-18",
    dailyRentalCost: 7200,
  },
  {
    id: "WT-01",
    name: "Water Tanker (5,000 L)",
    category: "water-tanker",
    specification:
      "5,000-litre curing & dust-suppression tanker, Tata 1613 chassis",
    currentProjectId: "sita-heights",
    status: "in-use",
    assignedSince: "2026-08-15",
    lastMaintenanceDate: "2026-07-01",
    nextMaintenanceDueDate: "2026-10-01",
    dailyRentalCost: 3200,
  },
  {
    id: "WT-02",
    name: "Water Tanker (8,000 L)",
    category: "water-tanker",
    specification: "8,000-litre tanker, Ashok Leyland chassis",
    currentProjectId: "sita-grove",
    status: "assigned",
    assignedSince: "2026-07-25",
    lastMaintenanceDate: "2026-06-10",
    nextMaintenanceDueDate: "2026-09-10",
    dailyRentalCost: 4200,
  },
  {
    id: "WT-03",
    name: "Water Tanker (5,000 L)",
    category: "water-tanker",
    specification: "5,000-litre curing & dust-suppression tanker",
    currentProjectId: null,
    status: "available",
    assignedSince: null,
    lastMaintenanceDate: "2026-05-30",
    nextMaintenanceDueDate: "2026-11-30",
    dailyRentalCost: 3200,
  },
  {
    id: "WT-04",
    name: "Water Tanker (10,000 L)",
    category: "water-tanker",
    specification: "10,000-litre high-capacity tanker",
    currentProjectId: null,
    status: "under-maintenance",
    assignedSince: null,
    lastMaintenanceDate: "2026-08-25",
    nextMaintenanceDueDate: "2026-09-08",
    dailyRentalCost: 5000,
  },
  {
    id: "SCF-01",
    name: "Scaffolding Set (Cup-lock, 500 m²)",
    category: "scaffolding",
    specification: "Cup-lock modular scaffolding system, 500 m² coverage",
    currentProjectId: "sita-heights",
    status: "assigned",
    assignedSince: "2026-05-01",
    lastMaintenanceDate: "2026-03-01",
    nextMaintenanceDueDate: "2026-12-01",
    dailyRentalCost: 4500,
  },
  {
    id: "SCF-02",
    name: "Scaffolding Set (H-frame, 350 m²)",
    category: "scaffolding",
    specification: "H-frame scaffolding with plank decking, 350 m² coverage",
    currentProjectId: "sita-enclave",
    status: "in-use",
    assignedSince: "2026-06-15",
    lastMaintenanceDate: "2026-04-15",
    nextMaintenanceDueDate: "2026-10-15",
    dailyRentalCost: 3200,
  },
  {
    id: "SCF-03",
    name: "Scaffolding Set (Cup-lock, 400 m²)",
    category: "scaffolding",
    specification: "Cup-lock modular scaffolding system, 400 m² coverage",
    currentProjectId: null,
    status: "available",
    assignedSince: null,
    lastMaintenanceDate: "2026-07-05",
    nextMaintenanceDueDate: "2027-01-05",
    dailyRentalCost: 3800,
  },
  {
    id: "SCF-04",
    name: "Scaffolding Set (H-frame, 300 m²)",
    category: "scaffolding",
    specification: "H-frame scaffolding, corrosion damage under assessment",
    currentProjectId: null,
    status: "unavailable",
    assignedSince: null,
    lastMaintenanceDate: "2026-01-10",
    nextMaintenanceDueDate: "2026-09-30",
    dailyRentalCost: 3000,
  },
  {
    id: "VEH-01",
    name: "Pickup Truck (Tata Ace)",
    category: "vehicle",
    specification: "1-tonne material transport pickup",
    currentProjectId: "sita-crest",
    status: "assigned",
    assignedSince: "2026-08-05",
    lastMaintenanceDate: "2026-05-20",
    nextMaintenanceDueDate: "2026-11-20",
    dailyRentalCost: 1800,
  },
  {
    id: "VEH-02",
    name: "Tipper Truck (Ashok Leyland 2518)",
    category: "vehicle",
    specification: "16-tonne tipper for debris & aggregate haulage",
    currentProjectId: "sita-meridian",
    status: "in-use",
    assignedSince: "2026-07-12",
    lastMaintenanceDate: "2026-06-25",
    nextMaintenanceDueDate: "2026-09-25",
    dailyRentalCost: 5200,
  },
  {
    id: "VEH-03",
    name: "Site Supervisor SUV (Mahindra Bolero)",
    category: "vehicle",
    specification: "Site inspection & supervisor transport vehicle",
    currentProjectId: null,
    status: "available",
    assignedSince: null,
    lastMaintenanceDate: "2026-06-01",
    nextMaintenanceDueDate: "2026-12-01",
    dailyRentalCost: 2200,
  },
  {
    id: "EQ-01",
    name: "Diesel Generator (125 kVA)",
    category: "equipment",
    specification: "Silent diesel generator, 125 kVA prime power",
    currentProjectId: "sita-heights",
    status: "assigned",
    assignedSince: "2026-04-15",
    lastMaintenanceDate: "2026-07-01",
    nextMaintenanceDueDate: "2026-10-01",
    dailyRentalCost: 5500,
  },
  {
    id: "EQ-02",
    name: "Diesel Generator (62.5 kVA)",
    category: "equipment",
    specification: "Silent diesel generator, 62.5 kVA prime power",
    currentProjectId: null,
    status: "under-maintenance",
    assignedSince: null,
    lastMaintenanceDate: "2026-08-28",
    nextMaintenanceDueDate: "2026-09-12",
    dailyRentalCost: 3200,
  },
  {
    id: "TL-01",
    name: "Power Tool Kit (Bosch)",
    category: "tool",
    specification: "Rebar cutter, drill and angle grinder kit",
    currentProjectId: "sita-grove",
    status: "assigned",
    assignedSince: "2026-08-10",
    lastMaintenanceDate: "2026-05-15",
    nextMaintenanceDueDate: "2026-11-15",
    dailyRentalCost: 650,
  },
  {
    id: "TL-02",
    name: "Welding Machine Set",
    category: "tool",
    specification: "Arc welding machine with electrode holder set",
    currentProjectId: null,
    status: "unavailable",
    assignedSince: null,
    lastMaintenanceDate: "2025-11-05",
    nextMaintenanceDueDate: "2026-09-04",
    dailyRentalCost: 900,
  },
];

const mockResources = resourcesSchema.parse(RESOURCES);

function matchesSearch(resource, search) {
  if (!search) return true;
  const haystack = [
    resource.id,
    resource.name,
    resource.category.replaceAll("-", " "),
    resource.specification,
    resource.status.replaceAll("-", " "),
  ]
    .join(" ")
    .toLocaleLowerCase();
  return haystack.includes(search.toLocaleLowerCase());
}
function compareResources(first, second, field) {
  const firstValue = first[field];
  const secondValue = second[field];
  if (firstValue === null && secondValue === null) return 0;
  if (firstValue === null) return 1;
  if (secondValue === null) return -1;
  if (typeof firstValue === "number" && typeof secondValue === "number") {
    return firstValue - secondValue;
  }
  return String(firstValue).localeCompare(String(secondValue), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

/**
 * Deterministic in-memory placeholder. Replace it with an HTTP implementation
 * of the resource adapter; the service and query hooks need no transport
 * changes.
 */
export const mockResourcesAdapter = {
  list(params, options) {
    options?.signal?.throwIfAborted();
    const filteredResources = mockResources.filter(
      (resource) =>
        (!params.category || resource.category === params.category) &&
        (!params.status || resource.status === params.status) &&
        (!params.projectId || resource.currentProjectId === params.projectId) &&
        matchesSearch(resource, params.search),
    );
    const direction = params.sortDirection === "asc" ? 1 : -1;
    const sortedResources = [...filteredResources].sort(
      (first, second) =>
        compareResources(first, second, params.sortBy) * direction,
    );
    const start = (params.page - 1) * params.pageSize;
    return {
      items: sortedResources.slice(start, start + params.pageSize),
      total: sortedResources.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  },
  get(resourceId) {
    return mockResources.find((resource) => resource.id === resourceId) ?? null;
  },
  /** Non-paginated accessor used by the detail screen and cross-feature reads. */
  listAll() {
    return mockResources;
  },
};

export function createResourcesService(adapter) {
  return {
    list(params = {}, options = {}) {
      const normalizedParams = resourceListParamsSchema.parse(params);
      const result = adapter.list(normalizedParams, options);
      options.signal?.throwIfAborted();
      return resourceListResultSchema.parse(result);
    },
    get(resourceId) {
      const resource = adapter.get(resourceId);
      return resource ? resourcesSchema.element.parse(resource) : null;
    },
    listAll() {
      return adapter.listAll();
    },
  };
}
export const resourcesService = createResourcesService(mockResourcesAdapter);

import { PROJECT_OPTIONS } from "../../config/constants";

/**
 * Enriches the canonical `PROJECT_OPTIONS` identifiers (shared with the
 * project switcher) with the additional fields the projects feature and
 * project-scoped modules need. `id` stays the single join key every other
 * mock dataset uses to reference a project.
 */
const PROJECT_DETAILS = {
  "sita-heights": {
    projectManagerId: "usr-manoj-verma",
    startDate: "2025-01-12",
    estimatedCompletionDate: "2027-03-31",
    progressPercent: 72,
    description: "Twin-tower premium residential development, Tower A-D.",
    address: {
      line1: "Plot 14, Financial District",
      line2: "Gachibowli",
      landmark: "Near Wipro Circle",
      city: "Hyderabad",
      state: "Telangana",
      postalCode: "500032",
      country: "India",
    },
  },
  "sita-enclave": {
    projectManagerId: "usr-manoj-verma",
    startDate: "2025-04-01",
    estimatedCompletionDate: "2027-09-30",
    progressPercent: 58,
    description: "Mixed-use residential enclave with retail podium.",
    address: {
      line1: "Survey No. 82/4, Sarjapur Main Road",
      line2: "Kaikondrahalli",
      landmark: "Opposite Wipro Corporate Office",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560035",
      country: "India",
    },
  },
  "sita-greens": {
    projectManagerId: "usr-sneha-kapoor",
    startDate: "2026-06-01",
    estimatedCompletionDate: "2028-12-31",
    progressPercent: 6,
    description: "Low-rise villa community around a central green.",
    address: {
      line1: "Plot 31, Phase 2 Road",
      line2: "Hinjewadi Rajiv Gandhi Infotech Park",
      landmark: "Near Maan Road Junction",
      city: "Pune",
      state: "Maharashtra",
      postalCode: "411057",
      country: "India",
    },
  },
  "sita-grove": {
    projectManagerId: "usr-sneha-kapoor",
    startDate: "2024-11-15",
    estimatedCompletionDate: "2026-12-31",
    progressPercent: 48,
    description: "Phase II high-rise apartments with clubhouse.",
    address: {
      line1: "Site 19, ECC Road",
      line2: "Whitefield",
      landmark: "Near Deens Academy",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560066",
      country: "India",
    },
  },
  "sita-meridian": {
    projectManagerId: "usr-sneha-kapoor",
    startDate: "2025-02-20",
    estimatedCompletionDate: "2027-06-30",
    progressPercent: 31,
    description: "Blocks 1-3 of a gated mid-rise community.",
    address: {
      line1: "Survey No. 116/2, Baner Road",
      line2: "Baner",
      landmark: "Behind High Street",
      city: "Pune",
      state: "Maharashtra",
      postalCode: "411045",
      country: "India",
    },
  },
  "sita-crest": {
    projectManagerId: "usr-manoj-verma",
    startDate: "2025-07-01",
    estimatedCompletionDate: "2027-12-31",
    progressPercent: 24,
    description: "Waterfront residential towers with retail frontage.",
    address: {
      line1: "Plot 7, Rajiv Gandhi Salai",
      line2: "Sholinganallur",
      landmark: "Near Sholinganallur Junction",
      city: "Chennai",
      state: "Tamil Nadu",
      postalCode: "600119",
      country: "India",
    },
  },
  "sita-orchid": {
    projectManagerId: "usr-sneha-kapoor",
    startDate: "2025-09-10",
    estimatedCompletionDate: "2028-03-31",
    progressPercent: 14,
    description:
      "Boutique residential project, currently on hold pending approvals.",
    address: {
      line1: "Site 42, Sathy Road",
      line2: "Saravanampatti",
      landmark: "Near Kumaraguru College",
      city: "Coimbatore",
      state: "Tamil Nadu",
      postalCode: "641035",
      country: "India",
    },
  },
  "sita-riviera": {
    projectManagerId: "usr-manoj-verma",
    startDate: "2022-05-01",
    estimatedCompletionDate: "2025-08-15",
    progressPercent: 100,
    description: "Completed beachside residential development, handed over.",
    address: {
      line1: "Door No. 7-14, Beach Road",
      line2: "Maharani Peta",
      landmark: "Near VMRDA Park",
      city: "Visakhapatnam",
      state: "Andhra Pradesh",
      postalCode: "530002",
      country: "India",
    },
  },
};
export const PROJECTS = PROJECT_OPTIONS.map((project) => ({
  ...project,
  ...PROJECT_DETAILS[project.id],
}));
export function getProjectById(projectId) {
  return PROJECTS.find((project) => project.id === projectId) ?? null;
}
export function getProjectName(projectId) {
  return getProjectById(projectId)?.name ?? projectId;
}

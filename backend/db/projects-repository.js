import { env } from "cloudflare:workers";

const CREATE_PROJECTS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY NOT NULL,
    code TEXT COLLATE NOCASE NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('planning', 'active', 'on-hold', 'completed')),
    project_manager_id TEXT NOT NULL,
    start_date TEXT NOT NULL,
    estimated_completion_date TEXT NOT NULL,
    progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    description TEXT NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    landmark TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

const CREATE_PROJECT_CODE_INDEX_SQL = `
  CREATE UNIQUE INDEX IF NOT EXISTS projects_code_unique
  ON projects (code COLLATE NOCASE)
`;

const PROJECT_COLUMNS = `
  id,
  code,
  name,
  status,
  project_manager_id,
  start_date,
  estimated_completion_date,
  progress_percent,
  description,
  address_line_1,
  address_line_2,
  landmark,
  city,
  state,
  postal_code,
  country,
  created_at,
  updated_at
`;

const INSERT_PROJECT_SQL = `
  INSERT INTO projects (${PROJECT_COLUMNS})
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const INSERT_SEED_PROJECT_SQL = `
  INSERT OR IGNORE INTO projects (${PROJECT_COLUMNS})
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const SELECT_PROJECTS_SQL = `
  SELECT ${PROJECT_COLUMNS}
  FROM projects
  ORDER BY created_at DESC, name COLLATE NOCASE ASC
`;

const SELECT_PROJECT_BY_ID_SQL = `
  SELECT ${PROJECT_COLUMNS}
  FROM projects
  WHERE id = ?
  LIMIT 1
`;

const PROJECT_SEEDS = [
  {
    id: "sita-heights",
    code: "SS-001",
    name: "SITA Heights",
    status: "active",
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
    createdAt: "2025-01-08T00:00:00.000Z",
  },
  {
    id: "sita-enclave",
    code: "SS-002",
    name: "SITA Enclave",
    status: "active",
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
    createdAt: "2025-01-07T00:00:00.000Z",
  },
  {
    id: "sita-greens",
    code: "SS-003",
    name: "SITA Greens",
    status: "planning",
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
    createdAt: "2025-01-06T00:00:00.000Z",
  },
  {
    id: "sita-grove",
    code: "SS-004",
    name: "SITA Grove",
    status: "active",
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
    createdAt: "2025-01-05T00:00:00.000Z",
  },
  {
    id: "sita-meridian",
    code: "SS-005",
    name: "SITA Meridian",
    status: "active",
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
    createdAt: "2025-01-04T00:00:00.000Z",
  },
  {
    id: "sita-crest",
    code: "SS-006",
    name: "SITA Crest",
    status: "active",
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
    createdAt: "2025-01-03T00:00:00.000Z",
  },
  {
    id: "sita-orchid",
    code: "SS-007",
    name: "SITA Orchid",
    status: "on-hold",
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
    createdAt: "2025-01-02T00:00:00.000Z",
  },
  {
    id: "sita-riviera",
    code: "SS-008",
    name: "SITA Riviera",
    status: "completed",
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
    createdAt: "2025-01-01T00:00:00.000Z",
  },
];

const initializationByDatabase = new WeakMap();

export class DuplicateProjectCodeError extends Error {
  constructor(code) {
    super(`A project with code ${code} already exists`);
    this.name = "DuplicateProjectCodeError";
    this.code = code;
  }
}

export class ProjectsDatabaseUnavailableError extends Error {
  constructor() {
    super(
      "Cloudflare D1 binding `DB` is unavailable. Set `d1` to `DB` in .openai/hosting.json.",
    );
    this.name = "ProjectsDatabaseUnavailableError";
  }
}

function getDatabase() {
  const database = env.DB;
  if (!database || typeof database.prepare !== "function") {
    throw new ProjectsDatabaseUnavailableError();
  }
  return database;
}

function projectValues(project, timestamp = project.createdAt) {
  return [
    project.id,
    project.code.toLocaleUpperCase(),
    project.name,
    project.status,
    project.projectManagerId,
    project.startDate,
    project.estimatedCompletionDate,
    project.progressPercent,
    project.description,
    project.address.line1,
    project.address.line2 || null,
    project.address.landmark || null,
    project.address.city,
    project.address.state,
    project.address.postalCode,
    project.address.country,
    timestamp,
    timestamp,
  ];
}

function mapProjectRow(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    location: row.city,
    status: row.status,
    projectManagerId: row.project_manager_id,
    startDate: row.start_date,
    estimatedCompletionDate: row.estimated_completion_date,
    progressPercent: Number(row.progress_percent),
    description: row.description,
    address: {
      line1: row.address_line_1,
      ...(row.address_line_2 ? { line2: row.address_line_2 } : {}),
      ...(row.landmark ? { landmark: row.landmark } : {}),
      city: row.city,
      state: row.state,
      postalCode: row.postal_code,
      country: row.country,
    },
  };
}

function errorMessages(error) {
  const messages = [];
  const seen = new Set();
  let current = error;
  while (current && !seen.has(current)) {
    seen.add(current);
    if (current instanceof Error) {
      messages.push(current.message);
      current = current.cause;
    } else {
      messages.push(String(current));
      break;
    }
  }
  return messages.join("\n");
}

function isDuplicateCodeError(error) {
  const message = errorMessages(error);
  return (
    /UNIQUE constraint failed:\s*projects\.code/i.test(message) ||
    /projects_code_unique/i.test(message)
  );
}

async function initializeDatabase(database) {
  await database.prepare(CREATE_PROJECTS_TABLE_SQL).run();
  await database.prepare(CREATE_PROJECT_CODE_INDEX_SQL).run();
  await database.batch(
    PROJECT_SEEDS.map((project) =>
      database.prepare(INSERT_SEED_PROJECT_SQL).bind(...projectValues(project)),
    ),
  );
  await database.prepare("PRAGMA optimize").run();
}

async function ensureDatabase(database) {
  let initialization = initializationByDatabase.get(database);
  if (!initialization) {
    initialization = initializeDatabase(database).catch((error) => {
      initializationByDatabase.delete(database);
      throw error;
    });
    initializationByDatabase.set(database, initialization);
  }
  await initialization;
}

export async function listProjects() {
  const database = getDatabase();
  await ensureDatabase(database);
  const result = await database.prepare(SELECT_PROJECTS_SQL).all();
  return (result.results ?? []).map(mapProjectRow);
}

export async function getProject(projectId) {
  const database = getDatabase();
  await ensureDatabase(database);
  const row = await database
    .prepare(SELECT_PROJECT_BY_ID_SQL)
    .bind(projectId)
    .first();
  return mapProjectRow(row);
}

export async function createProject(input) {
  const database = getDatabase();
  await ensureDatabase(database);

  const timestamp = new Date().toISOString();
  const project = {
    ...input,
    id: crypto.randomUUID(),
    code: input.code.toLocaleUpperCase(),
  };

  try {
    await database
      .prepare(INSERT_PROJECT_SQL)
      .bind(...projectValues(project, timestamp))
      .run();
  } catch (error) {
    if (isDuplicateCodeError(error)) {
      throw new DuplicateProjectCodeError(project.code);
    }
    throw error;
  }

  return getProject(project.id);
}

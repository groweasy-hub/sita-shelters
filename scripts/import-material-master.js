const fs = require("fs");
const path = require("path");

const sourcePath =
  "C:/Users/shiva/.codex/attachments/1bf9e0b2-f061-456c-8285-db82d4114a88/pasted-text.txt";

const raw = fs.readFileSync(sourcePath, "utf8").replace(/^\uFEFF/, "");
const lines = raw.trimEnd().split(/\r?\n/);
const headers = lines.shift().split("\t");

function slugify(value) {
  return (
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "general"
  );
}

function clean(value) {
  return String(value || "").trim();
}

function numberValue(value) {
  return Number(String(value || "0").replace(/,/g, "")) || 0;
}

const rows = lines
  .map((line) => {
    const values = line.split("\t");
    return Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    );
  })
  .filter((row) => row["S.NO"] && row["Item Name"]);

const materialRows = rows.map((row) => {
  const serial = Number(row["S.NO"]);
  const gstRaw = clean(row["GST %"]).replace("%", "");
  const gstRate = gstRaw === "" ? null : Number(gstRaw);
  const specification = [
    row.Manufacturer && `Manufacturer: ${clean(row.Manufacturer)}`,
    row["Item Type"] && `Type: ${clean(row["Item Type"])}`,
    row.Packing && `Packing: ${clean(row.Packing)}`,
    row["HSN/SAC Code"] && `HSN/SAC: ${clean(row["HSN/SAC Code"])}`,
    row["GST %"] && `GST: ${clean(row["GST %"])}`,
  ].filter(Boolean);

  return {
    id: `mat-master-${String(serial).padStart(4, "0")}`,
    code: `MAT-${String(serial).padStart(4, "0")}`,
    name: clean(row["Item Name"]),
    category: slugify(row.Category),
    subcategory: slugify(row["Sub Category"]),
    unit: clean(row.Unit) || "NOS",
    specification: specification.join(" | "),
    manufacturer: clean(row.Manufacturer),
    itemType: clean(row["Item Type"]),
    hsnSacCode: clean(row["HSN/SAC Code"]),
    gstRate: Number.isFinite(gstRate) ? gstRate : null,
    packing: clean(row.Packing),
    approvedVendorIds: [],
    reorderLevel: numberValue(row["Reorder Level"]),
    lastPurchasePrice: numberValue(row.MRP),
    status: clean(row.Active).toLowerCase() === "yes" ? "active" : "inactive",
  };
});

const importedMaterials = `// Generated from the pasted construction material master. Keep codes stable: MAT-0001 maps to source S.NO 1.
export const IMPORTED_MATERIALS = ${JSON.stringify(materialRows, null, 2)};
`;

fs.writeFileSync(
  path.join("frontend", "src", "lib", "mock-data", "imported-materials.js"),
  importedMaterials,
  "utf8",
);

const categories = new Map();
for (const row of rows) {
  const categoryId = slugify(row.Category);
  const subcategoryId = slugify(row["Sub Category"]);
  if (!categories.has(categoryId)) {
    categories.set(categoryId, {
      id: categoryId,
      name: clean(row.Category),
      subcategories: new Map(),
    });
  }
  categories.get(categoryId).subcategories.set(subcategoryId, {
    id: subcategoryId,
    name: clean(row["Sub Category"]),
  });
}

const importedCategories = [...categories.values()].map((category) => ({
  id: category.id,
  name: category.name,
  subcategories: [...category.subcategories.values()],
}));

const legacyCategories = [
  {
    id: "civil",
    name: "Civil",
    subcategories: [
      { id: "cement", name: "Cement" },
      { id: "sand", name: "Sand" },
      { id: "steel", name: "Steel" },
      { id: "aggregate", name: "Aggregate" },
      { id: "bricks", name: "Bricks" },
    ],
  },
  {
    id: "fire-safety",
    name: "Fire & Safety",
    subcategories: [
      { id: "fire-pipes", name: "Fire Pipes" },
      { id: "fire-pumps", name: "Fire Pumps" },
      { id: "sprinklers", name: "Sprinklers" },
    ],
  },
  {
    id: "finishing",
    name: "Finishing",
    subcategories: [
      { id: "tiles", name: "Tiles" },
      { id: "paint", name: "Paint" },
      { id: "doors", name: "Doors" },
    ],
  },
  {
    id: "equipment",
    name: "Equipment",
    subcategories: [
      { id: "water-tankers", name: "Water Tankers" },
      { id: "machinery", name: "Machinery" },
      { id: "tools", name: "Tools" },
    ],
  },
];

const categoryTree = [...importedCategories];
for (const category of legacyCategories) {
  if (!categoryTree.some((candidate) => candidate.id === category.id)) {
    categoryTree.push(category);
  }
}

const categoryFile = `/**
 * Canonical material category tree. Every material record references one of
 * these category/subcategory pairs, and the materials feature renders this
 * tree directly on \`/materials/categories\`.
 */
export const MATERIAL_CATEGORY_TREE = ${JSON.stringify(categoryTree, null, 2)};
export const MATERIAL_CATEGORY_OPTIONS = MATERIAL_CATEGORY_TREE.map(
  (category) => ({ id: category.id, name: category.name }),
);
export function getCategoryName(categoryId) {
  return (
    MATERIAL_CATEGORY_TREE.find((category) => category.id === categoryId)
      ?.name ?? categoryId
  );
}
export function getSubcategoryName(categoryId, subcategoryId) {
  const category = MATERIAL_CATEGORY_TREE.find(
    (candidate) => candidate.id === categoryId,
  );
  return (
    category?.subcategories.find(
      (subcategory) => subcategory.id === subcategoryId,
    )?.name ?? subcategoryId
  );
}
`;

fs.writeFileSync(
  path.join("frontend", "src", "lib", "mock-data", "material-categories.js"),
  categoryFile,
  "utf8",
);

console.log(
  `Generated ${materialRows.length} imported materials and ${categoryTree.length} categories.`,
);

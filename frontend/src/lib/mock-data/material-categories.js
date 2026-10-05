/**
 * Canonical material category tree. Every material record references one of
 * these category/subcategory pairs, and the materials feature renders this
 * tree directly on `/materials/categories`.
 */
export const MATERIAL_CATEGORY_TREE = [
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
    id: "electrical",
    name: "Electrical",
    subcategories: [
      { id: "wires", name: "Wires" },
      { id: "switches", name: "Switches" },
      { id: "switchboards", name: "Switchboards" },
      { id: "panel-boxes", name: "Panel Boxes" },
      { id: "lights", name: "Lights" },
    ],
  },
  {
    id: "plumbing",
    name: "Plumbing",
    subcategories: [
      { id: "upvc-pipes", name: "UPVC Pipes" },
      { id: "cpvc-pipes", name: "CPVC Pipes" },
      { id: "fittings", name: "Fittings" },
      { id: "valves", name: "Valves" },
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

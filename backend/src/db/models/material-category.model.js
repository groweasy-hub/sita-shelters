import mongoose from "mongoose";

// Two-level tree: top-level categories have parentId null; subcategories
// point at their parent's id. Mirrors MATERIAL_CATEGORY_TREE.
const materialCategorySchema = new mongoose.Schema(
  {
    _id: { type: String },
    parentId: { type: String, default: null, ref: "MaterialCategory" },
    name: { type: String, required: true },
  },
  { versionKey: false },
);

export const MaterialCategory =
  mongoose.models.MaterialCategory ?? mongoose.model("MaterialCategory", materialCategorySchema);

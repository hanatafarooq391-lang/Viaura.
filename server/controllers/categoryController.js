import { supabase } from "../config/supabase.js";
import { uploadImageToSupabase } from "../utils/uploadImage.js";

// Column aliasing (right:left) - "group" is a reserved-ish word so DB column is
// "group_name" but API output keeps the old "group" name the frontend already expects.
const SELECT = "_id:id, name, slug, group:group_name, image, description, isActive:is_active, createdAt:created_at";

// @route GET /api/categories?group=men
export const getCategories = async (req, res) => {
  let query = supabase.from("categories").select(SELECT).eq("is_active", true).order("created_at", { ascending: false });
  if (req.query.group) query = query.eq("group_name", req.query.group);

  const { data, error } = await query;
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
};

// @route POST /api/categories (admin)
export const createCategory = async (req, res) => {
  try {
    const { name, group, description } = req.body;
    if (!name || !group) return res.status(400).json({ message: "Naam aur group (men/women/kids) zaroori hai" });

    const image = req.file ? await uploadImageToSupabase(req.file) : "";
    const slug = `${name}-${group}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const { data, error } = await supabase
      .from("categories")
      .insert({ name, group_name: group, description: description || "", image, slug })
      .select(SELECT)
      .single();

    if (error) return res.status(500).json({ message: error.message });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/categories/:id (admin)
export const updateCategory = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.group) updates.group_name = req.body.group;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.isActive !== undefined) updates.is_active = req.body.isActive;
    if (req.file) updates.image = await uploadImageToSupabase(req.file);

    const { data, error } = await supabase.from("categories").update(updates).eq("id", req.params.id).select(SELECT).single();
    if (error || !data) return res.status(404).json({ message: "Category nahi mili" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/categories/:id (admin)
export const deleteCategory = async (req, res) => {
  const { error } = await supabase.from("categories").delete().eq("id", req.params.id);
  if (error) return res.status(404).json({ message: "Category nahi mili" });
  res.json({ message: "Category delete ho gayi" });
};

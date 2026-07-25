import { supabase } from "../config/supabase.js";
import { uploadImageToSupabase } from "../utils/uploadImage.js";

const SELECT =
  "_id:id, name, description, images, group:group_name, price, discountPrice:discount_price, sizes, colors, stock, ratingsAverage:ratings_average, numReviews:num_reviews, isActive:is_active, createdAt:created_at, category:categories(_id:id, name, group:group_name)";

// @route GET /api/products?group=men&category=<id>&search=shirt&page=1&limit=12
export const getProducts = async (req, res) => {
  const { group, category, search, minPrice, maxPrice } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select(SELECT, { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (group) query = query.eq("group_name", group);
  if (category) query = query.eq("category_id", category);
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  if (minPrice) query = query.gte("price", Number(minPrice));
  if (maxPrice) query = query.lte("price", Number(maxPrice));

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ message: error.message });

  res.json({ products: data, page, pages: Math.ceil((count || 0) / limit), total: count || 0 });
};

// @route GET /api/products/:id
export const getProductById = async (req, res) => {
  const { data, error } = await supabase.from("products").select(SELECT).eq("id", req.params.id).single();
  if (error || !data) return res.status(404).json({ message: "Product nahi mila" });
  res.json(data);
};

// @route POST /api/products (admin)
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, group, price, discountPrice, stock, sizes, colors } = req.body;

    if (!name || !description || !category || !group || !price) {
      return res.status(400).json({ message: "Zaroori fields missing hain" });
    }

    const files = req.files || [];
    if (files.length === 0) return res.status(400).json({ message: "Kam az kam ek image zaroori hai" });

    const images = [];
    for (const f of files) images.push(await uploadImageToSupabase(f));

    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        description,
        category_id: category,
        group_name: group,
        price: Number(price),
        discount_price: Number(discountPrice) || 0,
        stock: Number(stock) || 0,
        sizes: sizes ? sizes.split(",").map((s) => s.trim()) : [],
        colors: colors ? colors.split(",").map((c) => c.trim()) : [],
        images,
      })
      .select(SELECT)
      .single();

    if (error) return res.status(500).json({ message: error.message });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/products/:id (admin)
export const updateProduct = async (req, res) => {
  try {
    const updates = {};
    const b = req.body;
    if (b.name !== undefined) updates.name = b.name;
    if (b.description !== undefined) updates.description = b.description;
    if (b.category !== undefined) updates.category_id = b.category;
    if (b.group !== undefined) updates.group_name = b.group;
    if (b.price !== undefined) updates.price = Number(b.price);
    if (b.discountPrice !== undefined) updates.discount_price = Number(b.discountPrice) || 0;
    if (b.stock !== undefined) updates.stock = Number(b.stock);
    if (b.isActive !== undefined) updates.is_active = b.isActive;
    if (b.sizes) updates.sizes = b.sizes.split(",").map((s) => s.trim());
    if (b.colors) updates.colors = b.colors.split(",").map((c) => c.trim());

    if (req.files && req.files.length > 0) {
      const images = [];
      for (const f of req.files) images.push(await uploadImageToSupabase(f));
      updates.images = images;
    }

    const { data, error } = await supabase.from("products").update(updates).eq("id", req.params.id).select(SELECT).single();
    if (error || !data) return res.status(404).json({ message: "Product nahi mila" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/products/:id (admin)
export const deleteProduct = async (req, res) => {
  const { error } = await supabase.from("products").delete().eq("id", req.params.id);
  if (error) return res.status(404).json({ message: "Product nahi mila" });
  res.json({ message: "Product delete ho gaya" });
};

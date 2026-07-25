import { supabase } from "../config/supabase.js";

const recalcProductRating = async (productId) => {
  const { data: reviews } = await supabase.from("reviews").select("rating").eq("product_id", productId);
  const numReviews = reviews?.length || 0;
  const ratingsAverage = numReviews ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews : 0;

  await supabase
    .from("products")
    .update({ num_reviews: numReviews, ratings_average: Math.round(ratingsAverage * 10) / 10 })
    .eq("id", productId);

  return { numReviews, ratingsAverage };
};

// @route GET /api/products/:productId/reviews
export const getProductReviews = async (req, res) => {
  const { data, error } = await supabase
    .from("reviews")
    .select("_id:id, name, rating, comment, createdAt:created_at")
    .eq("product_id", req.params.productId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
};

// @route POST /api/products/:productId/reviews (guest - no login required)
export const addReview = async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    const productId = req.params.productId;

    if (!name || !rating || !comment) {
      return res.status(400).json({ message: "Naam, rating aur comment zaroori hain" });
    }

    const { data: product } = await supabase.from("products").select("id").eq("id", productId).single();
    if (!product) return res.status(404).json({ message: "Product nahi mila" });

    const { data, error } = await supabase
      .from("reviews")
      .insert({ product_id: productId, name, rating, comment })
      .select("_id:id, name, rating, comment, createdAt:created_at")
      .single();

    if (error) return res.status(500).json({ message: error.message });

    await recalcProductRating(productId);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/products/:productId/reviews/:reviewId (admin only)
export const deleteReview = async (req, res) => {
  const { error } = await supabase.from("reviews").delete().eq("id", req.params.reviewId);
  if (error) return res.status(404).json({ message: "Review nahi mila" });

  await recalcProductRating(req.params.productId);
  res.json({ message: "Review delete ho gaya" });
};

import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { getProductReviews, addReview, deleteReview } from "../controllers/reviewController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", protect, admin, upload.array("images", 6), createProduct);
router.get("/:id", getProductById);
router.put("/:id", protect, admin, upload.array("images", 6), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

// Reviews (guest — no login required)
router.get("/:productId/reviews", getProductReviews);
router.post("/:productId/reviews", addReview);
router.delete("/:productId/reviews/:reviewId", protect, admin, deleteReview);

export default router;

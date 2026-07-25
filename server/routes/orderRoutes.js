import express from "express";
import {
  createOrder,
  lookupOrdersByPhone,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Guest checkout — no login required
router.post("/", createOrder);
router.post("/lookup", lookupOrdersByPhone);
router.get("/:id", getOrderById);

// Admin only
router.get("/", protect, admin, getAllOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);

export default router;

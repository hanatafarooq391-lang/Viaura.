import express from "express";
import { getDashboardStats, getCustomers } from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, admin, getDashboardStats);
router.get("/customers", protect, admin, getCustomers);

export default router;

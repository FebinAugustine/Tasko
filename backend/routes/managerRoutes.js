// backend/routes/managerRoutes.js
import express from "express";
import { getManagerDashboard } from "../controllers/managerController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  authorizeRoles("manager", "admin"),
  getManagerDashboard
);

export default router;

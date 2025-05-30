// backend/routes/userRoutes.js
import express from "express";
import { getUserDashboard } from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  authorizeRoles("user", "manager", "admin"),
  getUserDashboard
);

export default router;

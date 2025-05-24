// backend/routes/adminRoutes.js
import express from "express";
import {
  getAdminDashboard,
  updateUserRole,
} from "../controllers/adminController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, authorizeRoles("admin"), getAdminDashboard);
router.put("/users/:id/role", protect, authorizeRoles("admin"), updateUserRole); // Example of admin-specific route

export default router;

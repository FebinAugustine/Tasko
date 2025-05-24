import express from "express"; // No .js needed for npm packages
import {
  getUsers,
  getUserById,
  updateUserRole,
  uploadProfilePicture,
  deleteUser,
} from "../controllers/userController.js"; // Note the .js extension
import { protect, authorize } from "../middlewares/authMiddleware.js"; // Note the .js extension

const router = express.Router();

// Routes for Admin-level user management
// All these routes require authentication (`protect`) and specific roles (`authorize`)

// @route   GET /api/v1/admin/users
// @access  Private/Admin, Manager (depending on implementation, here we made it Admin/Manager)
router.get("/admin/users", protect, authorize("admin", "manager"), getUsers);

// @route   GET /api/v1/users/:id (for a specific user profile by ID, accessible by admin/manager or self)
// @access  Private/Admin, Manager, or self
router.get("/users/:id", protect, getUserById);

// @route   PUT /api/v1/admin/users/:id/role
// @access  Private/Admin
router.put(
  "/admin/users/:id/role",
  protect,
  authorize("admin"),
  updateUserRole
);

// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
router.delete("/admin/users/:id", protect, authorize("admin"), deleteUser);

// User profile picture upload route (accessible by any authenticated user for their own profile)
// @route   POST /api/v1/users/upload-profile-picture
// @access  Private
router.post("/users/upload-profile-picture", protect, uploadProfilePicture);

export default router;

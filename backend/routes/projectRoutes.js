// backend/routes/projectRoutes.js
import express from "express"; // No .js needed for npm packages
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js"; // Note the .js extension
import { protect, authorize } from "../middlewares/authMiddleware.js"; // Note the .js extension

const router = express.Router();

// Publicly accessible projects (only authenticated users who are part of the project see their specific projects)
// @route   GET /api/v1/projects - Get all projects (filtered by user role/membership)
// @access  Private (any authenticated user)
router.get("/", protect, getProjects);

// @route   GET /api/v1/projects/:id - Get a single project by ID
// @access  Private (any authenticated user who is a member/manager/admin of the project)
router.get("/:id", protect, getProject);

// Manager and Admin specific project routes (for creation, update, deletion)
// These routes typically use a specific prefix like '/managers/projects'
// as defined in server.js to differentiate from general project access routes.

// @route   POST /api/v1/managers/projects - Create a new project
// @access  Private/Manager, Admin
router.post("/managers", protect, authorize("manager", "admin"), createProject);

// @route   PUT /api/v1/managers/projects/:id - Update a project
// @access  Private/Manager, Admin (only lead manager or admin can update)
router.put(
  "/managers/:id",
  protect,
  authorize("manager", "admin"),
  updateProject
);

// @route   DELETE /api/v1/managers/projects/:id - Delete a project
// @access  Private/Manager, Admin (only lead manager or admin can delete)
router.delete(
  "/managers/:id",
  protect,
  authorize("manager", "admin"),
  deleteProject
);

export default router; // Export the router using ES Modules syntax

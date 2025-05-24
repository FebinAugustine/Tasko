// backend/routes/reportRoutes.js
import express from "express"; // No .js needed for npm packages
import {
  getTasksCompletedPerProject,
  getTeamWorkloadDistribution,
  getProjectCompletionRate,
} from "../controllers/reportController.js"; // Note the .js extension
import { protect, authorize } from "../middlewares/authMiddleware.js"; // Note the .js extension

const router = express.Router();

// All report routes require authentication and authorization for 'admin' or 'manager' roles

// @route   GET /api/v1/reports/tasks-completed-per-project
// @desc    Get report on completed tasks per project
// @access  Private/Admin, Manager
router.get(
  "/tasks-completed-per-project",
  protect,
  authorize("admin", "manager"),
  getTasksCompletedPerProject
);

// @route   GET /api/v1/reports/team-workload-distribution
// @desc    Get report on team workload distribution
// @access  Private/Admin, Manager
router.get(
  "/team-workload-distribution",
  protect,
  authorize("admin", "manager"),
  getTeamWorkloadDistribution
);

// @route   GET /api/v1/reports/project-completion-rate
// @desc    Get report on overall project completion rate
// @access  Private/Admin, Manager
router.get(
  "/project-completion-rate",
  protect,
  authorize("admin", "manager"),
  getProjectCompletionRate
);

export default router; // Export the router using ES Modules syntax

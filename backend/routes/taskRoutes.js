import express from "express"; // No .js needed for npm packages
import {
  getProjectTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
} from "../controllers/taskController.js"; // Note the .js extension
import { protect, authorize } from "../middlewares/authMiddleware.js"; // Note the .js extension

const router = express.Router();

// Base routes for tasks within a project
// @route   GET /api/v1/projects/:projectId/tasks - Get all tasks for a specific project
// @access  Private (any authenticated user who is a member/manager/admin of the project)
router.get("/projects/:projectId/tasks", protect, getProjectTasks);

// @route   POST /api/v1/projects/:projectId/tasks - Create a new task for a specific project
// @access  Private/Manager, Admin
router.post(
  "/projects/:projectId/tasks",
  protect,
  authorize("manager", "admin"),
  createTask
);

// Routes for individual tasks
// @route   GET /api/v1/tasks/:id - Get a single task by its ID
// @access  Private (any authenticated user who is a member/manager/admin of the project the task belongs to)
router.get("/:id", protect, getTask);

// @route   PUT /api/v1/tasks/:id - Update a task by its ID
// @access  Private/Manager, Admin, or Assignee
router.put("/:id", protect, updateTask);

// @route   DELETE /api/v1/tasks/:id - Delete a task by its ID
// @access  Private/Manager, Admin
router.delete("/:id", protect, authorize("manager", "admin"), deleteTask);

// Routes for task comments
// @route   POST /api/v1/tasks/:id/comments - Add a comment to a task
// @access  Private (any authenticated user who is a member/manager/admin of the project)
router.post("/:id/comments", protect, addComment);

// @route   DELETE /api/v1/tasks/:taskId/comments/:commentId - Delete a specific comment from a task
// @access  Private (comment creator, project lead manager, or Admin)
router.delete("/:taskId/comments/:commentId", protect, deleteComment);

export default router;

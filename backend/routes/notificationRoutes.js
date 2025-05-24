// backend/routes/notificationRoutes.js
import express from "express"; // No .js needed for npm packages
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notificationController.js"; // Note the .js extension
import { protect } from "../middlewares/authMiddleware.js"; // Note the .js extension

const router = express.Router();

// All notification routes require authentication (`protect`) as they are user-specific.

// @route   GET /api/v1/notifications
// @desc    Get all notifications for the authenticated user
// @access  Private
router.get("/", protect, getNotifications);

// @route   PUT /api/v1/notifications/:id/read
// @desc    Mark a specific notification as read
// @access  Private
router.put("/:id/read", protect, markNotificationAsRead);

// @route   PUT /api/v1/notifications/mark-all-read
// @desc    Mark all notifications for the authenticated user as read
// @access  Private
router.put("/mark-all-read", protect, markAllNotificationsAsRead);

// @route   DELETE /api/v1/notifications/:id
// @desc    Delete a specific notification
// @access  Private
router.delete("/:id", protect, deleteNotification);

export default router; // Export the router using ES Modules syntax

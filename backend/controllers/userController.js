// backend/controllers/userController.js
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// @desc    Get user dashboard data
// @route   GET /api/user/dashboard
// @access  Private/User
const getUserDashboard = asyncHandler(async (req, res) => {
  // In a real app, you'd fetch tasks specific to this user
  res.status(200).json({
    message: `Welcome to the User Dashboard, ${req.user.fullName}!`,
    tasks: [], // Placeholder for user-specific tasks
  });
});

export { getUserDashboard };

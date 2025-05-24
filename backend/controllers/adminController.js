// backend/controllers/adminController.js
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// @desc    Get admin dashboard data (e.g., all users)
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboard = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password"); // Get all users, exclude passwords
  res.status(200).json({
    message: `Welcome to the Admin Dashboard, ${req.user.fullName}!`,
    allUsers: users,
  });
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["user", "manager", "admin"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role specified");
  }

  const user = await User.findById(id);

  if (user) {
    user.role = role;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      message: `User ${updatedUser.username} role updated to ${updatedUser.role}`,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export { getAdminDashboard, updateUserRole };

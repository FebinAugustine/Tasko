import asyncHandler from "express-async-handler";
import User from "../models/User.js"; // Note the .js extension
import cloudinary from "../config/cloudinary.js"; // Note the .js extension for Cloudinary config

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin (or Manager, depending on your authMiddleware setup)
export const getUsers = asyncHandler(async (req, res) => {
  // Only allow admin or manager to access this
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    res.status(403);
    throw new Error("Not authorized to access user list");
  }

  const users = await User.find({}).select("-password"); // Exclude passwords
  res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc    Get single user by ID
// @route   GET /api/v1/users/:id
// @access  Private/Admin (or Manager, or self-access)
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Ensure only admin/manager can view others, or a user can view their own profile
  if (
    req.user.role !== "admin" &&
    req.user.role !== "manager" &&
    req.user._id.toString() !== user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to view this user profile");
  }

  res.status(200).json({ success: true, data: user });
});

// @desc    Update user role
// @route   PUT /api/v1/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res) => {
  // Only admin can change roles
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to update user roles");
  }

  const { role } = req.body;

  // Basic validation for role
  if (!role || !["user", "manager", "admin"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role specified. Must be user, manager, or admin.");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.role = role;
  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    data: {
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
    },
  });
});

// @desc    Upload user profile picture
// @route   POST /api/v1/users/upload-profile-picture
// @access  Private
export const uploadProfilePicture = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!req.body.image) {
    // Assuming base64 image string is sent in 'image' field
    res.status(400);
    throw new Error("No image data provided");
  }

  try {
    // If user already has a profile picture, delete the old one from Cloudinary first
    if (user.profilePicture && user.profilePicture.public_id) {
      await cloudinary.uploader.destroy(user.profilePicture.public_id);
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "profile_pictures", // Optional: organize uploads in a specific folder
      transformation: [
        { width: 200, height: 200, crop: "fill", gravity: "face" },
      ], // Optional: optimize image
    });

    user.profilePicture = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: {
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500);
    throw new Error("Failed to upload profile picture");
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete users");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("Cannot delete your own admin account");
  }

  // If user has a profile picture, delete it from Cloudinary
  if (user.profilePicture && user.profilePicture.public_id) {
    try {
      await cloudinary.uploader.destroy(user.profilePicture.public_id);
    } catch (cloudinaryError) {
      console.error(
        "Error deleting Cloudinary image during user deletion:",
        cloudinaryError
      );
      // Optionally, you might not throw here if core user deletion is more important
    }
  }

  await user.remove(); // Mongoose 6+ has .remove() which is an alias for deleteOne()
  // For Mongoose 7+, consider await User.deleteOne({ _id: req.params.id });

  res.status(200).json({ success: true, message: "User removed" });
});

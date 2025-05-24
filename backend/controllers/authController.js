import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Note the .js extension for ES Modules

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Simple validation
  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error("Please enter all fields");
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: role || "user", // Default role to 'user' if not provided
  });

  if (user) {
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter all fields");
  }

  // Check for user
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture, // Include profile picture
      token: generateToken(user._id),
    });
  } else {
    res.status(401); // Unauthorized
    throw new Error("Invalid credentials");
  }
});

// @desc    Get user profile (current user)
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  // req.user is set by the protect middleware
  const user = await User.findById(req.user._id).select("-password"); // Exclude password
  if (user) {
    res.status(200).json({
      success: true,
      data: user,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/v1/auth/me
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, profilePicture } = req.body; // profilePicture for Cloudinary URL

  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.profilePicture = profilePicture || user.profilePicture; // Update profile picture

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token expires in 30 days
  });
};

// backend/controllers/authController.js
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import validator from "validator"; // For sanitization
import dotenv from "dotenv";

dotenv.config();

// Helper to set JWT in an HTTP-only cookie
const setTokenCookie = (res, userId, role) => {
  const token = generateToken(userId, role);
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000, // 1 day in milliseconds
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password, confirmPassword } = req.body;

  // Sanitize inputs
  const sanitizedUsername = validator.escape(username);
  const sanitizedFullName = validator.escape(fullName);
  const sanitizedEmail = validator.normalizeEmail(email);

  if (
    !sanitizedUsername ||
    !sanitizedFullName ||
    !sanitizedEmail ||
    !password ||
    !confirmPassword
  ) {
    res.status(400);
    throw new Error("Please enter all fields");
  }

  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  if (!validator.isEmail(sanitizedEmail)) {
    res.status(400);
    throw new Error("Please enter a valid email address");
  }

  const userExists = await User.findOne({
    $or: [{ email: sanitizedEmail }, { username: sanitizedUsername }],
  });

  if (userExists) {
    res.status(400);
    throw new Error("User with this email or username already exists");
  }

  const user = await User.create({
    username: sanitizedUsername,
    fullName: sanitizedFullName,
    email: sanitizedEmail,
    password,
  });

  if (user) {
    setTokenCookie(res, user._id, user.role);
    res.status(201).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Sanitize email
  const sanitizedEmail = validator.normalizeEmail(email);

  if (!sanitizedEmail || !password) {
    res.status(400);
    throw new Error("Please enter email and password");
  }

  const user = await User.findOne({ email: sanitizedEmail });

  if (user && (await user.matchPassword(password))) {
    setTokenCookie(res, user._id, user.role);
    res.json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0), // Expire immediately
  });
  res.status(200).json({ message: "Logged out successfully" });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = {
    _id: req.user._id,
    username: req.user.username,
    fullName: req.user.fullName,
    email: req.user.email,
    role: req.user.role,
  };
  res.status(200).json(user);
});

export { registerUser, loginUser, logoutUser, getUserProfile, setTokenCookie };

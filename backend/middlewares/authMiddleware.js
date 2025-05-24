import jwt from "jsonwebtoken"; // No .js needed for npm packages
import asyncHandler from "express-async-handler"; // No .js needed for npm packages
import User from "../models/User.js"; // Note the .js extension for local modules

// Middleware to protect routes (authenticate user)
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for 'Authorization' header and if it starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token and attach to req object
      // Exclude password and other sensitive fields from the user object
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401); // Unauthorized
        throw new Error("Not authorized, user not found");
      }

      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error(error);
      res.status(401); // Unauthorized
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401); // Unauthorized
    throw new Error("Not authorized, no token");
  }
});

// Middleware to authorize users based on roles
// Takes an array of roles (e.g., ['admin', 'manager'])
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, user not authenticated"); // Should ideally be caught by 'protect' first
    }

    if (!roles.includes(req.user.role)) {
      res.status(403); // Forbidden
      throw new Error(
        `User role ${req.user.role} is not authorized to access this route`
      );
    }
    next();
  };
};

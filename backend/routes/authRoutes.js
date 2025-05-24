import express from "express"; // No .js needed for npm packages
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
} from "../controllers/authController.js"; // Note the .js extension
import { protect } from "../middlewares/authMiddleware.js"; // Note the .js extension

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private routes (require authentication)
router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile); // For updating profile details (excluding password and profile picture directly)

// Note: Profile picture upload is typically handled via userRoutes or userController
// as it's a specific user-related update, not just auth.
// E.g., router.post('/me/upload-picture', protect, uploadProfilePicture); in userRoutes

export default router; // Export the router using ES Modules syntax

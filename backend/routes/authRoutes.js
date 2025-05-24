// backend/routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  setTokenCookie, // Import for Google OAuth callback
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import passport from "../utils/googleOAuth.js"; // Import the configured passport

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser); // Protect logout to ensure a valid user is logging out
router.get("/profile", protect, getUserProfile);

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }), // session: false because we handle JWT ourselves
  (req, res) => {
    // Successful authentication, redirect or respond with token
    // req.user contains the user object from GoogleStrategy's done()
    setTokenCookie(res, req.user._id, req.user.role);
    res.redirect("http://localhost:3000/dashboard"); // Redirect to frontend dashboard or a success page
    // In a real app, you might want to send a JWT back to the client here,
    // or redirect to a page that fetches user info.
    // For simplicity, we are setting the cookie here.
  }
);

export default router;

// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors"; // For handling CORS with frontend
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import passport from "./utils/googleOAuth.js"; // Import passport for Google OAuth
import session from "express-session"; // Required for passport sessions

dotenv.config();

connectDB(); // Connect to MongoDB

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Body parser for raw JSON
app.use(express.urlencoded({ extended: true })); // Body parser for URL-encoded data
app.use(cookieParser()); // Cookie parser middleware

// CORS Configuration - IMPORTANT for frontend communication
// Adjust `origin` to your frontend's URL
app.use(
  cors({
    origin: "http://localhost:3000", // Your frontend URL
    credentials: true, // Allow cookies to be sent
  })
);

// Session middleware for Passport (even if not using full sessions for JWT, Passport might need it for initial auth flow)
app.use(
  session({
    secret: process.env.JWT_SECRET, // Use a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" }, // Secure cookies in production
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session()); // If you decide to use sessions for some parts of Passport

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/admin", adminRoutes);

// Basic home route
app.get("/", (req, res) => {
  res.send("Task Management API is running...");
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app };

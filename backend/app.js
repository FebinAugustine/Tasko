import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
// import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import { Server } from "socket.io"; // Import Server class from socket.io
import http from "http"; // Node.js built-in HTTP module
import { config } from "dotenv";

config();

const app = express();

// 1. Basic Express Middleware (should come first)
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));

// 2. Security Middleware
app.use(helmet());
app.use(compression());

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*", // Allow requests from specified origin or all for development
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Make `io` instance accessible throughout the app (e.g., in controllers)
app.set("io", io);

// 3. CORS Configuration (simplified - remove duplicate)
app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN || "http://localhost:5173",
      "https://your-production-domain.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);

// Middleware to parse JSON request bodies
app.use(express.json());

// 4. Rate Limiting (after CORS but before routes)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 500, // limit each IP to 500 requests per windowMs
//   standardHeaders: true, // Return rate limit info in headers
//   legacyHeaders: false, // Disable X-RateLimit-* headers
// });
// app.use(limiter);

// 5. API Routes declaration
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes); // General user routes, including profile picture upload
// app.use("/api/v1/admin", userRoutes); // Admin-specific user routes handled by userRoutes
app.use("/api/v1/projects", projectRoutes); // General project routes (e.g., GET single project, GET project tasks)
app.use("/api/v1/managers", projectRoutes); // Manager/Admin specific project routes (create, update, delete project)
app.use("/api/v1/tasks", taskRoutes); // All task routes
app.use("/api/v1/reports", reportRoutes); // All report routes
app.use("/api/v1/notifications", notificationRoutes); // All notification routes

// Socket.IO Connection Logic
io.on("connection", (socket) => {
  console.log(`Socket.IO: User connected - ${socket.id}`.green);

  // Join a specific project room
  socket.on("join_project", (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(
      `Socket.IO: User ${socket.id} joined project room: project-${projectId}`
        .blue
    );
  });

  // Join a specific task room (for detailed task updates)
  socket.on("join_task", (taskId) => {
    socket.join(`task-${taskId}`);
    console.log(
      `Socket.IO: User ${socket.id} joined task room: task-${taskId}`.blue
    );
  });

  socket.on("disconnect", () => {
    console.log(`Socket.IO: User disconnected - ${socket.id}`.red);
  });
});

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

export { app };

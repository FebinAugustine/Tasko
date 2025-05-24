import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
// import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
// import { errorHandler } from "./middleware/error.js";

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

// 3. CORS Configuration (simplified - remove duplicate)
app.use(
  cors({
    origin: ["http://localhost:5173", "https://your-production-domain.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);

// 4. Rate Limiting (after CORS but before routes)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 500, // limit each IP to 500 requests per windowMs
//   standardHeaders: true, // Return rate limit info in headers
//   legacyHeaders: false, // Disable X-RateLimit-* headers
// });
// app.use(limiter);

// Routes import
// import authRouter from "./routes/authRoutes.js";
// import todoRouter from "./routes/todoRoutes.js";
// import userRouter from "./routes/userRoutes.js";

// 5. Routes declaration
// app.use("/api/v1/auth", authRouter);
// app.use("/api/v1/todos", todoRouter);
// app.use("/api/v1/users", userRouter);

// 6. Error handling middleware (MUST be last)
// app.use(errorHandler);

export { app };

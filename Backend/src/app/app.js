import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "../config/config.js";
import authRoutes from "../routes/auth.routes.js";
import userRoutes from "../routes/user.routes.js";
import adminRoutes from "../routes/admin.routes.js";
import {
  notFoundHandler,
  errorHandler,
} from "../middlewares/error.middleware.js";

// 1. Initialize Express App
const app = express();

// 2. Middlewares
app.use(
  cors({
    origin: config.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// 4. Test & Health Check Routes
app.get("/", (req, res) => {
  res.send("TeamSync Backend API is running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "Server is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

// 5. Centralized Error Handling Middlewares (Must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

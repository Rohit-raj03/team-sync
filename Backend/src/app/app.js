import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "../config/config.js";
import authRoutes from "../routes/auth.routes.js";
import userRoutes from "../routes/user.routes.js";
import adminRoutes from "../routes/admin.routes.js";
import teamRoutes from "../routes/team.routes.js";
import projectRoutes from "../routes/project.routes.js";
import taskRoutes from "../routes/task.routes.js";
import notificationRoutes from "../routes/notification.routes.js";
import mediaRoutes from "../routes/media.routes.js";
import {
  notFoundHandler,
  errorHandler,
} from "../middlewares/error.middleware.js";

// 1. Initialize Express App
const app = express();

// 2. Middlewares
const allowedOrigins = [
  config.CLIENT_URL?.replace(/\/$/, ""),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://localhost:5050",
  "https://team-sync-liart-ten.vercel.app/",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes(origin.replace(/\/$/, ""))
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// 3. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/media", mediaRoutes);

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

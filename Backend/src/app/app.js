import express from "express";
import cors from "cors";
import config from "../config/config.js";
import authRoutes from "../routes/auth.routes.js";
// 1. Initialize Express App
const app = express();

// 2. Middlewares
app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);

// 3. Test Route
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

export default app;

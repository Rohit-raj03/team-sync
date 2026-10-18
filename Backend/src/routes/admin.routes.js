import express from "express";
import {
  getAdminStats,
  getAllAdminUsers,
  createAdminUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} from "../controllers/admin.controller.js";
import { protect, requireAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authenticated Admin session
router.use(protect, requireAdmin);

router.get("/stats", getAdminStats);
router.get("/users", getAllAdminUsers);
router.post("/users", createAdminUser);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/status", toggleUserStatus);
router.delete("/users/:id", deleteUser);

export default router;


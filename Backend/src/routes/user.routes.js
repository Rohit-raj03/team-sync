import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protected user routes
router.use(protect);

router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.get("/", getAllUsers);
router.get("/:id", getUserById);

export default router;


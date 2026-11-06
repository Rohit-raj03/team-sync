import express from "express";
import { deleteImageKitFile } from "../controllers/imagekit.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Delete file from ImageKit by fileId: DELETE /api/imagekit/file/:fileId
router.delete("/file/:fileId", deleteImageKitFile);

// Also support shorthand DELETE /api/imagekit/:fileId
router.delete("/:fileId", deleteImageKitFile);

export default router;


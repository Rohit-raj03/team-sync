import express from "express";
import {
  genericUpload,
  genericDelete,
} from "../controllers/media.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(protect);

// Generic media upload (e.g. attachments, screenshots)
router.post("/upload", uploadSingleImage("image"), genericUpload);

// Generic media delete by fileId
router.delete("/:fileId", genericDelete);

export default router;


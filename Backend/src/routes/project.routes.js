import express from "express";
import ProjectModel from "../models/project.model.js";
import {
  updateProjectCover,
  deleteProjectCover,
} from "../controllers/media.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(protect);

// Project Cover Image Endpoints
router.patch("/:projectId/image", uploadSingleImage("image"), updateProjectCover);
router.delete("/:projectId/image", deleteProjectCover);

// Standard Project Read Endpoints
router.get("/", async (req, res) => {
  try {
    const projects = await ProjectModel.find({
      $or: [
        { manager: req.user._id },
        { members: req.user._id },
        ...(req.user.role === "admin" ? [{}] : []),
      ],
    }).populate("manager", "name email avatar");

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error fetching projects",
    });
  }
});

router.get("/:projectId", async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.projectId)
      .populate("manager", "name email avatar")
      .populate("members", "name email avatar jobTitle");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error fetching project",
    });
  }
});

export default router;


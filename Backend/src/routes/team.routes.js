import express from "express";
import TeamModel from "../models/team.model.js";
import {
  updateTeamLogo,
  deleteTeamLogo,
} from "../controllers/media.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadSingleImage } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(protect);

// Team Logo Endpoints
router.patch("/:teamId/image", uploadSingleImage("image"), updateTeamLogo);
router.delete("/:teamId/image", deleteTeamLogo);

// Standard Team Read Endpoints
router.get("/", async (req, res) => {
  try {
    const teams = await TeamModel.find({
      $or: [
        { owner: req.user._id },
        { "members.user": req.user._id },
        ...(req.user.role === "admin" ? [{}] : []),
      ],
    }).populate("owner", "name email avatar");

    return res.status(200).json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error fetching teams",
    });
  }
});

router.get("/:teamId", async (req, res) => {
  try {
    const team = await TeamModel.findById(req.params.teamId)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar jobTitle");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error fetching team",
    });
  }
});

export default router;


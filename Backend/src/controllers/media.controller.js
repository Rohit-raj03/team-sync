import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import TeamModel from "../models/team.model.js";
import ProjectModel from "../models/project.model.js";
import {
  uploadImage,
  deleteImage,
  safeCleanupFile,
  MEDIA_FOLDERS,
} from "../services/imagekit.service.js";

/**
 * Validates MongoDB ObjectId
 * @param {string} id
 * @returns {boolean}
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @desc    Upload or replace the authenticated user's profile avatar
 * @route   PATCH /api/users/profile/image
 * @access  Private (Current User)
 */
export const updateProfileAvatar = async (req, res) => {
  let uploadedMedia = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Please upload an image using field 'image'.",
      });
    }

    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    const oldFileId = user.avatarFileId;

    // 1. Upload new image to ImageKit
    uploadedMedia = await uploadImage({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.verifiedMimeType || req.file.mimetype,
      folder: MEDIA_FOLDERS.PROFILES,
      tags: ["avatar", "user", user._id.toString()],
      customFileName: null,
    });

    // 2. Persist to MongoDB
    user.avatar = uploadedMedia.url;
    user.avatarFileId = uploadedMedia.fileId;

    await user.save();

    // 3. Clean up the replaced old file only AFTER DB write succeeds
    if (oldFileId && oldFileId !== uploadedMedia.fileId) {
      safeCleanupFile(oldFileId);
    }

    return res.status(200).json({
      success: true,
      message: "Profile avatar updated successfully",
      data: {
        url: uploadedMedia.url,
        fileId: uploadedMedia.fileId,
      },
      user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        avatarFileId: user.avatarFileId,
      },
    });
  } catch (error) {
    // Two-Phase Rollback: If DB write fails, delete the newly uploaded file to avoid orphaned storage
    if (uploadedMedia?.fileId) {
      console.warn(
        `⚠️ DB operation failed after upload. Rolling back ImageKit file: ${uploadedMedia.fileId}`
      );
      await safeCleanupFile(uploadedMedia.fileId);
    }

    console.error("updateProfileAvatar error:", error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update profile avatar",
    });
  }
};

/**
 * @desc    Remove the authenticated user's profile avatar
 * @route   DELETE /api/users/profile/image
 * @access  Private (Current User)
 */
export const deleteProfileAvatar = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    const oldFileId = user.avatarFileId;

    if (!user.avatar && !oldFileId) {
      return res.status(200).json({
        success: true,
        message: "No avatar is currently set for this user.",
      });
    }

    // 1. Update Database
    user.avatar = "";
    user.avatarFileId = "";
    await user.save();

    // 2. Delete from ImageKit
    if (oldFileId) {
      await deleteImage(oldFileId);
    }

    return res.status(200).json({
      success: true,
      message: "Profile avatar removed successfully",
    });
  } catch (error) {
    console.error("deleteProfileAvatar error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete profile avatar",
    });
  }
};

/**
 * @desc    Upload or replace a team logo
 * @route   PATCH /api/teams/:teamId/image
 * @access  Private (Team Owner, Team Admin, or Platform Admin)
 */
export const updateTeamLogo = async (req, res) => {
  let uploadedMedia = null;

  try {
    const { teamId } = req.params;

    if (!isValidObjectId(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Please upload an image using field 'image'.",
      });
    }

    const team = await TeamModel.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found.",
      });
    }

    // Verify authorization: Platform Admin or Team Owner/Manager
    const canManage = team.canManageTeam
      ? team.canManageTeam(req.user._id, req.user.role)
      : req.user.role === "admin" || team.owner?.toString() === req.user._id.toString();

    if (!canManage) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You are not authorized to modify this team's logo.",
      });
    }

    const oldFileId = team.logoFileId;

    // 1. Upload to ImageKit
    uploadedMedia = await uploadImage({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.verifiedMimeType || req.file.mimetype,
      folder: MEDIA_FOLDERS.TEAMS,
      tags: ["team", "logo", teamId],
    });

    // 2. Update Database
    team.logo = uploadedMedia.url;
    team.logoFileId = uploadedMedia.fileId;
    await team.save();

    // 3. Clean up replaced old file
    if (oldFileId && oldFileId !== uploadedMedia.fileId) {
      safeCleanupFile(oldFileId);
    }

    return res.status(200).json({
      success: true,
      message: "Team logo updated successfully",
      data: {
        url: uploadedMedia.url,
        fileId: uploadedMedia.fileId,
      },
      team: {
        id: team._id,
        name: team.name,
        logo: team.logo,
        logoFileId: team.logoFileId,
      },
    });
  } catch (error) {
    if (uploadedMedia?.fileId) {
      await safeCleanupFile(uploadedMedia.fileId);
    }

    console.error("updateTeamLogo error:", error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update team logo",
    });
  }
};

/**
 * @desc    Remove a team logo
 * @route   DELETE /api/teams/:teamId/image
 * @access  Private (Team Owner, Team Admin, or Platform Admin)
 */
export const deleteTeamLogo = async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!isValidObjectId(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format.",
      });
    }

    const team = await TeamModel.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found.",
      });
    }

    const canManage = team.canManageTeam
      ? team.canManageTeam(req.user._id, req.user.role)
      : req.user.role === "admin" || team.owner?.toString() === req.user._id.toString();

    if (!canManage) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You are not authorized to remove this team's logo.",
      });
    }

    const oldFileId = team.logoFileId;

    if (!team.logo && !oldFileId) {
      return res.status(200).json({
        success: true,
        message: "No logo is currently set for this team.",
      });
    }

    team.logo = "";
    team.logoFileId = "";
    await team.save();

    if (oldFileId) {
      await deleteImage(oldFileId);
    }

    return res.status(200).json({
      success: true,
      message: "Team logo removed successfully",
    });
  } catch (error) {
    console.error("deleteTeamLogo error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete team logo",
    });
  }
};

/**
 * @desc    Upload or replace a project cover image / thumbnail
 * @route   PATCH /api/projects/:projectId/image
 * @access  Private (Project Manager or Platform Admin)
 */
export const updateProjectCover = async (req, res) => {
  let uploadedMedia = null;

  try {
    const { projectId } = req.params;

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Please upload an image using field 'image'.",
      });
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const canManage = project.canManageProject
      ? project.canManageProject(req.user._id, req.user.role)
      : req.user.role === "admin" || project.manager?.toString() === req.user._id.toString();

    if (!canManage) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Only the project manager or an administrator can update this project's cover image.",
      });
    }

    const oldFileId = project.coverImageFileId;

    // 1. Upload to ImageKit
    uploadedMedia = await uploadImage({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.verifiedMimeType || req.file.mimetype,
      folder: MEDIA_FOLDERS.PROJECTS,
      tags: ["project", "cover", projectId],
    });

    // 2. Update Database
    project.coverImage = uploadedMedia.url;
    project.coverImageFileId = uploadedMedia.fileId;
    await project.save();

    // 3. Clean up replaced old file
    if (oldFileId && oldFileId !== uploadedMedia.fileId) {
      safeCleanupFile(oldFileId);
    }

    return res.status(200).json({
      success: true,
      message: "Project cover image updated successfully",
      data: {
        url: uploadedMedia.url,
        fileId: uploadedMedia.fileId,
      },
      project: {
        id: project._id,
        name: project.name,
        coverImage: project.coverImage,
        coverImageFileId: project.coverImageFileId,
      },
    });
  } catch (error) {
    if (uploadedMedia?.fileId) {
      await safeCleanupFile(uploadedMedia.fileId);
    }

    console.error("updateProjectCover error:", error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update project cover image",
    });
  }
};

/**
 * @desc    Remove a project cover image
 * @route   DELETE /api/projects/:projectId/image
 * @access  Private (Project Manager or Platform Admin)
 */
export const deleteProjectCover = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format.",
      });
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const canManage = project.canManageProject
      ? project.canManageProject(req.user._id, req.user.role)
      : req.user.role === "admin" || project.manager?.toString() === req.user._id.toString();

    if (!canManage) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Only the project manager or an administrator can remove this project's cover image.",
      });
    }

    const oldFileId = project.coverImageFileId;

    if (!project.coverImage && !oldFileId) {
      return res.status(200).json({
        success: true,
        message: "No cover image is currently set for this project.",
      });
    }

    project.coverImage = "";
    project.coverImageFileId = "";
    await project.save();

    if (oldFileId) {
      await deleteImage(oldFileId);
    }

    return res.status(200).json({
      success: true,
      message: "Project cover image removed successfully",
    });
  } catch (error) {
    console.error("deleteProjectCover error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete project cover image",
    });
  }
};

/**
 * @desc    Generic media upload for attachments/workspace media
 * @route   POST /api/media/upload
 * @access  Private
 */
export const genericUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Please upload an image using field 'image'.",
      });
    }

    const folder = req.body.folder || MEDIA_FOLDERS.GENERAL;

    const result = await uploadImage({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.verifiedMimeType || req.file.mimetype,
      folder,
      tags: ["general", req.user._id.toString()],
    });

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: result.url,
        fileId: result.fileId,
        name: result.name,
        size: result.size,
        filePath: result.filePath,
      },
    });
  } catch (error) {
    console.error("genericUpload error:", error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Media upload failed",
    });
  }
};

/**
 * @desc    Generic media delete by fileId
 * @route   DELETE /api/media/:fileId
 * @access  Private (Admin or authorized uploader)
 */
export const genericDelete = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "File ID is required.",
      });
    }

    await deleteImage(fileId);

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully from ImageKit",
    });
  } catch (error) {
    console.error("genericDelete error:", error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete image",
    });
  }
};

export default {
  updateProfileAvatar,
  deleteProfileAvatar,
  updateTeamLogo,
  deleteTeamLogo,
  updateProjectCover,
  deleteProjectCover,
  genericUpload,
  genericDelete,
};


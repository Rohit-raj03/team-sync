import UserModel from "../models/user.model.js";
import {
  uploadImage,
  safeCleanupFile,
  MEDIA_FOLDERS,
} from "../services/imagekit.service.js";

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("getUserProfile error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching user profile",
    });
  }
};

/**
 * @desc    Update current user profile (Supports both JSON & multipart image upload)
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  let uploadedMedia = null;

  try {
    const user = await UserModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      name,
      phone,
      bio,
      jobTitle,
      location,
      timezone,
      avatar,
      twoFactorEnabled,
    } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (jobTitle !== undefined) user.jobTitle = jobTitle.trim();
    if (location !== undefined) user.location = location.trim();
    if (timezone !== undefined) user.timezone = timezone.trim();
    if (twoFactorEnabled !== undefined) {
      user.twoFactorEnabled =
        typeof twoFactorEnabled === "string"
          ? twoFactorEnabled === "true"
          : Boolean(twoFactorEnabled);
    }

    const oldFileId = user.avatarFileId;

    // Handle image file if uploaded in multipart/form-data
    if (req.file) {
      uploadedMedia = await uploadImage({
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.verifiedMimeType || req.file.mimetype,
        folder: MEDIA_FOLDERS.PROFILES,
        tags: ["avatar", "user", user._id.toString()],
      });

      user.avatar = uploadedMedia.url;
      user.avatarFileId = uploadedMedia.fileId;
    } else if (avatar !== undefined) {
      user.avatar = avatar;
    }

    const updatedUser = await user.save();

    // Clean up replaced old file if a new file was uploaded
    if (uploadedMedia?.fileId && oldFileId && oldFileId !== uploadedMedia.fileId) {
      safeCleanupFile(oldFileId);
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        jobTitle: updatedUser.jobTitle,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
        location: updatedUser.location,
        timezone: updatedUser.timezone,
        avatar: updatedUser.avatar,
        avatarFileId: updatedUser.avatarFileId,
        twoFactorEnabled: updatedUser.twoFactorEnabled,
      },
    });
  } catch (error) {
    if (uploadedMedia?.fileId) {
      await safeCleanupFile(uploadedMedia.fileId);
    }

    console.error("updateUserProfile error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Server error updating user profile",
    });
  }
};


/**
 * @desc    Get all active users (for team directory & task assignees)
 * @route   GET /api/users
 * @access  Private
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find({ isActive: true })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("getAllUsers error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching users",
    });
  }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("getUserById error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching user",
    });
  }
};


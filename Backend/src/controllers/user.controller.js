import UserModel from "../models/user.model.js";

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
 * @desc    Update current user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
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
    if (avatar !== undefined) user.avatar = avatar;
    if (twoFactorEnabled !== undefined) user.twoFactorEnabled = twoFactorEnabled;

    const updatedUser = await user.save();

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
        twoFactorEnabled: updatedUser.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error("updateUserProfile error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error updating user profile",
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


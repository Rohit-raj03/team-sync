import UserModel from "../models/user.model.js";

/**
 * @desc    Get Admin Dashboard Telemetry & User Stats
 * @route   GET /api/admin/stats
 * @access  Private / Admin
 */
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const activeUsers = await UserModel.countDocuments({ isActive: true });
    const inactiveUsers = await UserModel.countDocuments({ isActive: false });
    const totalAdmins = await UserModel.countDocuments({ role: "admin" });
    const totalMembers = await UserModel.countDocuments({
      role: { $in: ["user", "member"] },
    });
    const totalManagers = await UserModel.countDocuments({ role: "manager" });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalAdmins,
        totalMembers,
        totalManagers,
      },
    });
  } catch (error) {
    console.error("getAdminStats error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching admin statistics",
    });
  }
};

/**
 * @desc    Get all users for Admin management (with search & filter)
 * @route   GET /api/admin/users
 * @access  Private / Admin
 */
export const getAllAdminUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "all") {
      query.role = role.toLowerCase();
    }

    if (status && status !== "all") {
      query.isActive = status === "active";
    }

    const users = await UserModel.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("getAllAdminUsers error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching users list",
    });
  }
};

/**
 * @desc    Change a user's role (promote/demote: admin, user, manager, member)
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private / Admin
 */
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid role ('admin', 'user', 'manager', or 'member')",
      });
    }

    const normalizedRole = role.toLowerCase().trim();
    const validRoles = ["admin", "user", "member", "manager"];

    if (!validRoles.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Role must be 'admin' or 'user'",
      });
    }

    // Safety: prevent admin from demoting themselves directly to avoid lockout
    if (id === req.user._id.toString() && normalizedRole !== "admin") {
      return res.status(400).json({
        success: false,
        message: "You cannot demote your own admin account.",
      });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = normalizedRole;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role successfully updated to '${user.role}'`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("updateUserRole error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error updating user role",
    });
  }
};

/**
 * @desc    Activate or Deactivate a user
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private / Admin
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own admin account.",
      });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If explicit isActive boolean provided, use it; otherwise toggle current status
    user.isActive = typeof isActive === "boolean" ? isActive : !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account is now ${user.isActive ? "Active" : "Deactivated"}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("toggleUserStatus error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error changing user status",
    });
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private / Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account.",
      });
    }

    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `User '${user.name}' has been successfully deleted.`,
    });
  } catch (error) {
    console.error("deleteUser error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error deleting user",
    });
  }
};


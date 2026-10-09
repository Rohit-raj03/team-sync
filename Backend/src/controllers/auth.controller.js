import crypto from "node:crypto";
import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

/**
 * @desc    Register a new user (with role: admin / user / member)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, jobTitle } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await UserModel.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // Role validation: support 'admin' and 'user' / 'member' / 'manager'
    let userRole = "user";
    if (role) {
      const normalizedRole = role.toLowerCase().trim();
      const validRoles = ["admin", "user", "member", "manager"];
      if (!validRoles.includes(normalizedRole)) {
        return res.status(400).json({
          message: "Invalid role. Role must be 'admin' or 'user'",
        });
      }
      userRole = normalizedRole;
    }

    const user = await UserModel.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: userRole,
      jobTitle: jobTitle || (userRole === "admin" ? "Administrator" : "Team Member"),
    });

    const accessToken = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      config.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      },
    );

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        jobTitle: user.jobTitle,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * @desc    Login user & get access token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      config.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      },
    );

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        jobTitle: user.jobTitle,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * @desc    Get currently logged in user session
 * @route   GET /api/auth/me
 * @access  Private (Bearer token)
 */
export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GetMe error:", error.message);
    res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * @desc    Forgot Password - Request reset link
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Please enter your email address",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: cleanEmail });

    // Security practice: Always return generic success message to prevent user enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email exists in our system, we've sent a password reset link.",
      });
    }

    // 1. Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2. Hash token and save to DB with 15-minute expiry
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save({ validateBeforeSave: false });

    // 3. Create Reset URL
    const clientUrl = config.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    // Log to console for development & local testing
    console.log("==========================================");
    console.log(`🔐 PASSWORD RESET LINK FOR [${user.email}]:`);
    console.log(resetUrl);
    console.log("==========================================");

    return res.status(200).json({
      success: true,
      message: "If that email exists in our system, we've sent a password reset link.",
      // Development mode helper
      ...(config.NODE_ENV !== "production" && { resetUrl, resetToken }),
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    return res.status(500).json({
      message: "Server error processing password reset request",
    });
  }
};

/**
 * @desc    Reset Password using token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash the token received to compare with stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid matching unexpired token
    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Password reset link is invalid or has expired",
      });
    }

    // Update password (pre-save hook will hash it automatically)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been successfully reset. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);
    return res.status(500).json({
      message: "Server error resetting password",
    });
  }
};
